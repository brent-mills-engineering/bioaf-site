---
layout: docs
title: Guide for PIs & Lab Managers
description: How to track team progress, monitor costs, and manage your bioAF platform.
---

This guide covers what PIs, lab managers, and team leads need from bioAF, visibility into team activity, cost oversight, and audit compliance.

## The dashboard

Your first stop is the **Dashboard**. It shows:

- Active pipeline runs and their progress
- Running notebook sessions
- Recent team activity
- Quick links to experiments and results

<img src="{{ '/assets/images/screenshot-dashboard.png' | relative_url }}" alt="Dashboard showing active runs, sessions, and recent activity feed" class="screenshot-img">

## Tracking team activity

The **Activity Feed** (accessible from the dashboard or the sidebar) shows a chronological stream of everything happening on the platform:

- Experiments created and updated
- Pipelines launched and completed
- Samples added and data uploaded
- Status changes and reviews

You can filter by team member, experiment, or date range.

<img src="{{ '/assets/images/screenshot-activity.png' | relative_url }}" alt="Activity feed showing recent team events with timestamps and user attribution" class="screenshot-img">

## Monitoring costs

### The Cost Center

Navigate to **Admin > Cost Center** for a complete view of your cloud spending:

- **Total spend** this billing period
- **Per-component breakdown**: see exactly what's driving costs (compute, storage, database, etc.)
- **Per-project costs**: track spending by experiment or project
- **Trend charts**: spending over time with projections
- **Budget status**: how close you are to your set threshold

<img src="{{ '/assets/images/screenshot-cost-center.png' | relative_url }}" alt="Cost Center showing spending breakdown by component, trend chart, and budget indicator" class="screenshot-img">

### Setting budget alerts

1. Go to **Admin > Cost Center > Budgets**
2. Set a monthly budget threshold
3. Choose notification channels (email, Slack, in-app)
4. bioAF alerts you when spending reaches 50%, 80%, and 100% of your budget

{% include info-bubble.html title="Where do these costs come from?" content="bioAF runs on your Google Cloud project. The costs shown in the Cost Center are pulled directly from your GCP billing data, they're the same numbers you'd see in the Google Cloud console, but organized by bioAF component so you can see what's driving spend." %}

## Using the audit log

The **Audit Log** provides an immutable record of every action taken on the platform. This is critical for:

- **Publication provenance**: trace any result back to the exact experiment, samples, pipeline version, and parameters that produced it
- **Regulatory compliance**: demonstrate a complete chain of custody for your data
- **Troubleshooting**: see exactly what happened and when

<img src="{{ '/assets/images/screenshot-audit-log.png' | relative_url }}" alt="Audit log showing filterable list of events with user, action, resource, and timestamp" class="screenshot-img">

Each audit entry includes:
- Who performed the action
- What they did (in plain language)
- Which resource was affected
- When it happened
- Additional context (parameter changes, status transitions, etc.)

You can filter by user, action type, resource, or date range, and export the log for external reporting.

## Managing users and roles

### Adding users

Navigate to **Admin > Users** and click **Add User**. Assign one of the built-in roles or a custom role.

### Built-in roles

| Role | Access level |
|------|-------------|
| **Admin** | Full platform access including user management, component provisioning, and settings |
| **Computational Biologist** | Run pipelines, launch notebooks, manage environments, full data access |
| **Scientist** | Register experiments, add samples, upload data, view results |
| **Viewer** | Read-only access to experiments, results, and files |

### Custom roles

For more granular control, create custom roles under **Admin > Roles**. You can grant or deny access per resource type and action (create, read, update, delete).

<img src="{{ '/assets/images/screenshot-user-list.png' | relative_url }}" alt="User management page showing team members with roles" class="screenshot-img">

## Reviewing results

You don't need to run pipelines yourself to review the output. From any experiment:

- Open **QC dashboards** to check sequencing quality
- Launch **cellxgene** to explore single-cell embeddings interactively
- Browse the **plot archive** for publication-ready figures
- Download reports for offline review or sharing
