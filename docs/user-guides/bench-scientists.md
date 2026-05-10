---
layout: docs
title: Guide for Bench Scientists
description: How to register experiments, upload data, and view results in bioAF.
---

This guide covers the day-to-day workflow for bench scientists using bioAF. Everything here happens in your web browser, no command line or coding required.

## Registering an experiment

1. Click **New Experiment** from the Experiments page
2. Fill in the experiment metadata:
   - Name and description
   - Organism and tissue type
   - Chemistry (e.g., 10x Chromium 3' v3)
   - Any relevant experimental conditions
3. Click **Create**

<img src="{{ '/assets/images/screenshot-experiment-description.png' | relative_url }}" alt="New Experiment form with metadata fields" class="screenshot-img">

bioAF uses [MINSEQE-compliant](https://doi.org/10.1038/nbt1556) metadata standards so your experiments are publication-ready from the start.

{% include info-bubble.html title="What is MINSEQE?" content="MINSEQE (Minimum Information about a high-throughput Nucleotide SeQuencing Experiment) is a community standard for the metadata you should record about a sequencing experiment. bioAF's experiment form is built around this standard so you capture everything you'll need for publications, GEO submissions, or regulatory review." %}

## Adding samples

1. Open your experiment and click **Add Samples**
2. For each sample, enter:
   - Sample name and description
   - Tissue type and cell type
   - Treatment conditions
   - Any custom metadata fields
3. You can add samples one at a time or batch upload from a spreadsheet

<img src="{{ '/assets/images/screenshot-experiment-sample-view.png' | relative_url }}" alt="Sample table showing batch of samples with metadata columns" class="screenshot-img">

## Uploading FASTQ files

1. Navigate to your experiment's **Data** tab
2. Drag and drop your FASTQ files, or click **Upload**
3. bioAF automatically associates files with the correct samples based on naming conventions

<img src="{{ '/assets/images/screenshot-experiment-sample-bulk-upload.png' | relative_url }}" alt="File upload dialog with drag-and-drop area" class="screenshot-img">

{% include info-bubble.html title="Can the sequencer upload automatically?" content="Yes. If your admin has configured auto-ingest, bioAF watches for new files from your sequencer and imports them automatically. Ask your admin if this is set up." %}

## Viewing results

Once a pipeline has run on your experiment:

### QC dashboards

Navigate to **Results > QC** on your experiment page. The QC dashboard shows quality metrics for your sequencing run, cell counts, read depth, mapping rates, and more.

<img src="{{ '/assets/images/screenshot-qc-dashboard.png' | relative_url }}" alt="QC dashboard showing cell counts, read depth, and quality metrics" class="screenshot-img">

### Interactive single-cell visualization

Click **View in cellxgene** to open an interactive explorer for your single-cell data. You can:

- View UMAP/t-SNE embeddings
- Color cells by gene expression, cluster, or metadata
- Select cell populations for comparison
- Export plots

<img src="{{ '/assets/images/screenshot-cellxgene-discover.png' | relative_url }}" alt="CellxGene Discover showing UMAP embedding colored by cell type clusters" class="screenshot-img">

### Downloading results

From the **Data** tab, you can browse and download any output files, count matrices, processed h5ad files, plots, and reports.

## Getting notifications

bioAF can notify you when:

- A pipeline finishes running on your experiment
- QC results are available
- Someone comments on your experiment
- Your experiment's status changes

Check your notification preferences under your **Profile** settings.
