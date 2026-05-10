---
layout: docs
title: Audit & Compliance
description: Immutable audit trail with full provenance from sample to result.
---

bioAF maintains an immutable audit log of every action taken on the platform, who did what, when, and to which resource.

## Why it matters

- **Publications**: Trace any figure back to the exact pipeline version, parameters, and input data that produced it
- **Regulatory compliance**: Demonstrate a complete chain of custody for your data and analyses
- **Troubleshooting**: Understand exactly what happened when something went wrong
- **Accountability**: Know who made changes and when

## What's logged

Every significant action is recorded:

- Experiment creation and status changes
- Sample additions and modifications
- Pipeline launches with full parameter snapshots
- Notebook session starts and stops
- File uploads and downloads
- User and role changes
- Component provisioning and configuration changes
- Budget threshold events

<img src="{{ '/assets/images/screenshot-audit-log.png' | relative_url }}" alt="Audit log showing a filterable, paginated list of events with user, action, resource, and timestamp columns" class="screenshot-img">

## Human-readable descriptions

Every audit entry includes a plain-language description of what happened, not just a raw event code. For example:

> *Dr. Sarah Chen launched nf-core/scrnaseq v2.0.0 on Experiment EXP-042 (12 samples, batch B3) with default parameters.*

## Filtering and search

Filter the audit log by:

- User
- Action type (created, updated, launched, etc.)
- Resource type (experiment, pipeline run, session, etc.)
- Date range

## Export

Export filtered audit logs for external reporting, compliance reviews, or archival.
