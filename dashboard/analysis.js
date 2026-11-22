(function (root) {
  "use strict";

  function parseCSV(text) {
    const rows = [];
    let row = [], field = "", quoted = false, closed = false;
    text = text.replace(/^\uFEFF/, "");
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (ch === '"') { quoted = false; closed = true; }
        else field += ch;
      } else if (ch === '"' && field === "" && !closed) {
        quoted = true;
      } else if (ch === "," || ch === "\n" || ch === "\r") {
        row.push(field); field = ""; closed = false;
        if (ch !== ",") {
          if (ch === "\r" && text[i + 1] === "\n") i++;
          if (row.some(value => value.trim() !== "")) rows.push(row);
          row = [];
        }
      } else {
        if (closed || ch === '"') throw new Error("Malformed quoted CSV field.");
        field += ch;
      }
    }
    if (quoted) throw new Error("Unclosed quoted CSV field.");
    if (field !== "" || row.length) {
      row.push(field);
      if (row.some(value => value.trim() !== "")) rows.push(row);
    }
    return rows;
  }

  function readSamples(text) {
    const rows = parseCSV(text);
    if (rows.length < 2) throw new Error("CSV must contain a header and at least one sample.");
    const headers = rows[0].map(value => value.trim());
    const required = ["sample", "band_sharpness", "a260_a280"];
    if (new Set(headers).size !== headers.length || required.some(name => !headers.includes(name))) {
      throw new Error("CSV requires unique sample, band_sharpness, and a260_a280 columns.");
    }
    return rows.slice(1).map((row, index) => {
      if (row.length !== headers.length) throw new Error(`Row ${index + 2} has the wrong number of columns.`);
      const obj = Object.fromEntries(headers.map((name, i) => [name, row[i].trim()]));
      if (!obj.sample) throw new Error(`Row ${index + 2} needs a sample name.`);
      for (const key of ["band_sharpness", "a260_a280"]) {
        if (obj[key] === "" || !Number.isFinite(Number(obj[key]))) throw new Error(`Row ${index + 2}: ${key} must be numeric.`);
        obj[key] = Number(obj[key]);
      }
      if (obj.band_sharpness < 0 || obj.band_sharpness > 1 || obj.a260_a280 < 0) {
        throw new Error(`Row ${index + 2}: sharpness must be 0–1 and ratio must be nonnegative.`);
      }
      if (obj.variant_probability !== undefined && obj.variant_probability !== "") {
        const probability = Number(obj.variant_probability);
        if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
          throw new Error(`Row ${index + 2}: variant_probability must be 0–1.`);
        }
        obj.variant_probability = probability;
      } else obj.variant_probability = null;
      return obj;
    });
  }

  function cluster(samples, requestedK) {
    if (!samples.length || !Number.isInteger(requestedK) || requestedK < 1) throw new Error("Provide samples and a positive cluster count.");
    const points = samples.map(s => [s.band_sharpness, s.a260_a280]);
    const means = [0, 1].map(axis => points.reduce((sum, p) => sum + p[axis], 0) / points.length);
    const scales = means.map((mean, axis) => Math.sqrt(points.reduce((sum, p) => sum + (p[axis] - mean) ** 2, 0) / points.length) || 1);
    const normalized = points.map(p => p.map((v, axis) => (v - means[axis]) / scales[axis]));
    const distinct = [...new Map(normalized.map(p => [p.join(","), p])).values()];
    const k = Math.min(requestedK, distinct.length);
    const centers = [distinct[0].slice()];
    const distance = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
    while (centers.length < k) {
      const next = distinct.reduce((best, point) => {
        const score = Math.min(...centers.map(center => distance(point, center)));
        return score > best.score ? { point, score } : best;
      }, { point: null, score: -1 });
      centers.push(next.point.slice());
    }
    let labels = [];
    for (let iteration = 0; iteration < 100; iteration++) {
      const next = normalized.map(point => centers.reduce((best, center, i) =>
        distance(point, center) < best.distance ? { index: i, distance: distance(point, center) } : best,
      { index: 0, distance: Infinity }).index);
      if (next.every((label, i) => label === labels[i]) && labels.length === next.length) break;
      labels = next;
      for (let i = 0; i < k; i++) {
        const members = normalized.filter((_, n) => labels[n] === i);
        if (members.length) centers[i] = [0, 1].map(axis => members.reduce((sum, p) => sum + p[axis], 0) / members.length);
      }
    }
    return labels;
  }

  const api = { parseCSV, readSamples, cluster };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.BioAnalysis = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
