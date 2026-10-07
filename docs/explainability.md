# Explainability without false certainty

TypeSignal's product interpretation distinguishes a displayed type from dimensional tendencies, nearby candidates, and answer evidence. A useful explanation should connect a statement to the responses behind it, while preserving uncertainty about what those responses mean outside the assessment.

Three principles guide that design:

- A close candidate is context for interpretation, not proof that someone has two separate personalities.
- A score describes the product's result representation; it is not the probability of a person's true identity.
- Differences across assessments describe recorded responses. They do not, by themselves, establish why a person changed or whether their personality changed.

The tradeoff is between giving a readable explanation and overstating the evidence. More detail is useful only when the product can distinguish observations, interpretation, and limitations.

**This repository does not include the production explanation engine.** Its runnable comparison returns supplied labels, raw dimension deltas, and an explicit limitation that causes are not established. It cannot generate nearby-type rankings or attribute a difference to particular answers.

The [synthetic example](../examples/synthetic-drift.ts) makes that smaller contract inspectable. [Historical comparison](drift.md) explains why some records are deliberately rejected rather than given a confident narrative.
