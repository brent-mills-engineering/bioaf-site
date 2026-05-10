---
layout: docs
title: Guide for Bioinformaticians
description: How to run pipelines, launch notebooks, and manage environments in bioAF.
---

This guide covers the computational biologist workflow in bioAF, running pipelines, working in notebooks, and managing compute environments.

## Browsing and launching pipelines

### The pipeline catalog

Navigate to **Pipelines** to see the available workflows. bioAF ships with nf-core pipelines pre-configured:

- **nf-core/scrnaseq**: Single-cell RNA-seq (10x Chromium, Smart-seq2, etc.)
- **nf-core/rnaseq**: Bulk RNA-seq
- **nf-core/atacseq**: ATAC-seq
- And more, with the ability to add custom pipelines

<img src="{{ '/assets/images/screenshot-pipeline-catalog.png' | relative_url }}" alt="Pipeline catalog showing available workflows with descriptions" class="screenshot-img">

### Launching a pipeline run

1. Select a pipeline from the catalog
2. Choose the experiment and samples to process
3. Configure parameters (or use defaults)
4. Set compute resources (CPU, memory)
5. Click **Launch**

<img src="{{ '/assets/images/screenshot-pipeline-launch-wizard.png' | relative_url }}" alt="Pipeline launch form with experiment selection, parameter overrides, and resource settings" class="screenshot-img">

{% include info-bubble.html title="What is Nextflow?" content="Nextflow is a workflow manager: a tool that breaks a complex analysis into steps, runs them in the right order, and handles parallelism and error recovery. nf-core is a community library of curated, peer-reviewed Nextflow pipelines. bioAF manages both for you, so you just pick your pipeline, select your data, and hit launch." %}

### Monitoring pipeline runs

Once launched, you can track progress from the **Runs** page:

- Real-time status for each pipeline stage
- DAG (directed acyclic graph) visualization showing the workflow structure
- Resource usage and timing per stage
- Access to logs for troubleshooting

<img src="{{ '/assets/images/screenshot-pipeline-provenance.png' | relative_url }}" alt="Pipeline run detail page showing DAG visualization, stage statuses, and progress" class="screenshot-img">

## Working with notebooks

### Launching a session

1. Navigate to **Notebook Sessions**
2. Click **New Session**
3. Choose your environment:
   - **JupyterHub**: For Python-based analysis
   - **RStudio**: For R-based analysis
4. Select a versioned environment (or use the default)
5. Set resource limits and click **Launch**

Your session starts in about a minute. Click **Open** to connect directly in your browser.

<img src="{{ '/assets/images/screenshot-notebooks.png' | relative_url }}" alt="Notebook Sessions page showing active sessions with environment versions and resource usage" class="screenshot-img">

<img src="{{ '/assets/images/screenshot-notebook-session.png' | relative_url }}" alt="Active notebook session with JupyterHub open in browser" class="screenshot-img">

Sessions automatically stop after a configurable idle period to manage costs. Your work is saved, you can restart and pick up where you left off.

### SSH access

For tasks that need a terminal, click the **Terminal** button on any running session or pipeline job. This opens a browser-based terminal directly into the running container.

## Managing environments

### What are environments?

Environments define the software available in your notebook sessions and pipeline runs, Python/R packages, system libraries, and tools. bioAF versions every environment so your analyses are reproducible.

### Creating an environment

1. Go to **Environments > New Environment**
2. Provide a name and description
3. Upload a **Dockerfile** or **conda environment spec**
4. Click **Build**

bioAF builds the environment image and makes it available for notebook sessions.

<img src="{{ '/assets/images/screenshot-environment-version-create.png' | relative_url }}" alt="Environment creation form" class="screenshot-img">

<img src="{{ '/assets/images/screenshot-environment-version-docker-conda.png' | relative_url }}" alt="Environment Dockerfile and conda spec options" class="screenshot-img">

{% include info-bubble.html title="What is a Dockerfile?" content="A Dockerfile is a recipe that lists the software to install in an environment, think of it as a shopping list for your analysis tools. If you're more comfortable with conda, you can upload a conda `environment.yml` file instead." %}

### Versioning

Every time you update an environment, bioAF creates a new version. Previous versions remain available, so you can always go back to the exact setup that produced a specific result.

<img src="{{ '/assets/images/screenshot-environment-version.png' | relative_url }}" alt="Environment versions list" class="screenshot-img">

## Accessing data and files

The **Data & Files** section lets you:

- Browse files by experiment or project
- Upload new files
- Download results, count matrices, and reports
- See file metadata (size, upload date, associated experiment)

<img src="{{ '/assets/images/screenshot-files.png' | relative_url }}" alt="File browser showing experiment data files with metadata columns" class="screenshot-img">

## Adding custom pipelines

If you have your own Nextflow workflows, you can add them to the pipeline catalog. Navigate to **Pipelines > Add Pipeline** and provide:

- Pipeline name and description
- Git repository URL
- Default parameters
- Resource recommendations
