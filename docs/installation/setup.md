---
layout: docs
title: Setup & Deploy
description: Manual install steps for users who prefer to click through GCP themselves.
---

This page covers the manual path: installing the `gcloud` CLI, enabling APIs, creating two scoped service accounts, and provisioning a VM by hand. Use this if the scripted installer on [Quick Start]({{ '/docs/' | relative_url }}) isn't an option (for example, you're on Windows, or you have an existing project with custom IAM).

Both paths converge once you're SSH'd into the VM. See **[Install bioAF on the VM](#install-bioaf-on-the-vm)** at the bottom of this page.

{% include info-bubble.html title="You'll only need to do this once" content="These steps create a Resource Manager tag, a custom IAM role, two scoped service accounts (bioaf-bootstrap and bioaf-app), a firewall rule, and a VM in your GCP project. They produce the same result as the scripted installer." %}

---

Before you start, complete the <a href="{{ '/docs/installation/prerequisites/' | relative_url }}" target="_blank" rel="noopener">Prerequisites</a> (Google account, Google Cloud project, billing). Have your **Project ID** handy: the steps below reference it.

## 1. Set up the gcloud CLI

**macOS:**

```bash
brew install --cask google-cloud-sdk
```

**Linux:**

```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

**Windows:** Download the installer from [cloud.google.com/sdk](https://cloud.google.com/sdk/docs/install).

Authenticate and point gcloud at your project (replace `YOUR_PROJECT_ID`):

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

Set a shell variable you'll reuse in the rest of this guide:

```bash
PROJECT_ID=YOUR_PROJECT_ID
```

## 2. Enable the required GCP APIs

bioAF uses these GCP APIs for compute, storage, IAM, logging, quota management, and related services. Enable all of them on your project:

```bash
gcloud services enable \
  compute.googleapis.com \
  storage.googleapis.com \
  iam.googleapis.com \
  cloudresourcemanager.googleapis.com \
  pubsub.googleapis.com \
  container.googleapis.com \
  bigquery.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  serviceusage.googleapis.com \
  logging.googleapis.com \
  cloudquotas.googleapis.com \
  sheets.googleapis.com \
  --project="$PROJECT_ID"
```

This can take a minute. You won't be able to create the VM or service accounts below until the APIs are enabled.

## 3. Create the Resource Manager tag and custom IAM role

bioAF uses a project-scoped Resource Manager tag (`bioaf-managed=true`) to scope some IAM bindings to its own resources, and a tiny custom IAM role (`bioafSaManager`) so the runtime SA can manage only `bioaf-`-prefixed service accounts. Both are idempotent: skip whichever already exists.

```bash
gcloud resource-manager tags keys create bioaf-managed \
  --parent="projects/$PROJECT_ID" \
  --description="Marks resources managed by bioAF"

gcloud resource-manager tags values create true \
  --parent="$PROJECT_ID/bioaf-managed" \
  --description="bioAF-owned resource"

gcloud iam roles create bioafSaManager \
  --project="$PROJECT_ID" \
  --title="bioAF SA Manager" \
  --description="Lookup/list/delete bioAF-prefixed service accounts" \
  --permissions="iam.serviceAccounts.get,iam.serviceAccounts.list,iam.serviceAccounts.delete" \
  --stage=GA
```

## 4. Create the service accounts

bioAF uses three keyless service accounts:

- **`bioaf-bootstrap`** holds the broad project-level roles (Terraform, Cloud Build, IAM admin). It is impersonated by the runtime, never attached to anything.
- **`bioaf-app`** is attached to the VM as the runtime data plane. It holds a small set of scoped (conditioned) bindings and impersonates `bioaf-bootstrap` when it needs broader access.
- **`bioaf-reader`** is impersonated to read Google Sheets that users explicitly share with it.

No JSON keys are created. The VM uses its attached identity, and impersonation is granted via `roles/iam.serviceAccountTokenCreator`.

```bash
gcloud iam service-accounts create bioaf-bootstrap \
  --project="$PROJECT_ID" \
  --display-name="bioAF Bootstrap" \
  --description="Impersonated by bioAF backend for IAM/Terraform/Cloud Build"

gcloud iam service-accounts create bioaf-app \
  --project="$PROJECT_ID" \
  --display-name="bioAF Application" \
  --description="Attached to the bioAF VM; runtime data-plane SA"

gcloud iam service-accounts create bioaf-reader \
  --project="$PROJECT_ID" \
  --display-name="bioAF Sheets Reader" \
  --description="Read-only access to Google Sheets shared with this email"
```

Set up the SA email shell variables you'll reuse in the next step:

```bash
BOOTSTRAP_SA="bioaf-bootstrap@${PROJECT_ID}.iam.gserviceaccount.com"
APP_SA="bioaf-app@${PROJECT_ID}.iam.gserviceaccount.com"
READER_SA="bioaf-reader@${PROJECT_ID}.iam.gserviceaccount.com"
```

{% include info-bubble.html title="Wait for IAM propagation" content="Newly created service accounts can take 5-30 seconds to become globally visible to IAM. If the binding commands in the next step fail with 'Service account ... does not exist', wait a few seconds and re-run the failing command. The grants are idempotent." %}

## 5. Grant IAM roles to the service accounts

### 5a. Broad project roles on bioaf-bootstrap

These are the roles Terraform, Cloud Build, and the IAM admin flow need. They are granted unconditionally:

```bash
for role in \
  roles/storage.admin \
  roles/pubsub.admin \
  roles/container.admin \
  roles/iam.serviceAccountUser \
  roles/iam.serviceAccountAdmin \
  roles/compute.admin \
  roles/resourcemanager.projectIamAdmin \
  roles/bigquery.dataEditor \
  roles/artifactregistry.admin \
  roles/cloudbuild.builds.editor \
  roles/logging.logWriter \
  roles/serviceusage.serviceUsageAdmin \
  roles/viewer
do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$BOOTSTRAP_SA" \
    --role="$role" \
    --condition=None
done
```

Also grant `bioaf-bootstrap` the right to attach the `bioaf-managed` tag (Terraform needs this to tag GKE resources):

```bash
gcloud resource-manager tags values add-iam-policy-binding \
  "$PROJECT_ID/bioaf-managed/true" \
  --member="serviceAccount:$BOOTSTRAP_SA" \
  --role="roles/resourcemanager.tagUser"
```

### 5b. Unconditioned roles on bioaf-app

Low-blast-radius bindings (write logs, read its own service usage, read its own secrets, run BigQuery jobs):

```bash
for role in \
  roles/logging.logWriter \
  roles/monitoring.metricWriter \
  roles/browser \
  roles/serviceusage.serviceUsageViewer \
  roles/secretmanager.viewer \
  roles/bigquery.jobUser
do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$APP_SA" \
    --role="$role" \
    --condition=None
done
```

### 5c. Scoped (conditioned) roles on bioaf-app

These four bindings use IAM Conditions to limit `bioaf-app` to resources that bioAF actually owns (`bioaf-` prefix on buckets, SAs, instances, and GKE clusters):

```bash
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$APP_SA" \
  --role="roles/storage.admin" \
  --condition='expression=resource.name.startsWith("projects/_/buckets/bioaf-"),title=bioaf_buckets_only,description=bioaf_buckets_only'

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$APP_SA" \
  --role="projects/$PROJECT_ID/roles/bioafSaManager" \
  --condition="expression=resource.name.startsWith(\"projects/$PROJECT_ID/serviceAccounts/bioaf-\"),title=bioaf_sas_only,description=bioaf_sas_only"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$APP_SA" \
  --role="roles/compute.instanceAdmin.v1" \
  --condition='expression=resource.name.extract("/instances/{name}").startsWith("bioaf-"),title=bioaf_worknodes_only,description=bioaf_worknodes_only'

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$APP_SA" \
  --role="roles/container.admin" \
  --condition='expression=resource.name.extract("/clusters/{name}").startsWith("bioaf-"),title=bioaf_clusters_only,description=bioaf_clusters_only'
```

### 5d. Impersonation bindings

Let `bioaf-app` mint short-lived tokens for `bioaf-bootstrap` (so it can do Terraform/IAM work) and for `bioaf-reader` (so it can read shared Google Sheets):

```bash
gcloud iam service-accounts add-iam-policy-binding "$BOOTSTRAP_SA" \
  --project="$PROJECT_ID" \
  --member="serviceAccount:$APP_SA" \
  --role="roles/iam.serviceAccountTokenCreator"

gcloud iam service-accounts add-iam-policy-binding "$READER_SA" \
  --project="$PROJECT_ID" \
  --member="serviceAccount:$APP_SA" \
  --role="roles/iam.serviceAccountTokenCreator"
```

{% include info-bubble.html title="No JSON keys are created" content="bioAF intentionally avoids long-lived service account keys. The VM uses its attached identity (bioaf-app), and broader access is gated through impersonation tokens that expire in minutes. The setup wizard will detect the VM identity and skip the key-upload step entirely." %}

## 6. Create the firewall rule

```bash
gcloud compute firewall-rules create bioaf-allow-web \
  --direction=INGRESS \
  --action=ALLOW \
  --rules=tcp:80,tcp:443 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=bioaf
```

This opens HTTP and HTTPS to your VM. For details on tightening the source ranges, see [VPC firewall rules](https://cloud.google.com/firewall/docs/firewalls).

## 7. Create the VM

The VM is created with `bioaf-app` attached as its service account and `cloud-platform` scopes, so the bioAF backend can use the VM's own identity to call GCP APIs (no key file required). Adjust `--zone` if you'd rather run closer to your team.

```bash
gcloud compute instances create bioaf \
  --project="$PROJECT_ID" \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-ssd \
  --tags=bioaf \
  --service-account="$APP_SA" \
  --scopes=cloud-platform \
  --metadata="bioaf_bootstrap_sa_email=$BOOTSTRAP_SA"
```

The `bioaf_bootstrap_sa_email` metadata key tells the bioAF backend which SA to impersonate on first start. The setup wizard reads it automatically.

{% include info-bubble.html title="Capacity errors" content="If VM creation fails with a stockout (zone resource exhausted), retry with a different zone in the same region (e.g. <code>us-central1-b</code>, <code>us-central1-c</code>) or pick a different region from <a href='https://cloud.google.com/compute/docs/regions-zones' target='_blank' rel='noopener'>Compute Engine regions and zones</a>." %}

## 8. SSH to the VM

The easiest option is the gcloud CLI:

```bash
gcloud compute ssh bioaf --zone=us-central1-a
```

Or click the **SSH** button next to `bioaf` on the [VM Instances page](https://console.cloud.google.com/compute/instances) in the GCP Console to open a browser-based terminal.

A fresh Ubuntu image won't have Docker or Git. Install them:

```bash
sudo apt-get update
sudo apt-get install -y git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
```

{% include info-bubble.html title="If docker still reports a permission error" content="<code>newgrp docker</code> activates the new group for the current shell, but some terminals don't pick it up cleanly. If <code>docker ps</code> still fails with a permission error, exit the SSH session (<code>exit</code>) and reconnect with the same <code>gcloud compute ssh</code> command. The new session will have the docker group active." %}

---

## Install bioAF on the VM

Once you're SSH'd in, the rest is identical to the scripted path. Follow **[Install bioAF on the VM]({{ '/docs/#install-bioaf-on-the-vm' | relative_url }})** on the Quick Start page to:

1. Clone the repo
2. Run `./bioaf setup`
3. Paste the one-time setup code into the web UI
4. Create your admin user, confirm the auto-detected GCP identity, and provision infrastructure

When the wizard runs on a VM with `bioaf-app` attached, it skips the key-upload step and pre-populates the project, region, and bootstrap SA email from the VM's metadata.

## Troubleshooting

**"Docker is not running"** Make sure the Docker daemon is started before running `./bioaf setup`. On a fresh GCP VM this should already be handled by the install commands in step 8.

**"Port 443 is already in use"** Another application is using port 443. Stop it, or edit `docker/.env` to change the port.

**Build fails with network errors** Check your internet connection. The build needs to download base images and dependencies.

**Can't reach the web UI on the IP `./bioaf setup` printed** The script may have detected a private IP that isn't reachable from outside the VPC. Open the [VM Instances page](https://console.cloud.google.com/compute/instances) in the Google Cloud Console and check the `bioaf` instance's **External IP** column. If there's a public IP, use that instead. If there's only a private IP (common on VMs created inside a restricted VPC), you'll need to connect through your organization's VPN, or recreate the VM with an external IP.

**IAM binding fails with "Service account ... does not exist"** Newly created SAs can take up to 30 seconds to propagate. Wait, then re-run the failing command. The IAM grant commands in step 5 are idempotent.

**Lost the setup code** Re-run `./bioaf setup`. It mints a fresh code as long as no admin account has been created yet.

If you run into other issues, check the [FAQ]({{ '/docs/faq/' | relative_url }}) or [open an issue on GitHub](https://github.com/bioAF/bioAF/issues).
