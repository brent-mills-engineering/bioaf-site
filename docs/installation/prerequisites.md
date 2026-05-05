---
layout: docs
title: Prerequisites
description: What you need before installing bioAF on Google Cloud.
---

bioAF runs on your own Google Cloud Platform (GCP) project. Before you start either the [scripted installer]({{ '/docs/' | relative_url }}) or the [manual install]({{ '/docs/installation/setup/' | relative_url }}), you'll need the three things below.

## 1. A Google account

You'll sign in to Google Cloud with a regular Google account. If you don't already have one, [create a Google account](https://accounts.google.com/signup).

## 2. A Google Cloud project

Google Cloud organizes resources into **projects**. bioAF is deployed into one project that you own.

1. Go to [cloud.google.com](https://cloud.google.com) and click **Get started for free** (or sign in if you already have an account). New accounts get a free trial credit.
2. In the [GCP Console](https://console.cloud.google.com), open the project dropdown at the top → **New Project** → name it (e.g., `bioaf-prod`) and click **Create**.

Write down the **Project ID** (e.g., `bioaf-prod-123456`) — both install paths will ask for it.

## 3. A billing account

Google requires a billing account with a payment method on file before it will provision infrastructure. If you don't already have one:

- [Create a billing account](https://console.cloud.google.com/billing/create) in the GCP Console
- See [Google's guide to creating a billing account](https://cloud.google.com/billing/docs/how-to/create-billing-account) if you need details

Link the billing account to the project you created in step 2.

{% include info-bubble.html title="Why do I need a credit card for free software?" content="bioAF is free and open source. But it runs on Google's servers, which aren't free. You pay Google directly for the compute, storage, and database resources bioAF uses. Google requires a payment method on file before they'll provision any infrastructure. See <a href='/docs/installation/gcp-costs/'>What to Expect on Your GCP Bill</a> for a breakdown of typical costs." %}

---

Once you have all three, head back to the install path you picked:

- **[Quick Start]({{ '/docs/' | relative_url }})** — scripted installer (macOS / Linux)
- **[Setup & Deploy]({{ '/docs/installation/setup/' | relative_url }})** — manual install
