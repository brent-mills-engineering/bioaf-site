---
layout: docs
title: Setup & Deploy
description: Manual install steps for users who prefer to click through GCP themselves.
---

This page covers the manual path: creating a GCP project, installing the `gcloud` CLI, provisioning a VM, and setting up firewall rules and a service account by hand. Use this if the scripted installer on [Quick Start]({{ '/docs/' | relative_url }}) isn't an option (for example, you're on Windows, or you have an existing project with custom IAM).

Both paths converge once you're SSH'd into the VM. See **[Install bioAF on the VM](#install-bioaf-on-the-vm)** at the bottom of this page.

{% include info-bubble.html title="You'll only need to do this once" content="These steps create a GCP project, a VM, a firewall rule, and a service account, then install bioAF on the VM. They produce the same result as the scripted installer." %}

---

## 1. Set up GCP

1. Go to [cloud.google.com](https://cloud.google.com) and click **Get started for free** (or sign in if you already have an account). New accounts get a free trial credit.
2. In the [GCP Console](https://console.cloud.google.com), open the menu (&#9776;) → **Billing** → **Add billing account** and attach a payment method.
3. Click the project dropdown at the top → **New Project** → name it (e.g., `bioaf-prod`), attach your billing account, and click **Create**.

Write down the **Project ID** (e.g., `bioaf-prod-123456`). You'll need it in the next step.

{% include info-bubble.html title="Why do I need a credit card for free software?" content="bioAF is free. But it runs on Google's servers, which aren't free. You pay Google directly for the compute, storage, and database resources bioAF uses. Google requires a payment method on file before they'll provision any infrastructure." %}

## 2. Set up the gcloud CLI

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

## 3. Enable the required GCP APIs

bioAF uses thirteen GCP APIs for compute, storage, IAM, logging, and related services. Enable all of them on your project (replace `YOUR_PROJECT_ID`):

```bash
PROJECT_ID=YOUR_PROJECT_ID

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
  --project="$PROJECT_ID"
```

This can take a minute. You won't be able to create the VM or service account below until the APIs are enabled.

## 4. Provision the VM

```bash
gcloud compute instances create bioaf \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --tags=bioaf \
  --zone=us-central1-a
```

Adjust `--zone` if you'd rather run closer to your team. See [Compute Engine regions and zones](https://cloud.google.com/compute/docs/regions-zones) for the full list.

{% include info-bubble.html variant="warning" title="Known current limitations" content="<ul><li><strong>us-central1</strong> is known to work.</li><li><strong>us-west1</strong> has an aggressive quota that blocks automated deployment — you'll need to contact Google to raise your quota first.</li><li>Cross-region deployments are currently a beta feature.</li></ul>" %}

## 5. Set up the firewall rule

```bash
gcloud compute firewall-rules create bioaf-allow-web \
  --direction=INGRESS \
  --action=ALLOW \
  --rules=tcp:80,tcp:443 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=bioaf
```

This opens HTTP and HTTPS to your VM. For details on tightening the source ranges, see [VPC firewall rules](https://cloud.google.com/firewall/docs/firewalls).

## 6. Set up the service account

Create the service account bioAF will use to provision its own resources:

```bash
gcloud iam service-accounts create bioaf-app \
  --display-name="bioAF Application"
```

Grant it the thirteen roles the bioAF setup wizard expects (replace `YOUR_PROJECT_ID`):

```bash
PROJECT_ID=YOUR_PROJECT_ID
SA_EMAIL="bioaf-app@${PROJECT_ID}.iam.gserviceaccount.com"

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
  roles/serviceusage.serviceUsageViewer \
  roles/viewer
do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="$role"
done
```

Generate a JSON key. You'll upload this in the web UI later:

```bash
gcloud iam service-accounts keys create ~/Desktop/bioaf-sa-key.json \
  --iam-account="$SA_EMAIL"
```

{% include info-bubble.html title="Keep that key file safe" content="The JSON key gives whoever holds it full access to your GCP project. Don't commit it to GitHub, share it over email, or leave it in a public location. Store it in a password manager or a secure folder on your machine." %}

## 7. SSH to the VM

The easiest option is the gcloud CLI:

```bash
gcloud compute ssh bioaf --zone=us-central1-a
```

Or click the **SSH** button next to `bioaf` on the [VM Instances page](https://console.cloud.google.com/compute/instances) in the GCP Console to open a browser-based terminal.

If the VM is missing Docker or Git (it will be on a fresh image), install them before continuing:

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
4. Create your admin user, upload your service account JSON, and provision infrastructure

## Troubleshooting

**"Docker is not running"** — Make sure the Docker daemon is started before running `./bioaf setup`. On a fresh GCP VM this should already be handled by the install commands in step 7.

**"Port 443 is already in use"** — Another application is using port 443. Stop it, or edit `docker/.env` to change the port.

**Build fails with network errors** — Check your internet connection. The build needs to download base images and dependencies.

**Can't reach the web UI on the IP `./bioaf setup` printed** — The script may have detected a private IP that isn't reachable from outside the VPC. Open the [VM Instances page](https://console.cloud.google.com/compute/instances) in the Google Cloud Console and check the `bioaf` instance's **External IP** column. If there's a public IP, use that instead. If there's only a private IP (common on VMs created inside a restricted VPC), you'll need to connect through your organization's VPN, or recreate the VM with an external IP.

**Lost the setup code** — Re-run `./bioaf setup`. It mints a fresh code as long as no admin account has been created yet.

If you run into other issues, check the [FAQ]({{ '/docs/faq/' | relative_url }}) or [open an issue on GitHub](https://github.com/not-that-guy-again/bioAF/issues).
