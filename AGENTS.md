# Testing

For a user-visible behavior change, a new unit, or a bug fix, read [the testing matrix](docs/testing.md) before editing. It defines the public behavior each unit protects and the cases that require real-device agent verification.

1. Choose one public seam: a deterministic rule, a state boundary, or a teacher/student browser flow.
2. Make that seam red with a focused test, then implement the smallest change that makes it green.
3. Keep deterministic behavior in `lib/**/*.test.ts`; use E2E only when a browser flow crosses a meaningful UI boundary. Keep microphone, WebRTC, physics, and projection checks in the matrix's agent-verification column.
4. Run the affected test first, then the relevant project scripts from `package.json`. Update the matrix when a unit's public behavior or agent-verification need changes.

Done means the changed behavior has a passing test at its chosen seam and the matrix still describes it accurately.

# UI

Before writing or changing any UI — a new component, a layout change, a color, an animation, a new page — read [the design system](.agents/skills/design-system/SKILL.md). It defines which token expresses which intent for color, type scale, stacking, and motion.

Done means `pnpm lint:tokens` is clean and the change was seen in both light and dark.

# Units

Before adding a teaching unit or a hub page, or restructuring an existing one, read [the unit page guide](.agents/skills/unit-page/SKILL.md). It defines the order a new unit is registered in, which template each page type uses, and the product conventions every unit honours.

1. Register the unit in `app/pages.config.ts` first. The home grid, sitemap, llms.txt, OG images, and the floating chrome all read from it.
2. Add its `pageSeo` entry in `lib/seo-content.ts`. Without one, `buildMetadata` throws and `/llms.txt` returns 500.
3. Reuse the shared parts: breadcrumb through `PageTitleBar`, top-bar buttons through `ACTION_BTN`, fullscreen through the `#game-stage` trio.
4. Keep `intro` and `faq` true to what the unit actually does. That copy is what the page, search engines, and AI crawlers all read, so a stale sentence is wrong in three places at once.

Done means the unit is reachable from the home grid, `pnpm test` and `pnpm lint:tokens` are clean, and `docs/testing.md` describes its public behavior.
