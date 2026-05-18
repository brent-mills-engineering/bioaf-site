---
title: "AI Review: an LLM advisory layer for pipeline outputs"
description: "Hosted LLM reviews of completed pipeline runs and experiment-wide comparisons, with a prompt builder for what to ask, support for prompt customization, and audit logging."
thumbnail: /assets/images/bioaf-llm-integration.png
---

![AI Review](/assets/images/bioaf-llm-integration.png)

Reviewing pipeline outputs by hand is one of the slower steps in a comp-bio workflow. Open the QC dashboard, scan the metrics, cross-reference the sample sheet, remember what a "good" mito percentage looked like for this organism on this protocol, decide if the run is usable. Do that across an experiment with eight runs and the loop takes a real chunk of the week.

So in the latest release we shipped **AI Review**: a hosted LLM advisory layer that sits next to a Pipeline Run or an Experiment and produces severity-coded notes about what looks normal, what looks off, and what is worth a second look. It's optional, opt-in per provider, and never enters the data provenance that makes up your scientific record.

## Three providers, one active at a time

AI Review supports three AI providers today: **OpenAI ChatGPT**, **Anthropic Claude**, and **Google Gemini**. An admin opens **Settings > Integrations > LLMs**, pastes an API key for each provider they want available, picks which model to use from a list, and clicks **Set active** on exactly one of them.

A few details worth knowing:

- **You can save keys for all three providers at once, but only one is active for the whole organization at a time.** Switching from OpenAI to Claude is a single click, and you don't have to re-paste your key.
- **Activating a provider shows a warning that explains data is about to be sent to a third party.** The decision is explicit, not buried in a settings toggle.
- **Test connection** is a one-click check per provider. It confirms the key works without wasting your API budget.

![Configuring an LLM provider](/assets/images/screenshot-configure-llm.png)

**Review a single pipeline run.** This option lives on a completed Pipeline Run's details page and asks the LLM to look at a single run's parameters, sample sheet, output data, and QC report, and flag anything worth attention: outlier samples, unusual QC distributions, parameter mismatches, signs of failure.

**Review a whole Experiment.** This option lives on an Experiment's details page. You pick which of the experiment's pipeline runs to compare; the LLM gets the full experimental design metadata (hypothesis, design type, protocol version, design variables), metadata from every sample on the experiment (not only the samples linked to the included runs, so cross-arm and cross-donor signals are visible), and the per-run summaries. The point is to surface patterns no single-pipeline-run review can see: batch drift across timepoints, treatment-arm imbalance, donor effects that only show up when you put the runs side by side.

Running either review option opens a section-based prompt builder so you can choose what the AI focuses on.

## The prompt builder

Out of the box, both reviews load a prompt builder that lets you choose from a wide variety of options. Each option adds a templated section to the prompt that gets sent to the AI. You can then preview the completed prompt and customize it before sending. You can even save your customized prompt for future use.

- **Tick boxes individually** if you only want the AI to focus on a few things.
- **Click "Display prompt"** to preview the exact wording before starting the review.
- **Customize the prompt** in a text box and either use the edit once ("Use this once") or name it and save it for the whole organization ("Save and run"). Saved prompts show up in a dropdown the next time anyone starts a review.

![Section builder for an AI review](/assets/images/screenshot-ai-review-prompt-builder.png)

If you set up AI Review last week and want today's review to ask about something specific that the catalog doesn't cover, the one-off custom prompt covers it. If your lab keeps coming back to the same question, save it once.

![Customizing an AI review prompt](/assets/images/screenshot-ai-review-custom-prompt.png)

## What the cards look like

Reviews show up as cards in a new **AI Review** tab on both the Pipeline Run and Experiment pages. A "pending" card appears as soon as you start a review and updates on its own when the AI finishes.

When the review completes, the card resolves into one of three states:

- **Red bar.** A major concern (likely failure, contamination, or a parameter mismatch that affects what comes next).
- **Orange bar.** Something strange but not a clear failure (an outlier sample, an unusual QC distribution).
- **Green bar.** Nothing flagged. The run looks consistent with expectations.

The card itself shows a short headline, the date and time, which provider and model were used, and badges if the review was customized, has gone stale, failed, or was dismissed. Click it to open the full report: the AI's complete write-up, the specific flags it raised, the evidence it cited, and an expandable "Prompt details" panel showing exactly which options were selected (or the custom prompt that was used).

![AI Review tab on a Pipeline Run](/assets/images/screenshot-ai-review-pipeline-run.png)

![AI Review tab on an Experiment](/assets/images/screenshot-ai-review-experiment.png)

![AI Review detail modal](/assets/images/screenshot-ai-review-details.png)

Cards can be dismissed for the whole organization, and un-dismissed later from the "dismissed" filter. Dismissal is reversible by design: your lab decides when an advisory has been addressed.

## Stale badges on experiment reviews

When you run an experiment-wide review and someone later adds a new pipeline run to that experiment, the existing card doesn't silently go out of date. It picks up a **stale** badge so anyone reading it knows the comparison was made before the latest run was included. The card is otherwise unchanged, and re-running is a single click when you want a fresh comparison.

## Data Privacy

AI Review only sends a structured Markdown summary that bioAF builds for each review. The summary is assembled from your database and every file is strictly controlled. 

For a single pipeline run, the summary contains:

- The pipeline run metadata
- The sample metadata
- The pipeline's output record (typically a manifest of result files plus any structured output the pipeline writes back to bioAF)
- The QC values from the run's QC Dashboard, with any HTML removed
- Any errors the run recorded

For an experiment-wide review, the summary also includes the experiment metadata and a wider sampling of per-sample metadata.

What is never sent:

- **Raw sequencing reads.** FASTQ, BAM, and CRAM never appear in the summary.
- **The contents of input or output files on disk.** The summary references
  your pipeline's output record, but the bytes of those files are never read
  or transmitted.
- **Pipeline or container logs.**
- **Your full API keys.** Only the last five characters are recorded in the
  activity log so you can identify which key was used.

## A complete activity log

Every meaningful action is recorded so you can answer questions about it later:

- **Provider configuration.** Saving a key, switching the active provider, removing one, or testing a connection.
- **Each review sent.** Which provider and model were used, the last five characters of the API key (so you can identify which key was used without anyone ever seeing the full secret), a copy of every file that was sent, and which prompt the review used.
- **Each review's outcome.** Whether it succeeded or failed, the severity rating on success, or the error message on failure.

If your compliance team ever asks "did we ever send sample S-123 to a third-party AI?", the activity log answers it directly.

## What AI Review is not

A few things the surface deliberately doesn't do, so you can plan around them:

- **It's not part of the scientific record.** The AI's note sits next to the run or experiment. It does not appear in any analysis snapshot or submission. Dropping every review tomorrow would not change any of your lineage or results.
- **It's not a chat window.** Today, the two reviews are button-driven with structured prompts you can customize. There's no back-and-forth conversation per run.
- **It's not for project-wide or single-sample reviews.** The two scopes are Pipeline Run and Experiment.
- **It does not retry on its own.** If a review fails or the provider rejects the request, the failed card shows you what went wrong and you can re-run it yourself. There are no silent retries and no automatic switching between providers.
- **It does not manage your AI spend.** Billing happens on your provider account, on their terms. Bring your own API key.

## Where to look next

The settings page is under **Settings > Integrations > LLMs**. The review buttons appear on the Pipeline Run details page once the run has finished, and on the Experiment details page at any time. The AI Review tab on both pages is visible to anyone who can already view the run or experiment. Only users with the AI review permission can start new reviews.

If you're rolling AI Review out for the first time, the shortest path is: get an API key from one provider, activate it from the settings page, run an AI review against a completed run you already know the answer for, and use that to figure out which options give you the most useful advisories for your lab's workflow. Save the prompt configurations that work, and ignore the ones that don't.

The AI's output is a research-assistant note, not part of the scientific record. Used that way, it removes a real chunk of the manual scan time without changing how the science is recorded.
