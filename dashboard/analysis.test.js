const test = require("node:test");
const assert = require("node:assert/strict");
const { parseCSV, readSamples, cluster } = require("./analysis.js");

test("reads quoted fields and optional scores", () => {
  const data = readSamples('sample,band_sharpness,a260_a280,variant_probability\r\n"A, 1",0.5,1.8,0.25\r\n');
  assert.equal(data[0].sample, "A, 1");
  assert.equal(data[0].variant_probability, 0.25);
});
test("rejects malformed or invalid input", () => {
  assert.throws(() => parseCSV('"unclosed'));
  assert.throws(() => readSamples("sample,band_sharpness,a260_a280\nA,,1.8"));
  assert.throws(() => readSamples("sample,band_sharpness,a260_a280,variant_probability\nA,0.5,1.8,2"));
});
test("clusters distinct points and handles identical measurements", () => {
  const points = readSamples("sample,band_sharpness,a260_a280\nA,0,1\nB,0,1\nC,1,2");
  const labels = cluster(points, 3);
  assert.equal(labels[0], labels[1]);
  assert.notEqual(labels[0], labels[2]);
  assert.deepEqual(cluster(points, 3), labels);
});
