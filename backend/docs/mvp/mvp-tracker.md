# MVP Live-Route Inventory (AFI-05)

Cross-reference for `api-contract.md`. Update the Status column as routes move through the cutover.

| Route | Method | Status | Verified dataset(s) | Source files |
|---|---|---|---|---|
| `/api/datasets` | GET | STABLE V1 | n/a (lists all) | datasetRoutes.js, datasetsController.js, datasetService.js, datasetRepository.js |
| `/api/datasets/:id` | GET | STABLE V1 | n/a | same as above |
| `/api/datasets` | POST | DISABLED (ingestion-only) | n/a | datasetsController.js |
| `/api/datasets/:name/series` | GET | STABLE V1 — verified live | thingspeak-live (12 real rows captured) | seriesRoutes.js, seriesController.js, timeseriesService.js, timeseriesRepository.js |
| `/api/datasets/:name/series/filter` | POST | STABLE V1 — verified live | thingspeak-live | same as above |
| `/api/datasets/:name/timestamps` | GET | STABLE V1 — verified live | thingspeak-live | timestampsRoutes.js, timestampsController.js |
| `/api/register` | POST | STABLE V1 (gaps noted) | n/a | auth.js, authController.js, authService.js, userRepository.js |
| `/api/login` | POST | STABLE V1 (gaps noted) | n/a | same as above |
| `/api/refresh-token` | POST | STABLE V1 (gaps noted) | n/a | same as above |
| `/api/logout` | POST | STABLE V1 (gaps noted) | n/a | same as above |
| `/api/admin/users` | GET | STABLE V1 (gaps noted) | n/a | same as above, + authMiddleware, roleMiddleware |
| `/api/feeds` | GET | STABLE V1 — verified live | thingspeak-live | thingspeak.js, thingspeakController.js, thingspeakService.js |
| `/api/analyse` | POST | NOT READY (placeholder only) | n/a | analyseRoutes.js, analyseController.js, analyseService.js |
| `/api/alerts/latest` | GET | NOT READY — does not exist | n/a | blocked on BDAI-10 |
| `/api/alerts/history` | GET | NOT READY — does not exist | n/a | blocked on BDAI-11 |
| `/api/streams` | GET | TRANSITIONAL (mock) | n/a — mock JSON | mock.js, mockController.js, mockService.js, mockRepository.js |
| `/api/stream-names` | GET | TRANSITIONAL (mock) | n/a — mock JSON | same as above |
| `/api/filter-streams` | POST | TRANSITIONAL (mock) | n/a — mock JSON | same as above |
| `/api/data-profile` | GET | TRANSITIONAL (mock) | n/a — mock JSON | same as above |
| `/api/top-correlated-pair` | POST | TRANSITIONAL (mock) | n/a — mock JSON | same as above |

**Pending datasets to verify and add:** `2881821`, `3036461` (CSV-ingested, same shape as `1350261`, not yet confirmed end-to-end).

## Frontend call audit (completed)

| FE area | Calls | Status |
|---|---|---|
| Login | none — localStorage only | Not wired |
| Registration | none — localStorage only (plaintext password stored) | Not wired |
| Forgot Password | `POST /api/auth/forgot-password` | Calls a route that doesn't exist on the backend |
| Dashboard data | none reach the network — `useSensorData(true, ...)` hardcodes mock mode, loads bundled `src/data/sensorData1.json`, `fetch('/api/streams')` branch is dead code | Not wired, not even to the transitional mock route |
| Route guard | localStorage/sessionStorage flags | Not wired |

**Conclusion: none of the audited FE pages currently call a live backend route.** See `api-contract.md` §8 for full detail and required follow-up work before live cutover.

## Live evidence run (completed) — see `api-contract.md` §9 and `evidence/api-samples.json` for full detail

Real requests captured against a working local instance (Postgres `IoTDatabase`, ThingSpeak polling confirmed for channel 12397 / `thingspeak-live`). All 9 planned samples captured, including both 404 error cases — `evidence/api-samples.json` has no remaining fabricated entries.

Three findings from this run, tracked as open items in `api-contract.md`:

| Finding | Detail | Impact |
|---|---|---|
| Undocumented `dataset_id` field | `GET /api/datasets/:name/series` returns `dataset_id` on every row — not in the documented example shape | Doc correction needed |
| ThingSpeak canonical-name mapping exists, unused | `GET /api/feeds`'s `channel` object carries real field-name labels (e.g. `field3: "% Humidity"`) sourced from ThingSpeak itself | Answers part of the open canonical-metric-naming question — for ThingSpeak-origin datasets only, not CSV-origin |
| Temperature unit mismatch | `field4` is Fahrenheit at the ThingSpeak source; `/api/feeds` returns it unlabeled as `temperature` | Feeds into the open units-mapping decision |
| `JWT_SECRET` missing from `.env`, no fallback in `tokenUtils.js` | Login silently succeeds (via `authService.js`'s fallback secret) but every protected route then fails token verification with a misleading "Invalid or expired token" | Real bug — blocks all protected-route testing until fixed; worth fixing the fallback mismatch and documenting the var as required |

**1350261 (CSV dataset) was not exercised in this evidence run** — only `thingspeak-live` was live-tested. Still marked "verified" only for `thingspeak-live` above; CSV datasets remain pending verification.
