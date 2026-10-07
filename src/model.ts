import type { ProductContext } from "./context.js";

/** Independently reduced showcase model; not TypeSignal's production schema. */
export const dimensions = ["E-I", "S-N", "T-F", "J-P"] as const;
export type Dimension = (typeof dimensions)[number];
export type FourLetterType = `${"E" | "I"}${"S" | "N"}${"T" | "F"}${"J" | "P"}`;

/**
 * Illustrative scale: 0..100 toward the SECOND pole, not a probability.
 * These scores are hand-authored in examples, never scored from real answers.
 */
export type DimensionScores = Readonly<Record<Dimension, number>>;

export interface Snapshot extends ProductContext {
  readonly id: string;
  readonly schemaVersion: string;
  readonly modelVersion: string;
  readonly questionnaireVersion: string;
  readonly capturedAt: string;
  /** Supplied label. This repository deliberately cannot calculate a label. */
  readonly displayedType: FourLetterType;
  readonly dimensions: DimensionScores;
}

/**
 * Illustrative architectural boundary only. No scoring implementation, weights,
 * classification boundary, question bank or candidate ranking is published.
 */
export interface MeasurementEngine {
  evaluate(input: {
    readonly locale: ProductContext["locale"];
    readonly questionnaireVersion: string;
    readonly responses: readonly {
      readonly itemId: string;
      readonly selection: string;
    }[];
  }): Promise<{
    readonly modelVersion: string;
    readonly displayedType: FourLetterType;
    readonly dimensions: DimensionScores;
  }>;
}
