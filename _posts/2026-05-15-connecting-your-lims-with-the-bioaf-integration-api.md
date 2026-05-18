---
title: "Connecting your LIMS with the bioAF Integration API"
description: "A public API lets your LIMS and other lab systems read and write projects, experiments, and samples without manual clicks."
thumbnail: /assets/images/bioaf-lims-integration.png
---

![bioAF Integration API](/assets/images/bioaf-lims-integration.png)

Most labs already have a system of record. It might be Benchling, LabKey, an in-house Django app, or a shared Google Sheet that everyone has agreed to treat as one. Whatever it is, when bioAF lands next to it, the last thing anyone wants is a second place to type the same metadata.

So in the latest release we shipped a public Integration API. External systems can now create and update projects, experiments, and samples in bioAF, and any downstream lab tool can read the same records back without scraping the UI or owning a database credential.

## What's exposed

The API lives at `/api/v1/integrations/*` on your bioAF host and ships its own OpenAPI document at `/api/v1/integrations/openapi.json`. Four resources are covered in v1:

- **Projects**: create, list, get, get-by-external-id, patch.
- **Experiments**: create, list, get, get-by-external-id, patch. Status transitions stay inside bioAF.
- **Samples**: create, list, get, get-by-external-id, patch. QC status stays inside bioAF.
- **Files**: read-only metadata. Bytes still flow through the internal upload pipeline; external systems learn about new files via webhooks and can read metadata only.

Every write upserts by `external_id`, which is required on create. Send the same `Idempotency-Key` header on a retry and bioAF returns the original response instead of creating a duplicate. Send a different payload with the same key and bioAF rejects it as a conflict. That covers the two failure modes that always bite LIMS integrations: the network dropped after the write, and the cron job fired twice.

## How callers authenticate

External systems authenticate as a **service account**, which is an org-scoped identity that cannot log in to the UI. Service accounts hold one role and own one or more **API keys**.

Minting a key is a four-click flow under **Settings > Users & Accounts > Service Accounts**:

1. Create the service account and pick its role (or use the inline "Create custom role" shortcut to define a new one).
2. Click **Mint key** and name the key.
3. Copy the full secret. It looks like `biokey_<prefix>.<secret>` and is shown exactly once. bioAF stores only a bcrypt hash.
4. Send it as a Bearer token on every request:

```http
Authorization: Bearer biokey_AbCdEfGhIjKlMnOp.<random-secret>
```

Authorization is a strict intersection: each request must satisfy both the key's scope list and the service account's role permissions. Shortening a key's scopes narrows what one integration can do without touching the service account. Changing the service account's role narrows or broadens every key under it at once. The public scope alphabet is per-resource and per-action: `projects:create`, `samples:edit`, `files:view`, and so on.

Revocation is immediate. Disabling a service account revokes all of its keys at once. Every mutating call writes an audit row tagged with both the service account and the specific API key, so the **API Activity** tab tells you which key did what.

## Pushing data in from a LIMS

A typical LIMS integration runs in one direction: the LIMS is the source of truth for projects, experiments, and samples, and bioAF mirrors them so pipelines can run against the data. The flow is:

1. `POST /projects` with the LIMS project ID as `external_id`. bioAF returns its internal `id` and an auto-generated `code` (the per-org odometer, e.g. `bioap-0008`).
2. `POST /experiments` against that project, again carrying the LIMS experiment ID as `external_id`.
3. `POST /samples` for each row in the LIMS, with the LIMS sample ID as `external_id`. Per-experiment uniqueness is enforced.
4. On any later edit in the LIMS, `PATCH /{resource}/{id}` (or look up by `/by-external/{external_id}` first if you only kept the LIMS-side ID).

Duplicate `external_id` returns `409 external_id_already_exists` rather than silently upserting. That's deliberate: in practice the worst LIMS bugs are the ones where two records collapse into one because the integration was too forgiving. If you want a safe retry, use `Idempotency-Key`; if you want an update, use `PATCH`.

## Pulling data out for any lab system

The read side is the mirror of the write side. Any tool that wants to see what's in bioAF can authenticate with a `*:view`-scoped key and either list (`GET /experiments`) or look up by the external ID it already knows (`GET /experiments/by-external/{external_id}`). The list endpoints are cursor-paginated and accept the usual filters.

That covers the common cases: a notebook that needs to enumerate every sample in an experiment, a billing system that wants to count active projects per org, a downstream dashboard that surfaces QC status without taking a database dependency on bioAF.

## Reacting to changes with webhooks

Polling works, but it's wasteful and always slightly stale. So bioAF also ships outbound webhooks. Subscribe a URL under **Settings > Users & Accounts > Webhooks**, pick the events you care about, and bioAF will `POST` JSON to that URL when those events fire.

The current event catalog:

- `experiment.created`, `experiment.updated`, `experiment.status_changed`
- `sample.created`, `sample.updated`, `sample.qc_changed`
- `file.registered`, `file.ready`

Each delivery carries three headers: `X-bioAF-Event`, `X-bioAF-Delivery` (a unique ID for dedupe), and `X-bioAF-Signature` in the form `t=<unix-seconds>,v1=<hex-sha256>`. The signed message is `<t>.<raw-body>`, keyed by the subscription's secret (shown once at create time, regenerable from the UI). Verifying it with a constant-time compare and a 5-minute timestamp window is enough to block replay attacks:

```python
import hmac, hashlib, time

t, v1 = parse_signature(request.headers["X-bioAF-Signature"])
message = f"{t}.".encode() + request.body
expected = hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
assert hmac.compare_digest(expected, v1)
assert abs(time.time() - int(t)) < 300
```

Delivery is at-least-once. If your endpoint returns a 4xx or 5xx (or times out), bioAF retries with backoff at 1m, 5m, 30m, 2h, and 12h. After the fifth failure the delivery is moved to `dead_letter` and stops retrying; an operator can replay any delivery, including dead-lettered ones, from the deliveries table. The payload itself is intentionally minimal: an event name, an entity ID, and an `external_id`. If you want the full row, call the matching read endpoint.

## What this API is not

A few things the public surface deliberately doesn't do, so you can plan around them:

- **It's not a file-upload route.** File bytes still flow through bioAF's internal ingest pipeline. External systems get `file.registered` and `file.ready` webhooks and can read metadata, but not push payloads.
- **It's not a status-machine controller.** Experiment and sample status transitions are driven by bioAF internals (pipeline completion, QC review, and so on). `POST` and `PATCH` reject `status` and `qc_status` writes.
- **It's not a way to manage service accounts or keys.** That stays in the JWT-authenticated admin UI. Keys are minted by humans, on purpose.

## Where to look next

The human-readable contract docs ship inside the bioAF repo under `docs/api/` (overview, auth, conventions, per-resource endpoints, and webhooks). The authoritative schema is whatever your running instance serves at `/api/v1/integrations/openapi.json`, and there's a Swagger UI at `/api/v1/integrations/docs` if you want to poke at it interactively.

If you're wiring up your first integration, the shortest path is: mint a key with the smallest scope set you can get away with, write the create-or-update flow against a non-production org first, and verify the webhook signature on the receiving side before you trust any event payload. The contract is stable from here forward.
