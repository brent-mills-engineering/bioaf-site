---
layout: docs
title: Post-Setup
description: What to do after installing bioAF — enable components and invite your team.
---

Once bioAF is running and you've pasted the one-time setup code from `./bioaf setup` into the web UI to create your admin account, there are a few things to set up before your team starts using the platform.

## Enable platform components

By default, bioAF starts with the core platform only. Additional capabilities are enabled through the **Component Settings** page.

1. Navigate to **Admin > Component Settings**
2. Review the available components and their estimated monthly costs
3. Toggle on the ones your team needs
4. Review the infrastructure plan that bioAF generates
5. Confirm to provision

<img src="{{ '/assets/images/screenshot-infra-deployment.png' | relative_url }}" alt="Component Settings page showing available components with cost estimates and toggle switches" class="screenshot-img">

{% include info-bubble.html title="What's happening when I toggle a component?" content="When you enable a component, bioAF generates a Terraform plan — a description of the cloud resources it needs to create. You review the plan (including cost estimates) and confirm. bioAF then provisions those resources in your GCP project. You can disable components later to remove the resources and stop incurring costs." %}

### Recommended starting components

For a typical scRNA-seq team:

- **GKE cluster** — Required for running pipelines and notebooks
- **Cloud SQL** — Required for the database (usually provisioned during setup)
- **GCS buckets** — Required for data storage
- **JupyterHub** or **RStudio** — For interactive analysis
- **cellxgene** — For single-cell visualization

## Invite your team

1. Navigate to **Admin > Users**
2. Click **Add User**
3. Enter their email and assign a role

### Built-in roles

| Role | Can do |
|------|--------|
| **Admin** | Everything — manage users, roles, components, and platform settings |
| **Computational Biologist** | Run pipelines, launch notebooks, manage environments, upload/download data |
| **Scientist** | Register experiments, add samples, upload data, view results |
| **Viewer** | Browse experiments, view results, download files (read-only) |

You can also create custom roles with fine-grained permissions under **Admin > Roles**.

## Configure notifications

bioAF can send notifications when pipelines complete, QC results are ready, or budget thresholds are hit.

- **In-app notifications** — Enabled by default
- **Email** — Configure SMTP settings under **Admin > SMTP Settings**
- **Slack** — Add a webhook URL under **Admin > Slack Settings**

## Next steps

Your platform is ready. Point your team to the guide for their role:

- [For Bench Scientists]({{ '/docs/user-guides/bench-scientists/' | relative_url }})
- [For Bioinformaticians]({{ '/docs/user-guides/bioinformaticians/' | relative_url }})
- [For PIs & Lab Managers]({{ '/docs/user-guides/pis-and-lab-managers/' | relative_url }})
