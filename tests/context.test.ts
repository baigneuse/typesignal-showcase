import assert from "node:assert/strict";
import test from "node:test";
import { isLocale, isMarket, locales, marketIds, type ProductContext } from "../src/context.js";

test("locale and market are independent, explicitly validated concepts", () => {
  assert.equal(isLocale("zh-Hant"), true);
  assert.equal(isMarket("TW"), true);
  assert.equal(isLocale("TW"), false);
  assert.equal(isMarket("zh-Hant"), false);
  for (const locale of locales) for (const market of marketIds) {
    const context: ProductContext = { locale, market };
    assert.equal(isLocale(context.locale) && isMarket(context.market), true);
  }
});

test("unknown, legacy and non-string context values are rejected", () => {
  for (const value of [null, undefined, {}, [], 0, "", "jp", "zh-CN", "MAINLAND_CN"]) {
    assert.equal(isLocale(value), false);
    assert.equal(isMarket(value), false);
  }
});
