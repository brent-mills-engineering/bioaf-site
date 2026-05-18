---
layout: docs
title: LIMS Integration API
description: A public, key-authenticated REST surface plus signed outbound webhooks for syncing projects, experiments, and samples with your existing lab systems.
---

bioAF ships a public Integration API at `/api/v1/integrations/*` so your LIMS (Benchling, LabKey, an in-house Django app, a shared spreadsheet) can read and write bioAF records without scraping the UI or holding a database credential. Outbound webhooks let those same systems react to bioAF-side changes the moment they happen.

This page is the setup guide. The full request and response contract lives in the bioAF repo so there is exactly one place it can drift: [docs/api/README.md](https://github.com/bioAF/bioAF/blob/main/docs/api/README.md). The authoritative machine-readable schema is whatever your running instance serves at `/api/v1/integrations/openapi.json`, with a Swagger UI at `/api/v1/integrations/docs`.

## What the API covers

Four resources in v1, all under `/api/v1/integrations/*`:

- **Projects**: create, list, look up, update.
- **Experiments**: same set of operations. Status transitions stay inside bioAF.
- **Samples**: same set of operations. QC status stays inside bioAF.
- **Files**: read-only metadata. File bytes still flow through the normal upload pipeline; external systems get notified when files appear and can read the metadata, but they do not push file contents through this API.

Two ideas show up everywhere:

- **`external_id`**: the ID your LIMS already uses for a record. You send it on every create and bioAF remembers the mapping, so your LIMS never has to store bioAF's internal IDs to stay in sync. Look up a record with `GET /{resource}/by-external/{external_id}`.
- **`Idempotency-Key`**: optional header on writes. If the network drops mid-request or your sync job fires twice, sending the same key on the retry returns the original response instead of creating a duplicate.

## Set up a service account

External systems do not log in as a person. They authenticate as a **service account**: a non-human identity scoped to your org, with one role attached and one or more **API keys** issued under it. Think of the service account as "the LIMS" or "the billing tool," and the keys as the actual secrets that tool uses to make requests.

1. Sign in as an admin and open **Settings &rarr; Users & Accounts**.
2. Switch to the **Service Accounts** tab and click **Create**. Give it a name (something like "Benchling sync") and pick its role. There is an inline "Create custom role" shortcut if none of the defaults fit.
3. The service account itself has no credentials. To mint one, open the service account's detail drawer and click **Mint key**.
4. Name the key (something like "LIMS prod sync") and pick its scopes. Scopes are `resource:action` strings: `projects:view`, `experiments:create`, `samples:edit`, `files:view`, and so on. The effective permission a key has is the intersection of its service account's role and its own scope list, so you can hand the same service account both a narrow read-only key and a broader write key without overlapping their blast radius.
5. Copy the full secret. It looks like `biokey_<prefix>.<secret>` and is shown exactly once. Paste it straight into your secrets manager. Reloading the page never re-reveals it.

The integration sends the key as a Bearer token on every request:

```http
Authorization: Bearer biokey_AbCdEfGhIjKlMnOp.<random-secret>
```

If a key leaks, revocation is immediate: disable the key (or the whole service account) and every request using it starts failing on the next call.

## Make your first call

With a key minted, hit any read endpoint to confirm auth works:

```bash
curl -H "Authorization: Bearer biokey_..." \
  https://<your-host>/api/v1/integrations/projects
```

A typical LIMS push then looks like:

1. **Create the project.** `POST /projects` with the LIMS project ID as `external_id`. bioAF returns its own internal `id` plus a human-readable `code` (the per-org counter, like `bioap-0008`), which is what users see in the UI.
2. **Create the experiments.** `POST /experiments` against that project, again carrying the LIMS experiment ID as `external_id`.
3. **Create the samples.** `POST /samples` for each row in the LIMS, with the LIMS sample ID as `external_id`. Sample IDs only need to be unique within an experiment, not across the whole org.
4. **Keep them in sync.** When something changes in the LIMS, send a `PATCH` to update the matching bioAF record. If your side only kept the LIMS-side ID, look up the bioAF record first with `GET /{resource}/by-external/{external_id}`.

Creates are intentionally strict. If you try to create a second record with an `external_id` that already exists, bioAF returns `409 external_id_already_exists` instead of silently merging the two. Use `Idempotency-Key` for safe retries, and `PATCH` to change an existing record.

Full request and response shapes per resource live in the [API reference](https://github.com/bioAF/bioAF/blob/main/docs/api/README.md):

- [Authentication and Authorization](https://github.com/bioAF/bioAF/blob/main/docs/api/auth.md)
- [Conventions](https://github.com/bioAF/bioAF/blob/main/docs/api/conventions.md) (error envelope, pagination, idempotency, status codes)
- [Projects](https://github.com/bioAF/bioAF/blob/main/docs/api/projects.md)
- [Experiments](https://github.com/bioAF/bioAF/blob/main/docs/api/experiments.md)
- [Samples](https://github.com/bioAF/bioAF/blob/main/docs/api/samples.md)
- [Files](https://github.com/bioAF/bioAF/blob/main/docs/api/files.md)

## Subscribe to changes with webhooks

The read endpoints handle "what is in bioAF right now," but most integrations also need to know the moment something changes. bioAF ships signed outbound webhooks for that.

1. In **Settings &rarr; Users & Accounts &rarr; Webhooks**, click **Create**. Give it a name, a destination URL (HTTPS in production), and pick the event types it should receive.
2. On submit, bioAF reveals the HMAC signing secret once. Store it the same way you stored an API key.
3. bioAF will `POST` JSON to your URL when matching events fire.

The v1 event catalog:

- `experiment.created`, `experiment.updated`, `experiment.status_changed`
- `sample.created`, `sample.updated`, `sample.qc_changed`
- `file.registered`, `file.ready`

The payload is intentionally small: the event name, the entity's bioAF ID, and its `external_id`. If you need the full record, call the matching read endpoint. That keeps webhooks light and means there is one canonical place to read "what does this sample look like now."

A few operational details worth knowing up front:

- **Delivery is at-least-once.** If your endpoint returns an error or times out, bioAF retries with backoff at 1m, 5m, 30m, 2h, and 12h. After the fifth failure the delivery moves to dead-letter and an operator can replay it (or any past delivery) from the **Webhooks &rarr; Deliveries** table.
- **Deliveries are de-duplicatable.** Each carries an `X-bioAF-Delivery` header with a unique ID, so your handler can ignore repeats safely.
- **Deliveries are signed.** Each request includes `X-bioAF-Signature` computed with the subscription secret. Verify it before trusting the payload.

Signature verification in Python:

```python
import hmac, hashlib, time

t, v1 = parse_signature(request.headers["X-bioAF-Signature"])
message = f"{t}.".encode() + request.body
expected = hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
assert hmac.compare_digest(expected, v1)
assert abs(time.time() - int(t)) < 300
```

A constant-time compare and a 5-minute timestamp window is enough to block replay attacks. The [full webhook contract](https://github.com/bioAF/bioAF/blob/main/docs/api/webhooks.md), including the exact signature header format, lives with the rest of the API reference.

## Audit and observability

Every integration request writes a row to the audit log tagged with both the service account and the specific key that made it. Open **Settings &rarr; Users & Accounts &rarr; API Activity** to see a paginated, filterable view: timestamp, service account, key prefix, resource, action, IP. Row click opens the full event detail.

If a key is ever leaked, this is also where you confirm the blast radius before revoking.

## What this API is not

A few deliberate omissions, worth flagging so you can plan around them:

- **It is not a file-upload route.** File bytes still flow through the normal ingest pipeline. External systems get notified via `file.registered` and `file.ready` and can read metadata, but they do not push contents through this API.
- **It is not a status-machine controller.** Experiment and sample status (and sample QC status) are driven by what actually happens inside bioAF (pipeline completion, QC review). The API rejects attempts to write those fields directly, on purpose, so the lifecycle stays consistent.
- **It is not a way to manage service accounts or API keys.** That stays in the admin UI behind a normal user login. Keys are minted by humans, on purpose.

## Where to look next

- [API reference on GitHub](https://github.com/bioAF/bioAF/blob/main/docs/api/README.md): the authoritative contract for every endpoint and event.
- `/api/v1/integrations/docs` on your own host: a Swagger UI you can click through.
- [Connecting your LIMS with the bioAF Integration API]({{ '/blog/connecting-your-lims-with-the-bioaf-integration-api/' | relative_url }}): a longer walk-through of what a first LIMS integration looks like in practice.
