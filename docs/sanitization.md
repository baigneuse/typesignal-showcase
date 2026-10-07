# Public scope and provenance

Security-safe is not automatically business-safe. This export is a selected case study with new, unrelated Git history; it is not a copy of the commercial product with credentials removed.

## Classification before export

The source inventory was reviewed in five categories. The detailed private file inventory is not published.

| Category | Treatment |
| --- | --- |
| PUBLIC_SAFE | Generic code eligible for deliberate selection, never bulk export |
| PUBLIC_AFTER_SANITIZATION | New high-level explanation or reduced independent interface |
| PRIVATE_PRODUCT_IP | Questions, mappings, weights, calibration, thresholds, production measurement/explanation/drift logic remain excluded |
| PRIVATE_SECURITY | Authentication, payments, entitlement, ownership, roles and policies remain excluded |
| PRIVATE_OPERATIONS | Environments, deployment metadata, incident history, logs and internal workflows remain excluded |

## What was selected

| Public files | Provenance and modifications |
| --- | --- |
| `src/context.ts` | Adapted public locale/market identifiers and generic guards from the shipped product; all prices, commercial defaults, provider policy and routing removed |
| `src/client-id.ts` | Generic local-ID helper retained; explicit non-authentication purpose preserved |
| Other `src/` files | Independently authored reduced contracts, validation, arithmetic and narration; no production engine copied |
| `examples/` | Hand-authored fictional profiles, labels, dates and version names; no user records or production outputs |
| `tests/` | Small public contract/counterexample suite; no proprietary fixtures or production measurement baselines |
| Documentation and diagrams | New case-study explanations at architecture level; no private operational evidence exported |
| Tooling and CI | Standalone build, checks and dependency graph; no production service dependencies |

The measurement engine is **interface-only**. There is no executable question scoring or label classifier here. The comparison routine subtracts already-supplied values; it does not implement the commercial longitudinal interpretation system. Production thresholds, behavioral rules and calibration are not included; these independently authored examples are not calibrated to production.

## Publication controls

`scripts/public-files.json` is the reviewed allowlist. The scanner rejects unexpected publishable files and checks the current export, compiled files and, with `--history`, all Git objects available locally. It flags credential patterns, personal/local paths, unsupported hosts, email addresses other than GitHub noreply identities, provider identifiers and source maps. Results report categories and repository-relative paths only.

The history gate checks every commit's author/committer and requires one root. CI fetches full history. A fresh anonymous clone is also checked after publication. These checks complement, rather than replace, the editorial/IP review.

Only the already-public product origin is linked. There is no database connection, backend deployment, payment integration, user dataset or separate hosted clone. Public visibility applies to this showcase alone.
