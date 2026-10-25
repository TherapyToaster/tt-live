# tt-live

Live status feed for the Twitter Spaces banner on [therapytoaster.com](https://www.therapytoaster.com).

A scheduled GitHub Action asks the Twitter API whether a Space is live and commits the answer to [`status.json`](status.json). GitHub Pages serves that file at:

```
https://therapytoaster.github.io/tt-live/status.json
```

Pages sends `Access-Control-Allow-Origin: *`, so the website's banner script can fetch it from another domain. The repo also hosts a few public images (`alt-art/`) and a shop promo clip (`promo/`) that the site links to.

## status.json

The website depends on this exact shape. Do not rename or remove fields.

```json
{
  "live": false,
  "id": null,
  "title": null,
  "url": null,
  "started_at": null,
  "updated": "2026-10-24T23:33:55Z"
}
```

| Field | Meaning |
| --- | --- |
| `live` | `true` while a Space is live. |
| `id` | Space id, or `null`. |
| `title` | Space title, or `null`. |
| `url` | `https://twitter.com/i/spaces/<id>`, or `null`. |
| `started_at` | ISO time the Space started, from the API, or `null`. |
| `updated` | UTC time of the last successful check. The banner treats an old value as stale and hides, so a stuck file cannot say "live" forever. |

## How it works

- [`check_space.py`](check_space.py) calls `GET /2/spaces/by/creator_ids` for one user id and writes `status.json`. Python standard library only.
- If the API call fails (no token, rate limit, outage), it prints the error, leaves `status.json` untouched, and exits 0. The `updated` time then goes stale and the banner hides on its own.
- [`.github/workflows/live-status.yml`](.github/workflows/live-status.yml) runs the script, then commits `status.json` as `live-bot`. It has a `concurrency` group so runs never overlap, and a 5-minute `timeout-minutes` cap.

### Secret

The workflow needs one repository secret: `X_BEARER_TOKEN`, an app bearer token from the [Twitter developer portal](https://developer.x.com/). Set it in **Settings → Secrets and variables → Actions**. It is never written to any file in this repo.

## How often it really runs

The cron line asks for every 5 minutes, but **GitHub's scheduler is best effort**. On a public repo, runs are delayed or skipped when Actions is busy, and in practice a check lands about every 2 to 3 hours. GitHub also disables schedules after 60 days without repo activity (the status commits count as activity).

For timely checks, trigger the workflow from an outside cron service (cron-job.org, a cloud scheduler, or a machine you control) every few minutes:

```bash
# workflow_dispatch
curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/TherapyToaster/tt-live/actions/workflows/live-status.yml/dispatches \
  -d '{"ref":"main"}'

# or repository_dispatch
curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/TherapyToaster/tt-live/dispatches \
  -d '{"event_type":"live-check"}'
```

Use a fine-grained token scoped to this repository only (**Actions: read and write** for workflow_dispatch, or **Contents: read and write** for repository_dispatch), stored only in the cron service's secret settings. You can also run it by hand: **Actions → spaces-live-status → Run workflow**.

## Run locally

```bash
X_BEARER_TOKEN=... python3 check_space.py
```

## Want your own?

[TherapyToaster/toaster-site-template](https://github.com/TherapyToaster/toaster-site-template) is a reusable version of the site with the same live bar built in.
