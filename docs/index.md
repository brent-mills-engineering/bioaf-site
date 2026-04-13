---
layout: docs
title: Quick Start
description: The fastest way to get bioAF running on your own Google Cloud project.
---

This is the fastest path to a running bioAF. If you'd rather click through the GCP Console yourself, see **[Manual Installation > Setup & Deploy]({{ '/docs/installation/setup/' | relative_url }})** instead.

## What you'll have when you're done

- A web-based control plane for your entire comp bio workflow
- Pipeline execution (Nextflow, Snakemake) with a built-in catalog
- Notebook sessions (JupyterHub, RStudio) with versioned environments
- Structured experiment and sample tracking
- Interactive results visualization (cellxgene, QC dashboards)
- Cost monitoring and audit logging

## Quick start

Pick your operating system:

<div class="os-tabs" role="tablist">
  <button type="button" class="os-tab active" data-os="macos" role="tab" aria-selected="true">macOS</button>
  <button type="button" class="os-tab" data-os="linux" role="tab" aria-selected="false">Linux</button>
  <button type="button" class="os-tab" data-os="windows" role="tab" aria-selected="false">Windows</button>
</div>

<div class="os-panel" data-os-panel="macos" markdown="1">

Run this in your terminal:

<div class="install-block">
  <div class="install-box">
    <code id="install-cmd-macos">curl -fsSL https://raw.githubusercontent.com/not-that-guy-again/bioAF/main/install-gcp.sh | bash</code>
    <button type="button" class="install-copy" data-copy-target="install-cmd-macos" aria-label="Copy install command">Copy</button>
  </div>
  <p class="install-note">
    Provisions a GCP VM, firewall rule, and service account. Prefer to do it by hand? Follow the <a href="{{ '/docs/installation/setup/' | relative_url }}">manual install steps</a>.
  </p>
</div>

</div>

<div class="os-panel" data-os-panel="linux" hidden markdown="1">

Run this in your terminal:

<div class="install-block">
  <div class="install-box">
    <code id="install-cmd-linux">curl -fsSL https://raw.githubusercontent.com/not-that-guy-again/bioAF/main/install-gcp.sh | bash</code>
    <button type="button" class="install-copy" data-copy-target="install-cmd-linux" aria-label="Copy install command">Copy</button>
  </div>
  <p class="install-note">
    Provisions a GCP VM, firewall rule, and service account. Prefer to do it by hand? Follow the <a href="{{ '/docs/installation/setup/' | relative_url }}">manual install steps</a>.
  </p>
</div>

</div>

<div class="os-panel" data-os-panel="windows" hidden markdown="1">

A Windows installer is not available at this time. Follow the [manual install steps]({{ '/docs/installation/setup/' | relative_url }}) under Manual Installation. You can run the `gcloud` commands from PowerShell or WSL.

</div>

When the script finishes, it prints the SSH command to connect to your new VM and the path to a service account JSON key (saved on your Desktop). Keep both handy.

---

## Install bioAF on the VM

Once you're SSH'd in, clone the repo and run setup.

### Clone the bioAF repo

<div class="install-block">
  <div class="install-box">
    <code id="clone-cmd">git clone https://github.com/not-that-guy-again/bioAF.git</code>
    <button type="button" class="install-copy" data-copy-target="clone-cmd" aria-label="Copy clone command">Copy</button>
  </div>
</div>

### Run `./bioaf setup`

<div class="install-block">
  <div class="install-box">
    <code id="setup-cmd">cd bioAF && ./bioaf setup</code>
    <button type="button" class="install-copy" data-copy-target="setup-cmd" aria-label="Copy setup command">Copy</button>
  </div>
</div>

`./bioaf setup` checks prerequisites, generates configuration, builds the container images, runs migrations, and starts the services. It takes about 30 minutes on a fresh VM.

When it finishes, the console prints:

- The URL of the setup wizard (typically `https://<your-vm-ip>/setup`)
- A **one-time setup code** that expires in one hour

Keep both visible — you'll use them in the web UI next.

---

## Set up bioAF in the web UI

Open the setup wizard URL in your browser and walk through the first-run flow.

### 1. Paste the one-time setup code

The code was printed on the VM's console by `./bioaf setup`. Pasting it proves you have admin access to the instance.

{% include info-bubble.html title="Lost the code or it expired?" content="Re-run <code>./bioaf setup</code> on the VM. It mints a fresh code as long as no admin account has been created yet. Once the first admin exists, the wizard closes." %}

### 2. Create your admin user

Pick an email and password. This becomes the first account with full admin rights.

### 3. Upload your GCP credentials

Paste or upload the service account JSON key generated earlier:

- **Scripted path:** the installer saved it to `~/Desktop/bioaf-sa-key.json` on your laptop
- **Manual path:** you created it during the [service account step]({{ '/docs/installation/setup/#6-set-up-the-service-account' | relative_url }})

bioAF uses this to provision the infrastructure components you enable later.

### 4. Configure SMTP (optional)

Add SMTP server details if you want bioAF to send invitation and notification emails. You can skip this and configure it later under **Admin > SMTP Settings**.

### 5. Provision infrastructure (optional but recommended)

bioAF's components (GKE, Cloud SQL, GCS buckets, JupyterHub, cellxgene, etc.) are enabled individually so you only pay for what you use. Review the cost estimates and toggle on the ones your team needs.

For a typical scRNA-seq team, a good starting set is:

- **GKE cluster** — required for pipelines and notebooks
- **Cloud SQL** — required for the database
- **GCS buckets** — required for data storage
- **JupyterHub** or **RStudio** — for interactive analysis
- **cellxgene** — for single-cell visualization

Skip this step if you just want to explore the UI first. You can enable components any time from **Admin > Component Settings**.

---

## Next steps

- **[Post-Setup]({{ '/docs/installation/post-setup/' | relative_url }})** — Invite your team and fine-tune notifications
- **[For Bench Scientists]({{ '/docs/user-guides/bench-scientists/' | relative_url }})** — Register experiments, upload data, view results
- **[For Bioinformaticians]({{ '/docs/user-guides/bioinformaticians/' | relative_url }})** — Run pipelines, launch notebooks, manage environments
- **[For PIs & Lab Managers]({{ '/docs/user-guides/pis-and-lab-managers/' | relative_url }})** — Track progress, monitor costs, review audits
