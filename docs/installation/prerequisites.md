---
layout: docs
title: Prerequisites
description: What you need before manually installing bioAF on Google Cloud.
---

This page covers prerequisites for the **manual install** path. If you're using the [scripted installer]({{ '/docs/' | relative_url }}), it takes care of most of this for you.

The manual path runs `gcloud` commands from your laptop, so you'll need the [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated. [Setup & Deploy]({{ '/docs/installation/setup/#2-set-up-the-gcloud-cli' | relative_url }}) walks through that.

## 1. A Google Cloud account

You'll need an account on Google Cloud Platform. If you don't have one:

- Sign up at [cloud.google.com](https://cloud.google.com)
- Click **Get started for free** — new accounts get a free trial credit

## 2. A billing account linked to your GCP project

Google requires a billing account with a payment method on file before it will provision infrastructure. If you don't already have one:

- [Create a billing account](https://console.cloud.google.com/billing/create) in the GCP Console
- See [Google's guide to creating a billing account](https://cloud.google.com/billing/docs/how-to/create-billing-account) if you need details

Link the billing account to whichever GCP project you intend to deploy bioAF into.

{% include info-bubble.html title="Why do I need a credit card for free software?" content="bioAF is free. But it runs on Google's servers, which aren't free. You pay Google directly for the compute, storage, and database resources bioAF uses. Google requires a payment method on file before they'll provision any infrastructure." %}

## 3. Project ID, region, and account access

Before you start, have these ready:

- Your **GCP project ID** (looks like `bioaf-prod-123456`)
- Your **desired region** (e.g., `us-central1` — pick one close to your team)
- A Google account with permission to create **VM instances**, **firewall rules**, and **service accounts** in the project

The account you authenticate `gcloud` as needs at least the **Compute Admin**, **Service Account Admin**, and **Security Admin** roles — or a broader role like **Owner** or **Editor** combined with **Security Admin**.

## Expected cloud costs

bioAF is free. Running it on Google Cloud Platform is not — you'll pay Google directly for the infrastructure it uses (compute, database, storage). Costs scale with usage: more pipeline runs and notebook sessions mean higher bills; an idle platform costs very little.

Optional components (notebook sessions, additional pipeline engines, search) add cost based on usage. You can enable and disable them at any time from the bioAF UI, and you'll see cost estimates before you provision anything.

See [What to Expect on Your GCP Bill]({{ '/docs/installation/gcp-costs/' | relative_url }}) for a full breakdown.

{% include info-bubble.html title="Why does it cost anything if bioAF is free?" content="bioAF the software is free and open source. These costs come from Google Cloud Platform for the servers, database, and storage that the platform runs on — similar to how a free email app still needs you to pay your internet bill." %}
