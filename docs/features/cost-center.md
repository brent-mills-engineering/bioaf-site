---
layout: docs
title: Cost Center
description: Monitor cloud spending with per-component breakdowns and budget alerts.
---

bioAF includes a built-in cost center that gives you visibility into your Google Cloud spending without needing to navigate the GCP console.

## Spending dashboard

The Cost Center shows:

- **Total spend** for the current billing period
- **Per-component breakdown**: compute, storage, database, networking
- **Per-project costs**: see which experiments or projects are driving spend
- **Trend charts**: spending over time with projections
- **Budget status**: visual indicator of how close you are to your threshold

<img src="{{ '/assets/images/screenshot-cost-center.png' | relative_url }}" alt="Cost Center dashboard showing spending breakdown chart, trend line, and budget progress bar" class="screenshot-img">

## Budget alerts

Set a monthly spending threshold and get notified when you approach it:

1. Navigate to **Admin > Cost Center > Budgets**
2. Set your monthly threshold
3. Choose notification channels (email, Slack, in-app)

Alerts fire at 50%, 80%, and 100% of your budget.

## Cost optimization

The Cost Center also highlights opportunities to reduce spending:

- Idle notebook sessions that could be stopped
- Components that are provisioned but unused
- Storage tiers with data that could be archived

{% include info-bubble.html title="How is billing data collected?" content="bioAF pulls billing data from your GCP project's BigQuery billing export. This is the same data Google uses to generate your invoice, bioAF just organizes it by platform component so you can see what's driving costs at a glance." %}
