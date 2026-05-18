---
title: "Connecting your LIMS with the bioAF Integration API"
description: "A public API lets your LIMS and other lab systems read and write projects, experiments, and samples without manual clicks."
thumbnail: /assets/images/bioaf-lims-integration.png
---

![bioAF Integration API](/assets/images/bioaf-lims-integration.png)

Most labs already have a system of record. It might be Benchling, LabKey, an in-house Django app, or a shared Google Sheet that everyone has agreed to treat as one. Whatever it is, when bioAF lands next to it, the last thing anyone wants is a second place to type the same metadata.

So in the latest release we shipped a public Integration API: a small, documented set of HTTP endpoints that lets your LIMS (or any other lab system) push records into bioAF and read them back, without scraping the UI or owning a database credential. This post walks through what's there and what a first integration usually looks like. The authoritative reference lives in the bioAF repo at [docs/api/README.md](https://github.com/bioAF/bioAF/blob/main/docs/api/README.md), and we'll link back to the relevant sections as we go.

## What's exposed

The API lives at `/api/v1/integrations/*` on your bioAF host. Four resources are covered in v1:

- **Projects**: create, list, look up, and update.
- **Experiments**: same set of operations. Status transitions (running, complete, and so on) stay inside bioAF.
- **Samples**: same set of operations. QC status stays inside bioAF.
- **Files**: read-only metadata. The file bytes themselves still flow through bioAF's normal upload pipeline; external systems get notified when files appear and can read the metadata, but they don't push file contents over this API.

Two ideas show up everywhere in v1, so it's worth introducing them once up front:

- **`external_id`** is the ID your LIMS already uses for a record. You send it on every create, and bioAF remembers the mapping. From then on, you can look up the bioAF record using your own ID, which means your LIMS never has to store bioAF's internal IDs to stay in sync.
- **`Idempotency-Key`** is an optional header on writes. If the network drops mid-request or your sync job fires twice, sending the same key on the retry returns the original response instead of creating a duplicate. Send a different payload with the same key and bioAF rejects it as a conflict. That covers the two failure modes that always bite LIMS integrations: the network dropped after the write, and the cron job fired twice.

Full request and response shapes are documented per-resource in [docs/api/](https://github.com/bioAF/bioAF/blob/main/docs/api/README.md), and the live OpenAPI schema your instance serves at `/api/v1/integrations/openapi.json` is the source of truth.

## How callers authenticate

External systems don't log in as a person. They authenticate as a **service account**: a non-human identity scoped to your org, with one role attached and one or more **API keys** issued under it. Think of the service account as "the LIMS" or "the billing tool," and the keys as the actual secrets that tool uses to make requests.

Minting a key is a four-click flow under **Settings > Users & Accounts > Service Accounts**:

1. Create the service account and pick its role. There's an inline "Create custom role" shortcut if none of the defaults fit.
2. Click **Mint key** and give it a name (something like "LIMS prod sync").
3. Copy the full secret. It looks like `biokey_<prefix>.<secret>` and is shown exactly once, so paste it straight into your secrets manager.
4. The integration sends it as a Bearer token on every request:

```http
Authorization: Bearer biokey_AbCdEfGhIjKlMnOp.<random-secret>
```

Permissions stack from two directions. The service account's role sets the ceiling for what any of its keys can do. Each individual key then carries its own scope list, and the request only goes through if both layers allow it. In practice that means you can mint a narrow read-only key for one tool and a broader write key for another, both under the same service account, without overlapping their blast radius.

If a key leaks, revocation is immediate: disable the key (or the whole service account) and every request using it starts failing on the next call. Every write is logged to the **API Activity** tab with both the service account and the specific key that made it, so you can see exactly which integration did what.

## Pushing data in from a LIMS

A typical LIMS integration runs in one direction. The LIMS stays the source of truth for projects, experiments, and samples, and bioAF mirrors them so pipelines and reports can run against the same records. The shape of the integration is usually:

1. **Create the project.** `POST /projects` with the LIMS project ID as `external_id`. bioAF returns its own internal `id` plus a human-readable `code` (the per-org counter, like `bioap-0008`), which is what users see in the UI.
2. **Create the experiments.** `POST /experiments` against that project, again carrying the LIMS experiment ID as `external_id`.
3. **Create the samples.** `POST /samples` for each row in the LIMS, with the LIMS sample ID as `external_id`. Sample IDs only need to be unique within an experiment, not across the whole org.
4. **Keep them in sync.** When something changes in the LIMS, send a `PATCH` to update the matching bioAF record. If your side only kept the LIMS-side ID, look up the bioAF record first with `GET /{resource}/by-external/{external_id}`.

Creates are intentionally strict. If you try to create a second record with an `external_id` that already exists, bioAF returns `409 external_id_already_exists` instead of silently merging the two. The worst LIMS bugs we've seen are the ones where two records collapse into one because the integration was too forgiving, so this one is on purpose. If you want a safe retry, use `Idempotency-Key`. If you want to change an existing record, use `PATCH`.

## Pulling data out for any lab system

The read side is the mirror of the write side. Any tool that wants to see what's in bioAF can authenticate with a read-only ("view") key and either list records (`GET /experiments`) or look up a specific one by an ID it already knows (`GET /experiments/by-external/{external_id}`). List endpoints are paginated and accept the usual filters.

That covers most of the integrations we see in practice: a notebook that needs to walk every sample in an experiment, a billing system that wants to count active projects per org, a dashboard that surfaces QC status, all without giving anything direct database access to bioAF.

## Reacting to changes with webhooks

The read endpoints handle "what's in bioAF right now," but a lot of integrations also need to know the moment something changes. Polling works, but it's wasteful and always slightly stale, so bioAF also ships outbound webhooks. Subscribe a URL under **Settings > Users & Accounts > Webhooks**, pick the events you care about, and bioAF will `POST` JSON to that URL when those events fire.

The current event catalog:

- `experiment.created`, `experiment.updated`, `experiment.status_changed`
- `sample.created`, `sample.updated`, `sample.qc_changed`
- `file.registered`, `file.ready`

The payload itself is intentionally small: the event name, the entity's bioAF ID, and its `external_id`. If you want the full record, call the matching read endpoint. That keeps webhooks light and means there's only one canonical place to read "what does this sample look like now," instead of trying to keep webhook payloads and the source data in sync.

A few operational details worth knowing up front:

- **Delivery is at-least-once.** If your endpoint returns an error or times out, bioAF retries with backoff at 1m, 5m, 30m, 2h, and 12h. After the fifth failure the delivery is parked in a dead-letter state, and an operator can replay it (or any past delivery) from the deliveries table in the UI.
- **Deliveries are de-duplicatable.** Each one carries an `X-bioAF-Delivery` header with a unique ID, so your handler can ignore repeats safely.
- **Deliveries are signed.** Each request includes an `X-bioAF-Signature` header, computed with a secret shown once when you create the subscription (and regenerable from the UI). Anyone writing the receiving endpoint should verify it before trusting the payload.

For the developer wiring up the receiver, signature verification looks like this in Python:

```python
import hmac, hashlib, time

t, v1 = parse_signature(request.headers["X-bioAF-Signature"])
message = f"{t}.".encode() + request.body
expected = hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
assert hmac.compare_digest(expected, v1)
assert abs(time.time() - int(t)) < 300
```

A constant-time compare and a 5-minute timestamp window is enough to block replay attacks. The full webhook contract, including the signature header format and the retry schedule, is documented in [docs/api/](https://github.com/bioAF/bioAF/blob/main/docs/api/README.md).

## What this API is not

A few things the API deliberately doesn't do, worth flagging so you can plan around them:

- **It's not a file-upload route.** File bytes still flow through bioAF's normal ingest pipeline. External systems get notified about new files via the `file.registered` and `file.ready` webhooks and can read metadata, but they don't push file contents through this API.
- **It's not a status-machine controller.** Experiment and sample status (and sample QC status) are driven by what actually happens inside bioAF (pipeline completion, QC review, and so on). The API rejects attempts to write those fields directly, on purpose, so the lifecycle stays consistent.
- **It's not a way to manage service accounts or API keys.** That stays in the admin UI behind a normal user login. Keys are minted by humans, on purpose.

## Where to look next

The full contract docs live in the bioAF repo at [docs/api/README.md](https://github.com/bioAF/bioAF/blob/main/docs/api/README.md), with separate pages for the overview, authentication, conventions, each resource, and webhooks. The authoritative machine-readable schema is whatever your running instance serves at `/api/v1/integrations/openapi.json`, and there's a Swagger UI at `/api/v1/integrations/docs` if you'd rather click through the endpoints than read the spec.

If you're wiring up a first integration, the shortest path that tends to work is:

1. Mint a key with the smallest scope set you can get away with.
2. Run the create-or-update flow against a non-production org first, so a misconfigured `external_id` doesn't pollute real data.
3. Verify the webhook signature on the receiving side before you trust any event payload.

The contract is stable from here forward, so anything you build against v1 will keep working as v1 grows.
