# MVP Live-Route Inventory (AFI-05)

> **Updated 2026-09-25** to reflect the current merged `main` (post PR #172, PR #182 "add-authentication"). Supersedes the earlier version of this file, which documented pre-authentication, name-based routes (`GET /api/datasets/:name/series`, `POST /api/register`) that are no longer the current contract. Route statuses below were re-verified live, with real captured evidence in `evidence/api-samples.json`.

Cross-reference for `api-contract.md`. Update the Status column as routes move through the cutover.

| Route | Method | Status | Verified dataset(s) | Notes |
|---|---|---|---|---|
| `/api/auth/register` | POST | STABLE V1 | n/a | Email/password, current contract |
| `/api/auth/login` | POST | STABLE V1 — verified live | n/a | Returns `202` + `mfaChallengeId` when MFA is enabled for the account, confirmed live |
| `/api/auth/mfa/verify` | POST | STABLE V1 — verified live | n/a | Confirmed live; returns real `accessToken` on success |
| `/api/auth/mfa/resend` | POST | STABLE V1 | n/a | Not re-verified this pass |
| `/api/auth/refresh` | POST | STABLE V1 | n/a | Not re-verified this pass |
| `/api/auth/logout` | POST | STABLE V1 | n/a | Not re-verified this pass |
| `/api/auth/password-reset/request` | POST | STABLE V1 | n/a | Not re-verified this pass |
| `/api/auth/password-reset/confirm` | POST | STABLE V1 | n/a | Not re-verified this pass |
| `/api/datasets` | GET | STABLE V1 — verified live | thingspeak-live (id 14095) | Requires `Authorization: Bearer <accessToken>`; confirmed `401 UNAUTHENTICATED` without a token |
| `/api/datasets/:id` | GET | STABLE V1 | thingspeak-live (id 14095) | Not re-verified this pass |
| `/api/datasets` | POST | STABLE V1 | n/a | CSV import, implemented (see `api-contract.md` DATA-01) |
| `/api/datasets/:id` | PUT | STABLE V1 | n/a | Not re-verified this pass |
| `/api/datasets/:id` | DELETE | STABLE V1 | n/a | AFI-23, not re-verified this pass |
| `/api/datasets/:id/restore` | POST | STABLE V1 | n/a | AFI-24, not re-verified this pass |
| `/api/datasets/:id/series` | GET | STABLE V1 — verified live | thingspeak-live (id 14095, 165 real rows) | Current target route. Numeric id, not name; requires Bearer token |
| `/api/analyse` | POST | NOT READY (placeholder only) | n/a | No change |
| `/api/alerts/latest` | GET | NOT READY — does not exist | n/a | No change |
| `/api/alerts/history` | GET | NOT READY — does not exist | n/a | No change |
| `/api/streams`, `/stream-names`, `/filter-streams`, `/data-profile`, `/top-correlated-pair` | GET/POST | TRANSITIONAL (mock) | n/a | No change |
| `/api/register`, `/login`, `/refresh-token`, `/logout` (legacy) | POST | LEGACY — superseded | n/a | Superseded by `/api/auth/*`; do not build new work against these |
| `/api/datasets/:name/series` (legacy name-based) | GET | LEGACY — no longer the documented contract | n/a | Confirmed this route is not what the current backend serves as the target contract; do not use for new work |

## Live evidence run (2026-09-25) — see `evidence/api-samples.json` for full detail

Real requests captured against the current merged `main`, with real authentication (including MFA), against dataset `thingspeak-live` (numeric id `14095`).

Confirmed in this pass:
- `POST /api/auth/login` correctly returns `202` + `mfaChallengeId` for an MFA-enabled account
- `POST /api/auth/mfa/verify` correctly returns a real `accessToken` on success
- `GET /api/datasets` requires authentication — confirmed real `401 UNAUTHENTICATED` with no token
- `GET /api/datasets` (authenticated) returns the dataset with its real numeric `id`, not just its name
- `GET /api/datasets/{id}/series` (authenticated, numeric id) returns real wide-format rows

**Not re-verified this pass** (unchanged from the earlier audit, assumed still accurate but not re-tested): `/api/auth/mfa/resend`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/password-reset/*`, `GET /api/datasets/:id`, `PUT /api/datasets/:id`, `DELETE /api/datasets/:id`, `POST /api/datasets/:id/restore`.
