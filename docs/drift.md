# Comparing repeated results

Historical comparison asks two separate questions: did the displayed label change, and how did the recorded dimension values differ? Neither answer alone establishes a change in personality or its cause.

The [synthetic example](../examples/synthetic-drift.ts) supplies INTP and INTJ labels alongside fictional values. The comparison reports current minus previous values: `+1`, `-1`, `0`, and `-6` scale points. It does not derive the labels, classify the size of the movement, or calculate confidence. A different supplied label can even accompany identical values; the tests preserve that distinction.

This showcase uses a deliberately conservative comparability policy. Both snapshots must validate, share their data-format, model, and questionnaire versions, use the same locale, and appear in chronological order. A valid market change alone does not prevent comparison because commercial context is separate from assessment language.

Incompatible records return `insufficient_evidence` with a reason. Validation errors identify fields and issue categories without echoing arbitrary input values.

This is a small illustrative implementation, not the full production drift engine or its decision rules. Rejecting uncertain comparisons sacrifices coverage for clarity: a missing comparison is preferable to an unsupported story. See [measurement design](measurement-design.md) for the input contract.
