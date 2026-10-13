# 002 — Job fetching from free sources

## Goal
Every 6 hours, collect open software jobs from a seed list of central-Israel companies and store them normalized and deduplicated, so later features can score and show them.

## User stories
- As a job seeker, I want new jobs from companies I care about collected automatically, so I don't check career pages daily.
- As a job seeker, I want to paste a job link or text, so jobs from LinkedIn or Israeli boards are included too.

## Acceptance criteria
- [ ] A seed list (`companies` table) holds company name, ATS type, and board id.
- [ ] Supported ATS adapters: Greenhouse, Lever, Comeet (others later).
- [ ] A repeatable job enqueues one `fetch-source` job per company every 6 hours.
- [ ] Each raw API response is stored in Mongo `raw_postings` with source, company, and fetched_at.
- [ ] Each posting is normalized to: title, company, location, is_remote, url, description, posted_at, source, external_id.
- [ ] Jobs are upserted in Postgres by `(source, external_id)`; no duplicates after repeated runs.
- [ ] Jobs not seen in the latest fetch are marked closed.
- [ ] A failing company/source does not stop others; each `fetch-source` job retries 3 times with exponential backoff.
- [ ] Outgoing requests are rate-limited per ATS host and time out after 10 seconds.
- [ ] `POST /jobs/manual` accepts a URL or raw text and creates a job (AI extraction comes in a later spec; for now store text as description).

## Out of scope
- Relevance scoring and filtering.
- UI for jobs.
- SmartRecruiters, Workable, Ashby, HN adapters.

## Open questions
- Initial seed list of companies and their ATS ids.
