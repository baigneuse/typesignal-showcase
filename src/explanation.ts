import type { ComparisonResult } from "./comparison.js";
import { dimensions, type Dimension } from "./model.js";

/**
 * Independently written, illustrative narration of arithmetic differences.
 * Does not score, classify, infer causes or describe statistical significance.
 */
export type DescriptiveExplanation =
  | {
    readonly status: "insufficient_evidence";
    readonly reason: Extract<ComparisonResult, { status: "insufficient_evidence" }>["reason"];
    readonly summary: string;
  }
  | {
    readonly status: "descriptive";
    readonly labelSummary: string;
    readonly dimensionObservations: readonly {
      readonly dimension: Dimension;
      readonly delta: number;
      readonly largestAbsoluteChange: boolean;
      readonly text: string;
    }[];
    readonly limitation: string;
  };

export function explainComparison(result: ComparisonResult): DescriptiveExplanation {
  if (result.status === "insufficient_evidence") return {
    status: "insufficient_evidence",
    reason: result.reason,
    summary: "These records cannot be compared under this example's compatibility rules. No change interpretation is generated.",
  };
  const largestMagnitude = Math.max(...dimensions.map((dimension) => Math.abs(result.deltas[dimension])));
  const largestCount = dimensions.filter((dimension) => Math.abs(result.deltas[dimension]) === largestMagnitude).length;
  return {
    status: "descriptive",
    labelSummary: result.label.changed
      ? `The supplied label changed from ${result.label.previous} to ${result.label.current}.`
      : `The supplied label stayed ${result.label.current}; compare the dimensions separately.`,
    dimensionObservations: dimensions.map((dimension) => {
      const delta = result.deltas[dimension];
      const magnitude = Math.abs(delta);
      const largestAbsoluteChange = magnitude > 0 && magnitude === largestMagnitude;
      const direction = delta > 0 ? dimension[2] : dimension[0];
      const text = delta === 0
        ? `${dimension} has no numerical change in this pair.`
        : `${dimension} moved ${magnitude} ${magnitude === 1 ? "point" : "points"} toward ${direction}${
          largestAbsoluteChange
            ? `; ${largestCount > 1 ? "tied for the largest" : "the largest"} absolute change in this pair`
            : "; a smaller absolute change than the largest in this pair"
        }.`;
      return { dimension, delta, largestAbsoluteChange, text };
    }),
    limitation: "These are descriptive scale-point differences, not probabilities, evidence of a cause or a diagnosis. The supplied labels are not calculated by this example. Decimal differences use 12 significant digits; this is arithmetic precision, not a measurement threshold.",
  };
}
