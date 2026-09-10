# design-sync notes — health-equity-tracker/frontend

## Repo shape

- This repo is a **private application** (`"private": true`), not a publishable component
  library — no `dist/`, no `main`/`module`/`exports` in `package.json`. The sync uses
  **synth-entry mode** (`componentSrcMap`-free discovery scans `src/` directly) against
  `src/styles/HetComponents/` (55 shared `Het*`-prefixed components), not the whole app.
- `--entry ./src/.entry-placeholder.js` (a path that deliberately does not exist) is passed
  on every manual build/resync so the converter's package.json walk-up lands on the repo's
  own `frontend/package.json` (name `health-equity-tracker`) instead of failing on a
  nonexistent `node_modules/health-equity-tracker-frontend/`. Do not create that placeholder
  file — its absence is what makes `resolveDistEntry` fall through to synth-entry.
- `cfg.pkg` is `"health-equity-tracker-frontend"`, a label only — it doesn't need to match
  the real `package.json` name (`health-equity-tracker`) and nothing depends on it matching.

## cssEntry — must be the COMPILED stylesheet, not src/index.css

`src/index.css` is Tailwind v4's *source* (`@import "tailwindcss";` + token file imports) —
it only becomes real CSS after Vite's PostCSS/Tailwind pipeline runs. Pointing `cssEntry` at
it directly fails validate with `[CSS_IMPORT_MISSING]` (`tailwindcss` and the token files
"don't exist" from the bundle's perspective, since the scraper copies verbatim rather than
compiling).

Fix: `cfg.buildCmd` runs `npm run build` (outputs to `frontend/build/`, not `dist/` — see
`vite.config.ts`) then copies the hashed CSS asset to a stable path:

```
npm run build && mkdir -p .design-sync/dist-css && cp build/assets/index-*.css .design-sync/dist-css/site.css
```

`cfg.cssEntry` points at that stable copy (`.design-sync/dist-css/site.css`), since the real
build output filename is content-hashed and changes every build. `.design-sync/dist-css/` is
gitignored (regenerated, not durable) — re-run `cfg.buildCmd` before every resync.

## Excluded components — Vite-only `import.meta.glob` crashes the whole bundle

`HetLocationSearch`, its internal helper `VirtualizedListbox`, `HetTopicDemographics`,
`HetDesktopToolbar`, `HetMobileToolbar`, and `HetAppBar` are excluded via
`componentSrcMap: {...: null}` (combined with the `source-kit.mjs` fork below — plain
`componentSrcMap:null` alone only drops a name from the discovered component list, not from
the synth-entry bundle). All six transitively import app data-layer modules
(`src/utils/placeSearch.ts`, `src/data/loading/DataFetcher.ts`) that call
`import.meta.glob(...)` at module top level with `eager: true`. That's a Vite build-time
macro — esbuild's IIFE bundler can't execute it (`import.meta` is emptied in `iife` output
format), so it throws `TypeError: import_meta.glob is not a function` the instant the bundle
initializes. Because the synth-entry bundles all components into one shared module graph,
this one throw prevented **every** component (not just these) from landing on `window.HET`
(`[BUNDLE_EXPORT]` failed for all) until the whole reachable set was excluded.

Two separate poison chains, discovered by tracing esbuild's own `--metafile` import graph
(see the exclusion history in git blame on this file / config.json if this list needs
re-deriving after upstream changes):

- `HetLocationSearch` → `../../utils/placeSearch.ts` (place index glob). Its internal helper
  `VirtualizedListbox` also imports `placeSearch.ts` directly (value imports, not type-only),
  so it goes too.
- `HetTopicDemographics` → `reportUtils.tsx` → `data/providers/*Provider.ts` → `globals.ts` →
  `DataFetcher.ts` (geo asset glob). Separately, `HetDesktopToolbar`/`HetMobileToolbar` →
  `pages/navigationData.ts` → `utils/blogUtils.ts` → `globals.ts` → `DataFetcher.ts` — same
  destination, different route (a nav-link constant unrelated to data-fetching, but ES module
  semantics execute a whole module's top level once any value export is used, so the unused
  `fetchHetNewsData`/`getEnvironment` machinery in `blogUtils.ts` drags `globals.ts` in
  regardless). `HetAppBar` composes both toolbars directly (not via the synth-entry, via its
  own import), so it re-triggers the same chain and had to be excluded too — user chose this
  over patching the app source (see below).

These are also arguably not pure presentational design-system primitives anyway — they're
app-specific composites wired to live geography search, data fetching, or app-wide nav config,
not components a design agent would compose freely from props alone.

## Synth-entry `export *` silently drops default-exported components

Separate bug, found via `package-validate.mjs`'s `[BUNDLE_EXPORT]` check: the synth entry
generator built each file's re-export as bare `export * from "<path>";`. ES modules never
re-export a `default` binding through `export *` (spec behavior, not a bug in the tool) — and
this repo's convention is `export default Foo` for the large majority of HetComponents (only
a handful use `export const Foo = ...` / `export function Foo() {}`). Result: 44/49 components
were `undefined` on `window.HET` even though the bundle loaded without error and the
per-component render check stayed green — an undefined component renders an empty root, which
validate's render check treats as "unauthored preview, show the floor card" rather than a
failure, so this class of bug is invisible unless you specifically check `[BUNDLE_EXPORT]` or
inspect `window.HET` directly.

Fixed in the `source-kit.mjs` fork: for every synth-entry file, also detect its default
export's real declared name via ts-morph (reusing the same technique
`deriveComponentsFromSrc` already uses for the component list) and emit an explicit
`export { default as Name } from "<path>";` line alongside the `export *` line. If this repo's
components ever move to 100% named exports, this half of the fork becomes a no-op (safe to
leave in place) rather than something that needs removing.

**Permanent fix, not taken (user declined 2026-09-10):** wrap the two `import.meta.glob(...)`
calls in `placeSearch.ts`/`DataFetcher.ts` in a memoized function instead of running them
eagerly at module scope — same behavior, resolves both chains, would let all 55 (56 minus the
1 non-component export) components sync including `HetAppBar`. No config-only fix exists (no
knob in the converter for `import.meta.glob`; the only sanctioned handled cases are
`import.meta.url`/`import.meta.env` via `IIFE_IMPORT_META_DEFINE` in `lib/common.mjs` — see
`grep IIFE_IMPORT_META_DEFINE .ds-sync/lib/common.mjs`/`bundle.mjs`. Forking `lib/bundle.mjs`
to stub `import.meta.glob` generically is explicitly disallowed by the skill's Troubleshooting
section — it's a contract file). If priorities change, re-propose the source fix instead of
re-deriving this exclusion list from scratch.

## Fonts

Five `@fontsource*` packages are imported side-effect-only in `src/App.tsx` (never referenced
by name elsewhere), so `cssEntry`'s scrape can't discover them. Wired explicitly via
`cfg.extraFonts` pointing into `node_modules/@fontsource*/.../*.css` — bounded fine since
`node_modules` is inside the git repo tree.

## .gitignore

Root `.gitignore` blanket-ignores `*.json` with explicit `!`-exceptions. Added:
`frontend/.ds-sync/`, `frontend/ds-bundle/`, `frontend/.design-sync/.cache/`,
`frontend/.design-sync/learnings/`, `frontend/.design-sync/node_modules`,
`frontend/.design-sync/dist-css/`, and `!frontend/.design-sync/config.json` (durable, must
stay tracked despite the blanket JSON rule).

## MUI components need the real theme/cascade-layer provider

Found by a preview-authoring subagent grading `HetCTASmall`: MUI components rendered with
**unthemed, unlayered** CSS that always beat Tailwind utilities regardless of cascade layer
order — a Tailwind `bg-alt-green` on an MUI `Button` lost to MUI's own unthemed background.

Root cause: the real app (`src/index.tsx`) wraps everything in
`<StyledEngineProvider enableCssLayer>` + `<ThemeProvider theme={muiTheme}>` (`src/App.tsx`).
`enableCssLayer` routes MUI's runtime-injected emotion CSS into the `mui` `@layer` bucket;
`src/index.css`'s `@layer theme, base, mui, components, utilities;` declaration (present in
our compiled `cssEntry`) then makes the later `utilities` layer (Tailwind) always win —
*layer order beats specificity*. Without `enableCssLayer`, MUI's styles land **outside any
layer**, and unlayered CSS always beats layered CSS in the cascade regardless of order or
specificity — so every MUI-based preview was silently losing its Tailwind overrides.

Fixed via `cfg.provider` (wraps every preview in the same two providers) + `cfg.extraEntries`
(merges `@mui/material/styles`'s `StyledEngineProvider`/`ThemeProvider` onto `window.HET`, and
`.design-sync/muiThemeRef.ts` — a 2-line named re-export shim, since `providerWrapper`/$ref
needs a named export and the real `muiTheme.tsx` only has a default export — re-exports the
app's actual theme object so previews render with the exact same palette/typography/component
overrides as production). No preview `.tsx` needed touching; this fixes every MUI-based
component at once, including ones already pushed (they'll need a recapture, not a rewrite).

**Action after this config change:** re-run `package-build.mjs` fully (not
`preview-rebuild.mjs`), then re-capture and re-grade any MUI-based component already graded
under the OLD (unthemed) provider setup, since its screenshot no longer reflects what will
actually render — a `HetButtonSecondary`-style component might look different now that MUI is
properly themed, even if it happened to grade "good" before by accident (outlined-variant MUI
buttons have no conflicting background, so they looked right even unthemed).

## Components needing a router context

`HetButtonSecondary`'s `InternalLink` story uses `react-router`'s `Link` (`getComponentType`
returns `RouterLink` for an internal `href`), which needs Router context — rendered blank
until fixed. Same fix pattern as the MUI theme issue: `react-router` added to
`cfg.extraEntries` (merges `MemoryRouter` onto `window.HET`) and nested inside `cfg.provider`
as the innermost wrapper. Harmless for every other component (inert unless something actually
calls a router hook). If a future component needs `useParams`/`useNavigate`/similar with a
specific route, either add `initialEntries` to the `MemoryRouter` props (global — would affect
every preview) or compose a component-local `<Routes>` inside that one preview's `.tsx`.

## Known render warns

- `HetCloseButton` (`Default`, `InFilterPanel`): flagged `[RENDER_THIN]` — genuinely correct,
  it's a small icon-only close button (~24px), authored and confirmed via screenshot. The
  <5KB PNG heuristic doesn't fit intentionally minimal components. Not a bug, don't re-chase.
- `HetSocialIconLinks` (no authored preview — floor render): flagged `[RENDER_THIN]`
  (`allHollow`) — genuinely correct, same root cause as `HetCloseButton`. The component takes
  no required props (LinkedIn/YouTube/TikTok hrefs and icons are all internal to the source),
  so even the unauthored floor render shows the real three icon links; the render-check's
  text-based heuristics just don't register SVG-only content as "real" output. Confirmed via
  `_screenshots/general__HetSocialIconLinks.png` (2026-09-10) — three green icon links, fully
  rendered. Not a bug, don't re-chase; also not worth authoring a preview for since the floor
  render already shows the true component with zero props needed.

## Fixed: HetNavLink rendered zero-height (no authored preview)

`HetNavLink` had no authored preview and hit `[RENDER_BLANK]` with `maxHeight: 0` — a true
failure (`bad: true`), not a benign thin-render like the two above: its `children` prop
(the link's own visible label) is required, and the floor render's crash-prevention props
supply no text for it, so the anchor+span rendered with genuinely zero content and zero
height. This was **latent since before this repo's first sync** — `HetNavLink` is in the
anchor's `unchanged` set, so this exact broken render already shipped to the project; it had
just never been individually screenshotted/inspected before this pass.

Fixed by authoring `.design-sync/previews/HetNavLink.tsx` (`Default`, `WithAriaLabel`,
`NoUnderlineOverride` — real labels/hrefs ported from real usage in
`HetDesktopToolbar.tsx`/navigationData.ts, e.g. "Explore the Data", "About", "FAQs"). All
three graded `good`.

**Also found while authoring**: `HetNavLinkProps.underline` is declared in the component's
own prop interface but never destructured/used in the function body — passing it has zero
effect on render. Not a design-sync issue (the prop genuinely does nothing in the real
component), so `NoUnderlineOverride`'s cell is correctly pixel-identical to `Default` — that's
not a preview bug, it's an accurate reflection of unused app source. Left as-is; flagging here
rather than silently authoring around it, in case the app team wants to wire it up or remove
it from the interface.

## `cfg.tokensGlob` is dead config — `tokens/` in the bundle is empty by design here

Found while validating `conventions.md` against the fresh build for this pass: `ds-bundle/tokens/`
is empty, and `.design-sync/conventions.md` still described `tokens/colors.css` etc. as if they
were the truth (fixed — now points at `styles.css` → `_ds_bundle.css`, and the `.tokens.json`
paths were fixed the same way). Root cause: `lib/css.mjs`'s `copyTokens()` returns immediately
with zero files whenever `cfg.tokensPkg` is unset — it does **not** honor `tokensGlob` on its own
despite the config table implying it's an independent knob; `tokensPkg` was never set in this
repo's config (no sibling tokens/theme package exists — this is a single-package app, not a
scoped monorepo). So `cfg.tokensGlob: "src/styles/tokens/*.css"` has been inert since it was
added; harmless only because `cfg.cssEntry` (the full compiled `npm run build` output) already
carries every token as a real `--color-*`/`--font-*`/`--text-*`/`--radius-*` custom property in
`_ds_bundle.css` regardless. No functional gap today. If a future sync wants an actual `tokens/`
folder for clarity, either set `cfg.tokensPkg` to a real package name (doesn't apply here) or
treat this as confirmation the key can simply be deleted from config.

## Re-sync risks

- **All 49 components emit the degenerate `HetXProps { [key: string]: unknown }` fallback**,
  not a real extracted prop shape (spot-checked `HetNavLink`; `grep -c "key: string]: unknown"
  ds-bundle/components/general/*/*.d.ts` shows all 49). Likely because this app's convention
  is unexported local `interface FooProps {...}` per component (never `export interface`),
  and synth-entry mode's prop extraction may need an exported type to resolve a real shape —
  not confirmed against `lib/dts.mjs` this pass (no `[DTS_*]` warning printed either way, and
  this was already true in the prior successful sync, so it's pre-existing, not a regression
  from this pass). Doesn't block anything today — the design agent still gets a fully working,
  real-rendering component either way, just a less specific `.d.ts` contract than ideal (every
  prop is technically legal, none are named/typed). If real per-component prop contracts ever
  matter more than they do today, the fix is either exporting each `FooProps` interface from
  its source file, or investigating `lib/dts.mjs`'s extraction path for unexported local types.
- The `componentSrcMap` exclusions above are a standing decision tied to the app's current
  data-layer architecture — if `placeSearch.ts` / `DataFetcher.ts` are ever refactored to lazy
  `import()` instead of eager top-level `import.meta.glob`, these three components could be
  re-included; re-test by removing the exclusions and rebuilding before doing so.
- `.design-sync/dist-css/site.css` is a snapshot from `npm run build` — if `cfg.buildCmd`
  isn't re-run before a resync, `cssEntry` serves stale CSS silently (no error, just drift).
- `npm ci`/install must be faithful (`package-lock.json` present) before staging `.ds-sync/` —
  esbuild's postinstall script is blocked by this environment's `allowScripts` policy but the
  prebuilt binary still works fine; no action needed unless a future esbuild version changes
  that.
