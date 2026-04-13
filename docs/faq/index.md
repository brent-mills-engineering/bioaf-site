---
layout: docs
title: FAQ
description: Frequently asked questions about bioAF.
---

## General

### What is bioAF?

bioAF is a free, open source platform that provides production-grade computational biology infrastructure for small biotech companies. It bundles pipeline execution, notebook sessions, experiment tracking, visualization, and cost management into a single web-based control plane.

### Who is bioAF for?

Small biotech companies (5–50 researchers) that need computational biology infrastructure but don't have a dedicated DevOps or infrastructure team. It's designed for bioinformaticians, bench scientists, and PIs who want to focus on science, not infrastructure.

### Is bioAF free?

Yes. bioAF is open source and free to use. You will pay Google Cloud Platform for the underlying infrastructure (compute, storage, database), but bioAF itself has no license fees, per-seat charges, or usage limits.

### What cloud providers are supported?

Google Cloud Platform (GCP) today. bioAF's architecture uses an adapter layer that could support other providers in the future.

## Installation & Setup

### How long does setup take?

About 30 minutes end-to-end. One command on your desktop (`curl ... install-gcp.sh | bash`) provisions the VM, then `./bioaf setup` on the VM handles prerequisites, configuration, builds, and migrations. See the [Getting Started guide]({{ '/docs/' | relative_url }}) for the full flow.

### Can I use an existing GCP project?

Yes. bioAF provisions resources in whatever GCP project you point it at. It won't interfere with existing resources.

### Can I run bioAF on my laptop?

No. bioAF must be deployed on a Google Cloud virtual machine — it will not work on a local machine (Mac, Windows, or Linux desktop). Follow the [Getting Started]({{ '/docs/' | relative_url }}) guide to set up a VM first.

### What are the hardware requirements?

bioAF runs on a GCP VM (`e2-medium` or larger). The actual pipeline compute happens on GCP as well, so you don't need a powerful local machine — just a browser, a terminal, and an SSH client.

### How much does the GCP infrastructure cost?

Costs are usage-based — an idle platform costs very little, and costs scale with pipeline runs, notebook sessions, and data stored. See [What to Expect on Your GCP Bill]({{ '/docs/installation/gcp-costs/' | relative_url }}) for a full breakdown.

## Data & Security

### Where is my data stored?

All data is stored in Google Cloud Storage buckets and Cloud SQL databases within **your own GCP project**. bioAF never moves data outside your project.

### What happens to my data if I stop using bioAF?

Your data stays in your GCP project. bioAF can export all infrastructure configuration as Terraform code, and your GCS buckets remain accessible through the standard Google Cloud console or CLI.

### Is my data backed up?

Yes. bioAF backs up across four tiers: PostgreSQL snapshots (`pg_dump` to GCS with configurable retention and rotation), GCS object versioning for data files, platform configuration exports, and Terraform state files. All backup data is stored in a persistent `bioaf-backups-{project_id}` GCS bucket. See the backup settings in Admin for details.

## Pipelines & Analysis

### What pipelines come pre-installed?

bioAF ships with nf-core pipelines including scrnaseq, rnaseq, and atacseq. You can add custom Nextflow or Snakemake workflows through the pipeline catalog.

### Can I add my own pipelines?

Yes. Provide a Git repository URL with your Nextflow or Snakemake workflow, and bioAF will add it to the catalog with configurable parameters and resource defaults.

### Can I use my own Docker images for notebooks?

Yes. Upload a Dockerfile or conda environment specification, and bioAF will build it into a versioned environment image that's available for notebook sessions.

## Updates & Support

### How do I update bioAF?

Click **Check for updates** in **Settings > Information** to see if a new version is available. bioAF queries the GitHub Releases API and shows the changelog and release link when an update is found. Run `./bioaf update` or click **Upgrade** in the admin panel to apply it. Updates include a rollback option.

### Where do I report bugs?

Open an issue on [GitHub](https://github.com/not-that-guy-again/bioAF/issues).

### Is professional support available?

Yes. We offer support plans and consulting for teams that need help with setup, customization, or ongoing operations. Contact [support@bioaf.co](mailto:support@bioaf.co).
