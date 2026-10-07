# Language is not market

TypeSignal separates three concerns: **locale** chooses language and localized content, **market** chooses commercial policy, and **deployment** describes the hosting environment. None should be inferred solely from another.

The showcase models four locales—Japanese, English, Simplified Chinese, and Traditional Chinese—and five markets: JP, TW, HK, GLOBAL_ZH, and GLOBAL_EN. A Traditional Chinese interface does not, by itself, decide whether the commercial context is Taiwan or Hong Kong. An English interface likewise does not imply a particular currency or price.

In the product design, localized question text retains a common measurement identity. Natural translation requires attention to the scenario, option polarity, and whether a question asks about preference, ability, or likely behavior. Character conversion alone cannot establish equivalent wording.

**Implemented here:** independent locale and market types, validators, and snapshot comparison rules. The showcase conservatively refuses cross-locale comparison but permits a valid market change. This is a demonstration policy, not a claim that translated instruments have established measurement equivalence.

Translations, market pricing, commerce policies, deployment configuration, and production routing are excluded. The tradeoff is an explicit context contract reviewers can test without shipping a second, incomplete version of the application. See [architecture](architecture.md) for the broader separation of responsibilities.
