# Measurement design

The production design separates question identity and measurement metadata from localized text. That separation matters because improving Japanese phrasing should not silently change scoring, and changing commercial availability should not change a person's assessment result.

This showcase exposes a `MeasurementEngine` **interface only**. It illustrates a boundary between responses and a versioned result; there is no implementation that evaluates answers, chooses a type, or ranks candidates. The production question bank, scoring rules, weights, and classification decisions are not published here.

The runnable example instead supplies fictional dimension values and four-letter labels by hand. Its illustrative scales run toward each pair's second pole. These values are neither probabilities nor measurements collected from users, and the example does not verify that a supplied label follows from the values.

Validation checks the shape of a snapshot, its versions, language, market, timestamp, label format, and finite dimension values. These are software integrity checks, not psychometric validation.

The tradeoff is reviewability without a misleading imitation of the instrument. A reviewer can inspect contracts and failure behavior while seeing exactly which substantive measurement decisions remain outside this repository. Continue with [comparison policy](drift.md) to see how those contracts are used.
