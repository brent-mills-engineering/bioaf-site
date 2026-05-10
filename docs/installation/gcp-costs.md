---
layout: docs
title: What to Expect on Your GCP Bill
description: A transparent breakdown of what bioAF costs to run on Google Cloud Platform.
---

bioAF is free and open source software. The costs below come from Google Cloud Platform for the infrastructure that bioAF runs on.

## Base platform

These components are provisioned during setup and are required for bioAF to function.

| Component | What it does | Cost |
|-----------|-------------|------|
| GKE Autopilot | Runs pipelines and notebook sessions | Usage-based; scales to near-zero when idle |
| Cloud SQL (PostgreSQL) | Stores experiments, samples, metadata, audit logs | Usage-based |
| GCS buckets | Stores FASTQ files, pipeline outputs, results | Usage-based; scales with data stored |
| Monitoring & logging | Health checks and log collection | Runs on GKE, no extra cost |
| Backups | PostgreSQL snapshots, config exports, Terraform state (all stored in GCS) | Usage-based |

## Optional components

These are enabled through the bioAF UI as your team needs them. Each shows a cost estimate before you provision it.

| Component | What it does | Cost |
|-----------|-------------|------|
| JupyterHub | Interactive Python notebooks | Usage-based; charged per session hour |
| RStudio Server | Interactive R sessions | Usage-based; charged per session hour |
| cellxgene | Single-cell data visualization | Usage-based |
| Meilisearch | Full-text search across the platform | Usage-based |

## Cost-saving features

- **GKE Autopilot** scales to near-zero when no pipelines or sessions are running
- **Notebook sessions** auto-stop after a configurable idle timeout
- **The Cost Center** in bioAF shows real-time spending, per-component breakdowns, and lets you set budget alerts

{% include info-bubble.html title="How does this compare to hiring?" content="A full-time DevOps or infrastructure engineer costs $150,000–$200,000/year in salary alone. bioAF's base infrastructure costs roughly $1,300/year idle, plus usage costs when pipelines and notebooks are running. For a team of 5–30 researchers, the cloud bill is typically a fraction of one engineer's salary." %}

## Controlling costs

1. **Disable what you're not using**: components can be toggled off at any time
2. **Set budget alerts**: bioAF will notify you when spending approaches your threshold
3. **Use idle timeouts**: notebook sessions automatically shut down when not in use
4. **Review the Cost Center regularly**: the dashboard shows trends and projections
