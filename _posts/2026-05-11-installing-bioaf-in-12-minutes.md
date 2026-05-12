---
title: "Installing bioAF in 12 minutes"
description: "A walkthrough of the quickstart installer: one command, a few prompts, and zero hand-written configuration."
thumbnail: /assets/images/screenshot-infra-deployment.png
---

{% include youtube.html id="iVehfu1hQR4" title="Installing bioAF in 12 minutes" %}

Twelve minutes from "I want to try this" to a VM running bioAF on my own Google Cloud project. No YAML, no Terraform plans, no IAM bindings typed by hand.

The video above is the whole flow, start to finish: open [bioAF.co](https://bioaf.co), follow the **Get Started** link to the [Quick Start]({{ '/docs/' | relative_url }}) page, copy the installer command, paste it into a terminal, pick the project and billing account, pick a region, confirm the configuration, and let the automated path take it from there.

## Before you press play

There is exactly one thing the installer cannot do for you: stand up your Google Cloud account. The [Prerequisites]({{ '/docs/installation/prerequisites/' | relative_url }}) page covers it in three short steps:

1. A Google account
2. A Google Cloud project
3. A billing account linked to that project

Once those are done, the installer handles everything else: enabling APIs, creating the scoped service accounts, the firewall rule, and the VM.

## Two paths, same destination

The quickstart command on the Quick Start page is the fastest route. It provisions a small VM with a scoped `bioaf-app` service account attached, so no JSON keys ever land on your laptop. When it finishes, it prints the SSH command for your new VM.

If you'd rather click through the GCP Console yourself, or you're on Windows, or you have an existing project with custom IAM, the [manual install steps]({{ '/docs/installation/setup/' | relative_url }}) walk through the same end state one `gcloud` command at a time. Both paths converge on the same `./bioaf setup` step once you're SSH'd into the VM.

## What happens after the script finishes

In the video, I stop at the point where the infrastructure begins provisioning. That last stretch can take up to 30 minutes depending on the region and how busy GCP is that day. Nothing for you to do while it runs: when it's done, you'll have a setup URL and a one-time code to create your first admin user, and the rest of the flow lives in the web UI.

## Try it

<div style="text-align: center; margin: 2rem 0;">
  <a href="{{ '/docs/' | relative_url }}" class="btn btn-primary">Go to the Quick Start</a>
</div>

Grab a project ID, paste the one-liner, and see how far you get in 12 minutes.
