---
title: "Getting started with projects, experiments, and pipelines"
description: "From an empty platform to a finished scRNA-seq run: projects, experiments, samples, files, and an nf-core pipeline end to end."
thumbnail: /assets/images/screenshot-experiment-description.png
---

{% include youtube.html id="sWhcA_4AlqU" title="Getting started with projects, experiments, and pipelines" %}

Once bioAF is installed and your team is invited, the next question is the obvious one: how do I actually run something? The video above is a full pass, from an empty platform to a completed nf-core/scrnaseq run with QC and results to look at.

Here's the shape of it.

## Start with a project

A project is the top-level container. It's the thing a grant, a paper, or a program of work maps onto, and every experiment lives inside one. Create a project first so there's somewhere for the experiment to go.

## Create an experiment, whichever way fits

bioAF gives you three ways to create an experiment, and they're all on the new-experiment page:

1. **Manually.** Fill in the fields directly: name, design type, hypothesis, and the MINSEQE metadata (organism, tissue type, chemistry, and so on).
2. **From an experiment template.** If your lab runs the same kind of experiment repeatedly, a template pre-fills the structure and field defaults so you're not retyping the same metadata every time.
3. **By importing columns from Google Sheets.** Point bioAF at a sheet and it reads the column headers, maps them onto experiment fields, and remembers the aliases so sample imports later can route the same columns automatically.

All three land in the same place: a structured experiment with metadata that travels with the data through every later step.

## Add samples

Samples live inside the experiment. The fastest way to add a batch of them is the same Google Sheets or a CSV import: bring in a sheet where each row is a sample, and bioAF maps the columns onto sample metadata. If you set up column aliases during experiment creation, matching columns route themselves.

## Upload your files

With samples registered, upload the sequencing data. In the walkthrough that's 10x Genomics FASTQ files, dragged into either the **Data & Files > Upload** browser or the **Files** tab of the experiment. Uploaded files get linked back to the experiment and samples they belong to, so the pipeline knows what to run against later.

## Install a pipeline from the public registry

bioAF ships with a few nf-core pipelines pre-configured, but you can pull any of them from the public nf-core registry. In the **Pipeline Catalog** (available under **Pipelines > Pipeline Catalog**), open the registry browser, search for the pipeline you want, pick a version, and install it. Installed pipelines show up in your catalog ready to launch.

{% include info-bubble.html title="What is nf-core?" content="nf-core is a community-curated collection of peer-reviewed Nextflow pipelines for bioinformatics. bioAF makes the registry searchable and installs the version you pick with one click." %}

## Run nf-core/scrnaseq

With the pipeline installed and files uploaded, launch a run: pick the pipeline, choose the experiment and samples, set any parameter overrides, and go. bioAF schedules the compute, stages the inputs, executes the workflow, and collects the outputs. While it runs you get stage-by-stage status, a DAG view, and live logs.

## Review QC and results

When the run finishes, every run produces a QC dashboard: cell counts, read depth, gene detection, doublet scores, mitochondrial content. That's your first look at whether the data is any good.

From there the pipeline outputs are linked back to the originating experiment and samples, stored in the results bucket, and available for the plot archive and cellxgene. For single-cell data, cellxgene opens straight in the browser so you can explore the embeddings without installing anything.

## Dig deeper

Each stage here has its own documentation: [Experiment Management]({{ '/docs/features/experiments/' | relative_url }}), the [Pipeline Engine]({{ '/docs/features/pipelines/' | relative_url }}), [Data Management]({{ '/docs/features/data/' | relative_url }}), and [Results & Visualization]({{ '/docs/features/results/' | relative_url }}).
