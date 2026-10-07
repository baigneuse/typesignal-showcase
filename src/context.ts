/**
 * Reduced excerpt adapted from the shipped TypeSignal product.
 * Locale names and the five active market names are retained. Prices, payment
 * policies, market defaults and production routing are intentionally excluded.
 */
export type Locale = "zh-Hans" | "zh-Hant" | "ja" | "en";
export type Market = "JP" | "TW" | "HK" | "GLOBAL_ZH" | "GLOBAL_EN";

export const locales: readonly Locale[] = ["ja", "zh-Hant", "zh-Hans", "en"];
export const marketIds: readonly Market[] = ["JP", "TW", "HK", "GLOBAL_ZH", "GLOBAL_EN"];

export const isLocale = (value: unknown): value is Locale =>
  locales.includes(value as Locale);
export const isMarket = (value: unknown): value is Market =>
  marketIds.includes(value as Market);

/** A language choice does not silently select a commercial market. */
export interface ProductContext {
  readonly locale: Locale;
  readonly market: Market;
}
