---
layout: docs
title: AI Review
description: Hosted LLM advisories on completed pipeline runs and full experiments. Bring your own API key for Claude, ChatGPT, or Gemini.
---

AI Review is an optional, opt-in advisory layer that sits next to a Pipeline Run or an Experiment and produces severity-coded notes about what looks normal, what looks off, and what is worth a second look. It never enters the data provenance that makes up your scientific record.

This page is the setup guide and operator's reference. For the wider context (what reviews feel like in practice, what shipped and what didn't), see the launch post: [AI Review: an LLM advisory layer for pipeline outputs]({{ '/blog/ai-review-llm-assisted-pipeline-triage/' | relative_url }}).

## Supported providers

AI Review supports three AI providers today. Pick one based on what your org already pays for.

- **Anthropic Claude**
- **OpenAI ChatGPT**
- **Google Gemini**

Keys for all three can be saved at once, but exactly one provider is active for the whole organization at a time. Switching between them is a single click and does not require re-pasting any key.

## Configure a provider

Configuration lives behind the `llm_integration:configure` permission, which is granted to the `admin` role at install time.

1. Sign in as an admin and open **Settings &rarr; Integrations &rarr; LLMs**.
2. Pick a provider card and click **Save**. Paste an API key from that provider and pick a model from the dropdown. bioAF live-fetches the model list using your key; if the fetch fails (network, invalid key), the dropdown falls back to a pinned list and a small note shows which list you are seeing.
3. Click **Test connection** to confirm the key works. The test exchanges one short request with the provider and does not run a real review.
4. Click **Set active** on exactly one provider. Activating a hosted provider triggers a visible data-egress warning that you must explicitly confirm. The decision is on purpose, not buried in a toggle.

To switch providers, click **Set active** on a different card. To turn the feature off entirely, click **Disable LLM**, which clears the active provider while preserving every saved key.

Keys are encrypted at rest. Once saved, they are never displayed in plaintext. Only the last five characters appear in the audit log, so you can identify which key was used for any past review without anyone ever seeing the full secret.

## Grant permission to use reviews

Running a review is gated separately from configuring a provider, so a comp bio user can trigger reviews on runs they own without also being able to swap the active provider.

- `llm_integration:configure`: admins only by default. Reads and writes the integration settings.
- `llm_integration:use`: granted to the `admin` and `comp_bio` roles by default. Lets a user start a review.

Anyone who can already view a Pipeline Run or Experiment can see the **AI Review** tab and read any reviews on it. The buttons that start a new review are hidden for users without `llm_integration:use`.

To extend or restrict access, edit a role under **Settings &rarr; Users & Accounts &rarr; Roles** and add or remove these two permissions as appropriate.

## Run a review

Two review types ship in v1, both button-driven.

**Review a single pipeline run.** On a completed Pipeline Run details page, click **Review this pipeline run**. The LLM gets the run's parameters, sample sheet, output record, and QC report, and flags anything worth attention: outlier samples, unusual QC distributions, parameter mismatches, signs of failure.

**Review a whole experiment.** On an Experiment details page, click **Review across experiment**. Pick which of the experiment's runs to compare; the LLM gets the experimental design metadata, sample metadata for the whole experiment (so cross-arm and cross-donor signals are visible), and the per-run summaries. The point is to surface patterns no single-pipeline-run review can see.

Both buttons open a section-based **prompt builder** before sending anything to the provider:

- Tick boxes to add only the analyses you want.
- Click **Display prompt** to preview the exact wording.
- Customize the prompt and either run it once ("Use this once") or name it and save it for the whole org ("Save and run"). Saved prompts appear in a dropdown for anyone starting a future review.

Reviews appear as cards in a new **AI Review** tab on both the Pipeline Run and Experiment details pages. A "pending" card appears as soon as you click; it updates on its own when the provider responds. Cards resolve to one of three severity colors (red, orange, green) and link through to the AI's full write-up, the flags it raised, the evidence it cited, and a "Prompt details" panel showing exactly which options were selected.

Experiment-wide cards pick up a **stale** badge when a new pipeline run is later added to the experiment. The card is otherwise unchanged, and re-running is a single click. Cards can be dismissed org-wide and un-dismissed later from the dismissed filter.

## What is and is not sent

AI Review only sends a structured Markdown summary that bioAF assembles for each review. For a single pipeline run, the summary contains:

- The pipeline run metadata (name, version, parameters, timing)
- The sample metadata
- The pipeline's output record (typically a manifest of result files plus any structured output the pipeline writes back to bioAF)
- The QC values from the run's QC Dashboard, with any HTML removed
- Any errors the run recorded

For an experiment-wide review, the summary also includes the experiment-level design metadata (hypothesis, design type, protocol version, design variables) and per-sample metadata for every sample on the experiment (not only the samples linked to the included runs).

**Never sent**:

- Raw sequencing reads: FASTQ, BAM, and CRAM never appear in the summary.
- The contents of input or output files on disk. The summary references your pipeline's output record, but the bytes of those files are never read or transmitted.
- Pipeline or container logs.
- Your full API keys. Only the last five characters are recorded in the audit log.

If you want to see exactly what was sent for any given review, every job persists its outbound Markdown artifact under the pipeline run's existing artifact directory.

## Audit logging

Every meaningful action writes a row to the audit log so your compliance team can answer questions about it later:

- **Provider configuration**: saving a key, switching the active provider, removing one, testing a connection.
- **Each review sent**: which provider and model were used, the last five characters of the API key, the artifact paths that were transmitted, and which prompt was used.
- **Each review's outcome**: whether it succeeded or failed, the severity rating on success, or the error message on failure.

If your compliance team asks "did we ever send sample S-123 to a third-party AI?", the audit log answers it directly.

## Failure modes worth knowing

- **No provider enabled**: the review buttons are hidden entirely. The AI Review tab still appears on existing entities, read-only.
- **Active provider has no key set**: buttons are visible but disabled with a tooltip explaining the gap.
- **Hosted provider returns an error** (auth, rate limit, server error, invalid key): the pending card resolves to a failed card with the error message. No silent retries, no automatic switching between providers.
- **Provider returns a malformed response**: the card resolves with `severity = unknown` and a parse-failure note. The free-text body is still shown in the modal.
- **Payload too large** for the active provider's context window: the job fails with a typed error and surfaces a "payload too large" card. v1 has no auto-truncation.
- **Concurrent review of the same entity**: the button is disabled while one review is pending. You can still start a different review type on the same entity.

If a review fails, the card is left in place so you can see what went wrong. Re-run is manual and one click.

## What AI Review is not

A few things this surface deliberately does not do, so you can plan around them:

- **It is not part of the scientific record.** The note sits next to the run or experiment. It does not appear in any analysis snapshot or submission. Dropping every review tomorrow would not change any of your lineage or results.
- **It is not a chat window.** The two reviews are button-driven with structured prompts. There is no back-and-forth conversation per run.
- **It is not for project-wide or single-sample reviews.** The two scopes are Pipeline Run and Experiment.
- **It does not retry on its own.** Failed reviews stay failed until you re-run.
- **It does not manage your AI spend.** Billing happens on your provider account, on their terms. Bring your own API key.

## Where to look next

- Settings page: **Settings &rarr; Integrations &rarr; LLMs**.
- Review buttons: on a Pipeline Run details page once the run has finished, and on an Experiment details page at any time.
- [AI Review: an LLM advisory layer for pipeline outputs]({{ '/blog/ai-review-llm-assisted-pipeline-triage/' | relative_url }}): the launch post, with screenshots of the prompt builder, the AI Review tab, and the detail modal.
