"use strict";

const demo = `sample,band_sharpness,a260_a280,variant_probability
Sample A,0.82,1.81,0.14
Sample B,0.75,1.89,0.62
Sample C,0.24,1.51,0.08
Sample D,0.35,1.57,0.27
Sample E,0.68,2.1,0.91
Sample F,0.57,2.04,`;
const colors = ["#65e0c3", "#ffa76c", "#ad9dff", "#ff76a7"];
const status = document.getElementById("status");
const plot = document.getElementById("plot");
const rows = document.getElementById("rows");
let samples = [];

function svg(tag, attributes, text) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  if (text !== undefined) node.textContent = text;
  plot.appendChild(node);
  return node;
}

function render() {
  const labels = BioAnalysis.cluster(samples, Number(document.getElementById("clusters").value));
  plot.replaceChildren(); rows.replaceChildren();
  const maxY = Math.max(2.2, ...samples.map(sample => sample.a260_a280)) * 1.1;
  const x = value => 65 + value * 650;
  const y = value => 360 - value / maxY * 315;
  svg("line", { x1: 65, y1: 360, x2: 715, y2: 360, stroke: "#8294aa" });
  svg("line", { x1: 65, y1: 45, x2: 65, y2: 360, stroke: "#8294aa" });
  svg("text", { x: 345, y: 405, fill: "#bdcbe0" }, "Band sharpness (0–1)");
  svg("text", { x: 70, y: 25, fill: "#bdcbe0" }, `A260/A280 ratio (0–${maxY.toFixed(2)})`);
  samples.forEach((sample, i) => {
    const circle = svg("circle", { cx: x(sample.band_sharpness), cy: y(sample.a260_a280), r: 7, fill: colors[labels[i]], opacity: ".85" });
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = `${sample.sample}: cluster ${labels[i] + 1}`;
    circle.appendChild(title);
    const tr = document.createElement("tr");
    [sample.sample, sample.band_sharpness.toFixed(2), sample.a260_a280.toFixed(2), String(labels[i] + 1),
      sample.variant_probability === null ? "—" : sample.variant_probability.toFixed(3)].forEach(value => {
      const cell = document.createElement("td"); cell.textContent = value; tr.appendChild(cell);
    });
    rows.appendChild(tr);
  });
  const legend = document.getElementById("legend");
  legend.replaceChildren();
  [...new Set(labels)].sort().forEach(i => {
    const item = document.createElement("span");
    item.style.color = colors[i];
    item.style.marginRight = "1.25rem";
    item.textContent = `● Cluster ${i + 1}`;
    legend.appendChild(item);
  });
  status.textContent = `${samples.length} samples loaded. ${new Set(labels).size} clusters shown.`;
}

function load(text) {
  try { const parsed = BioAnalysis.readSamples(text); samples = parsed; render(); }
  catch (error) { status.textContent = `Could not load data: ${error.message}`; }
}
document.getElementById("demo").addEventListener("click", () => load(demo));
document.getElementById("clusters").addEventListener("change", () => { if (samples.length) render(); });
document.getElementById("file").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;
  try { load(await file.text()); } catch (error) { status.textContent = `Could not read file: ${error.message}`; }
});
load(demo);
