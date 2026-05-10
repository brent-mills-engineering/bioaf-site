---
layout: docs
title: Notebook Sessions
description: Launch JupyterHub and RStudio sessions with versioned environments.
---

bioAF provides managed notebook sessions for interactive analysis, no need to install anything locally or manage servers.

## JupyterHub and RStudio

Choose the environment that fits your workflow:

- **JupyterHub**: Python-based analysis with Jupyter notebooks
- **RStudio Server**: R-based analysis with the full RStudio IDE

Both run in your browser. Your files are saved to cloud storage, so your work persists across sessions.

## Versioned environments

Every notebook session runs in a **versioned environment**, a specific set of packages and tools. This means:

- Your analysis is reproducible: the same environment produces the same results
- You can update packages without breaking existing work
- You can always go back to a previous environment version

Create environments by uploading a Dockerfile or conda specification. bioAF builds the image and makes it available for sessions.

<img src="{{ '/assets/images/screenshot-notebook-environment.png' | relative_url }}" alt="Notebook session environment selection" class="screenshot-img">

<img src="{{ '/assets/images/screenshot-rstudio-server.png' | relative_url }}" alt="RStudio Server running in browser within a bioAF notebook session" class="screenshot-img">

## Idle auto-stop

To manage costs, sessions automatically stop after a configurable idle period. When you come back, restart the session and pick up where you left off, your files are still there.

{% include info-bubble.html title="How does idle detection work?" content="bioAF monitors your session for activity (keyboard input, running computations). If there's no activity for the configured timeout period (default: 60 minutes), the session shuts down gracefully, saving your work to cloud storage." %}

## Terminal access

Need a command line? Click the **Terminal** button on any running session to open a browser-based terminal directly into the session container. This is useful for:

- Installing one-off packages
- Running quick shell commands
- Debugging environment issues
