# Security and publication boundary

This is a recruiting case study, not a deployed service or a production SDK.

## Excluded by design

- Production credentials, tokens, environment files and deployment identifiers.
- User records, answers, histories, email addresses and payment data.
- Payment, webhook, entitlement, refund, reconciliation and ownership implementation.
- Production database schema, roles, policies and administration endpoints.
- Proprietary questions, complete scoring, weights, thresholds and discrimination rules.
- Private prompts, operational reports, incidents and analytics payloads.

The examples run locally and do not contact the live product. The ID helper is for local record correlation only: it is never proof of authentication, identity, ownership or payment.

## Reporting

Use this repository's **Security → Report a vulnerability** for a suspected accidental disclosure. Do not put credentials, user information or exploit details in public issues. A public example defect can be reported as an ordinary issue without sensitive data.

## Release checks

Publication uses an explicit file allowlist, a separate Git root, a noreply author identity, content and Git-object scans, source-map exclusion, dependency auditing and CI. Git hooks, credentials and production remotes are not imported.

Pattern scanning cannot establish business-IP safety or guarantee the absence of every possible secret. Human review of the small export and its provenance is required as well. A new source file must justify its recruiting value and be explicitly reviewed before it enters the allowlist.
