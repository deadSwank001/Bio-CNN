# Sample explorer

Open `index.html` in a modern browser, or serve this directory with
`python -m http.server` and visit `http://localhost:8000`. Choose the demo
data or load a CSV with `sample`, `band_sharpness` (0–1), and `a260_a280`
(nonnegative). `variant_probability` is optional and must be between 0 and 1.
CSV files are processed locally and are not uploaded.

The k-means chart standardizes both features and groups samples without
assigning quality labels. Probability values are supplied by the CSV; this
dashboard does not run a CNN or parse FASTQ/VCF files. It is an exploratory
research prototype, not a validated diagnostic or clinical tool.

Run the input and clustering checks with `node --test analysis.test.js`.
