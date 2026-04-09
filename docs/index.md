---
layout: docs
title: Getting Started
description: Get up and running with bioAF in minutes.
---

Welcome to bioAF. This guide will get you from zero to a working computational biology platform on your own Google Cloud project.

## What you'll have when you're done

- A web-based control plane for your entire comp bio workflow
- Pipeline execution (Nextflow, Snakemake) with a built-in catalog
- Notebook sessions (JupyterHub, RStudio) with versioned environments
- Structured experiment and sample tracking
- Interactive results visualization (cellxgene, QC dashboards)
- Cost monitoring and audit logging

## Quick start

{% include info-bubble.html title="bioAF runs on a cloud VM, not your laptop" content="bioAF must be deployed on a Google Cloud virtual machine. It will not work on your local machine (Mac, Windows, or Linux desktop). If you haven't set up a GCP VM yet, start with the <a href='installation/gcp-setup/'>Deploying on Google Cloud</a> guide first." %}

Once you're connected to your GCP VM:

```bash
git clone https://github.com/not-that-guy-again/bioAF.git
cd bioAF
./install.sh
./bioaf setup
```

`install.sh` checks your prerequisites and generates the configuration file. Then `setup` walks you through the rest interactively: building the platform, running database migrations, and creating your admin account.

{% include info-bubble.html title="What do these commands do?" content="<code>install.sh</code> verifies that Docker, Git, and the gcloud CLI are installed, and generates a <code>.env</code> file with secure credentials. <code>./bioaf setup</code> then builds container images, applies database migrations, provisions GCP infrastructure, and prompts you to create an admin user. The whole process takes about 30 minutes depending on your internet connection." %}

## Next steps

1. **[Prerequisites](installation/prerequisites/)** — What you need before running setup
2. **[Setup & Deploy](installation/setup/)** — Step-by-step installation walkthrough
3. **[Post-Setup](installation/post-setup/)** — Enable components and invite your team

Once you're up and running, check the guide for your role:

- **[For Bench Scientists](user-guides/bench-scientists/)** — Register experiments, upload data, view results
- **[For Bioinformaticians](user-guides/bioinformaticians/)** — Run pipelines, launch notebooks, manage environments
- **[For PIs & Lab Managers](user-guides/pis-and-lab-managers/)** — Track progress, monitor costs, review audits
