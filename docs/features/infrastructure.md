---
layout: docs
title: Infrastructure Management
description: Enable and disable platform components from the bioAF UI.
---

bioAF lets you manage your cloud infrastructure entirely through the web interface. No need to SSH into servers, edit configuration files, or learn cloud-specific tools.

## Component catalog

The **Component Settings** page shows every available platform component:

- What it does (in plain language)
- Estimated monthly cost
- Current status (enabled, disabled, provisioning)
- Dependencies on other components

<img src="{{ '/assets/images/screenshot-infra-deployment.png' | relative_url }}" alt="Component Settings page with component cards showing descriptions, cost estimates, status badges, and toggle switches" class="screenshot-img">

## Enabling a component

1. Find the component you want to enable
2. Review the cost estimate
3. Click **Enable**
4. bioAF generates an infrastructure plan and shows you what will be created
5. Review and confirm
6. Watch the provisioning progress in real time

{% include info-bubble.html title="What's an infrastructure plan?" content="When you enable a component, bioAF creates a plan describing exactly what cloud resources it needs to create, servers, databases, storage, networking rules. You see this plan before anything is created, including cost estimates. This uses a technology called Terraform, which is an industry-standard tool for managing cloud infrastructure safely and predictably." %}

## Disabling a component

Disable any optional component to remove its cloud resources and stop incurring costs. Core components (database, storage) cannot be disabled while the platform is running.

## GitOps

Every infrastructure change is version-controlled. This means:

- You can see the full history of what was provisioned and when
- You can roll back to a previous configuration
- All changes are auditable

{% include info-bubble.html title="What is GitOps?" content="GitOps means using version control (like a detailed change history) to manage infrastructure. Every time bioAF changes your cloud resources, it records exactly what changed and why. Think of it like track changes in a Word document, but for your infrastructure." %}

## Upgrades

Check for new versions by clicking **Check for updates** in **Settings > Information**. When an update is available:

1. Review the changelog and release notes
2. Click **Upgrade** to pull the update, rebuild, and migrate
3. If anything goes wrong, roll back with one click
