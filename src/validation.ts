import { isLocale, isMarket } from "./context.js";
import { dimensions, type Snapshot } from "./model.js";

/** New illustrative validation, not a copy of production history validation. */
export interface ValidationIssue {
  readonly field: string;
  readonly code: "INVALID_OBJECT" | "INVALID_IDENTIFIER" | "INVALID_DATE" |
    "INVALID_LOCALE" | "INVALID_MARKET" | "INVALID_TYPE" | "INVALID_DIMENSIONS";
}

export type SnapshotValidation =
  | { readonly valid: true; readonly snapshot: Snapshot }
  | { readonly valid: false; readonly issues: readonly ValidationIssue[] };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(value);
}

function isCanonicalUtcDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value;
}

export function validateSnapshot(value: unknown): SnapshotValidation {
  if (!isObject(value)) return { valid: false, issues: [{ field: "snapshot", code: "INVALID_OBJECT" }] };
  const issues: ValidationIssue[] = [];
  for (const field of ["id", "schemaVersion", "modelVersion", "questionnaireVersion"] as const) {
    if (!isIdentifier(value[field])) issues.push({ field, code: "INVALID_IDENTIFIER" });
  }
  if (!isCanonicalUtcDate(value.capturedAt)) issues.push({ field: "capturedAt", code: "INVALID_DATE" });
  if (!isLocale(value.locale)) issues.push({ field: "locale", code: "INVALID_LOCALE" });
  if (!isMarket(value.market)) issues.push({ field: "market", code: "INVALID_MARKET" });
  if (typeof value.displayedType !== "string" || !/^[EI][SN][TF][JP]$/.test(value.displayedType)) {
    issues.push({ field: "displayedType", code: "INVALID_TYPE" });
  }
  const scores = value.dimensions;
  if (!isObject(scores) || Object.keys(scores).length !== dimensions.length || dimensions.some((dimension) => {
    const score = scores[dimension];
    return typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 100;
  })) issues.push({ field: "dimensions", code: "INVALID_DIMENSIONS" });
  if (issues.length > 0) return { valid: false, issues };
  // Only documented public fields survive. Unknown input fields are not forwarded.
  return {
    valid: true,
    snapshot: {
      id: value.id as string,
      schemaVersion: value.schemaVersion as string,
      modelVersion: value.modelVersion as string,
      questionnaireVersion: value.questionnaireVersion as string,
      capturedAt: value.capturedAt as string,
      locale: value.locale as Snapshot["locale"],
      market: value.market as Snapshot["market"],
      displayedType: value.displayedType as Snapshot["displayedType"],
      dimensions: Object.fromEntries(dimensions.map((dimension) => [dimension, (scores as Record<string, number>)[dimension]])) as unknown as Snapshot["dimensions"],
    },
  };
}
