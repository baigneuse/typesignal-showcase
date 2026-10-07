import { dimensions, type Dimension, type FourLetterType } from "./model.js";
import { validateSnapshot, type ValidationIssue } from "./validation.js";

/** New illustrative arithmetic only; deliberately not the production drift engine. */
export type ComparisonResult =
  | {
    readonly status: "insufficient_evidence";
    readonly reason: "INVALID_SNAPSHOT" | "SCHEMA_VERSION_MISMATCH" |
      "MODEL_VERSION_MISMATCH" | "QUESTIONNAIRE_VERSION_MISMATCH" |
      "LOCALE_MISMATCH" | "NON_CHRONOLOGICAL";
    readonly validationIssues?: readonly ValidationIssue[];
  }
  | {
    readonly status: "comparable";
    readonly label: {
      readonly previous: FourLetterType;
      readonly current: FourLetterType;
      readonly changed: boolean;
    };
    /** Current minus previous, in scale points; 12 significant digits, not percentages. */
    readonly deltas: Readonly<Record<Dimension, number>>;
    readonly limitation: "DESCRIPTIVE_DIFFERENCES_ONLY_CAUSE_NOT_ESTABLISHED";
  };

export function compareSnapshots(previousInput: unknown, currentInput: unknown): ComparisonResult {
  const previousValidation = validateSnapshot(previousInput);
  const currentValidation = validateSnapshot(currentInput);
  if (!previousValidation.valid || !currentValidation.valid) return {
    status: "insufficient_evidence",
    reason: "INVALID_SNAPSHOT",
    // Return issue categories only; never echo raw input values or answer content.
    validationIssues: [
      ...(!previousValidation.valid ? previousValidation.issues.map((issue) => ({ ...issue, field: `previous.${issue.field}` })) : []),
      ...(!currentValidation.valid ? currentValidation.issues.map((issue) => ({ ...issue, field: `current.${issue.field}` })) : []),
    ],
  };
  const previous = previousValidation.snapshot;
  const current = currentValidation.snapshot;
  if (previous.schemaVersion !== current.schemaVersion) return { status: "insufficient_evidence", reason: "SCHEMA_VERSION_MISMATCH" };
  if (previous.modelVersion !== current.modelVersion) return { status: "insufficient_evidence", reason: "MODEL_VERSION_MISMATCH" };
  if (previous.questionnaireVersion !== current.questionnaireVersion) return { status: "insufficient_evidence", reason: "QUESTIONNAIRE_VERSION_MISMATCH" };
  if (previous.locale !== current.locale) return { status: "insufficient_evidence", reason: "LOCALE_MISMATCH" };
  if (Date.parse(current.capturedAt) <= Date.parse(previous.capturedAt)) return { status: "insufficient_evidence", reason: "NON_CHRONOLOGICAL" };
  // A valid market switch is allowed: commercial context is not measurement language.
  return {
    status: "comparable",
    label: { previous: previous.displayedType, current: current.displayedType, changed: previous.displayedType !== current.displayedType },
    // Normalize binary floating-point artifacts (e.g. 0.3 - 0.2) for this demo.
    // This is numeric precision, not a measurement threshold or zero tolerance:
    // even a very small nonzero change remains nonzero.
    deltas: Object.fromEntries(dimensions.map((dimension) => [
      dimension,
      Number((current.dimensions[dimension] - previous.dimensions[dimension]).toPrecision(12)),
    ])) as Record<Dimension, number>,
    limitation: "DESCRIPTIVE_DIFFERENCES_ONLY_CAUSE_NOT_ESTABLISHED",
  };
}
