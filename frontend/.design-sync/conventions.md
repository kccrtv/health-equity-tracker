## Health Equity Tracker design system — build conventions

This library ships the real shared components from [healthequitytracker.org](https://healthequitytracker.org/), a public health data site (Satcher Health Leadership Institute). Compose with these conventions so a built screen matches the real product.

### Wrap the tree in these two providers

Every component in this library expects both, in this order (already applied automatically to every preview card in this project — replicate the same nesting when composing a new screen):

```jsx
<StyledEngineProvider enableCssLayer>
  <ThemeProvider theme={muiTheme} defaultMode="light">
    {/* your screen */}
  </ThemeProvider>
</StyledEngineProvider>
```

- **`StyledEngineProvider enableCssLayer`** routes MUI's runtime CSS into a `mui` cascade layer. Without it, MUI's unthemed styles render **outside any layer**, and unlayered CSS always beats layered CSS — so Tailwind color/background overrides on MUI components (buttons, list items) silently lose. This is not optional for any screen using an MUI-based component (`HetButtonSecondary`, `HetCTASmall`, `HetListItemButton`, `HetListBoxOption`, `HetModal`, `HetSnackbar`, `HetPopover`, etc.).
- **`ThemeProvider theme={muiTheme}`** supplies the real palette (`primary.main` = the site's dark green, not MUI's default blue) and component-level `styleOverrides`. Skipping it leaves MUI components in stock MUI blue.
- A few components (`HetButtonSecondary`'s internal-link variant) render `react-router`'s `Link`, which needs a Router context somewhere in the tree (a `<MemoryRouter>` or your app's real router) — otherwise that one variant throws.

### Styling idiom: Tailwind utilities generated from design tokens

**Never use default Tailwind palette classes** (`bg-blue-500`, `text-gray-400`, etc.) — every color, font, and dimension utility on this site is generated from this repo's own token files, exposed as Tailwind v4 `@theme` custom properties. Real family members (not exhaustive — see `tokens/*.tokens.json` for the full set):

| Purpose | Example classes |
|---|---|
| Brand colors | `bg-alt-green`, `text-alt-green`, `bg-alt-white`, `text-alt-black`, `bg-alt-green-tint`, `bg-hover-alt-green` |
| Semantic/UI colors | `border-border-color`, `bg-bg-color`, `bg-explore-bg-color`, `text-alt-dark`, `bg-divider-gray` |
| Typography family | `font-sans-title` (DM Sans Variable — headings), `font-sans-text` (Inter Variable — body), `font-serif` (Taviraj), `font-roboto`, `font-roboto-condensed` |
| Type scale | `text-big-header`, `text-bigger-header`, `text-explore-button`, `text-small`, `text-smallest`, `text-text` (see `tokens/typography.tokens.json` for the full scale) |
| Line height | `leading-tight`, `leading-loose`, `leading-normal` |
| Breakpoints (responsive prefixes) | `sm:` (600px), `md:` (960px), `lg:` (1280px), `lgplus:` (1440px), `xl:` (1920px) |
| Radii / spacing | `rounded-*`, dimension-token-driven — check `_ds_bundle.css`'s `--radius-*`/`--width-*` custom properties before inventing a one-off value |

To pick a color or size, search `_ds_bundle.css` for its `--color-*`/`--font-*`/`--text-*`/`--radius-*` custom properties (bound into this project as `styles.css` → `_ds_bundle.css`) — camelCase source token names become kebab-case utility suffixes (`altGreen` → `bg-alt-green`). Never invent a new token for one-off use; find the closest existing one.

MUI components are customized via the theme's `styleOverrides` (not `sx` or inline styles) for structural defaults (e.g. font-family), and via Tailwind `className` on top for one-off placement/spacing — both patterns appear in this library's real components, follow whichever the component you're extending already uses.

### Where the truth lives

- `styles.css` → `_ds_bundle.css` — the compiled stylesheet carrying every `@theme` custom property (colors, fonts, type scale, breakpoints) and every component's own CSS; this is the authoritative list of every color/font/size utility that exists. There is no separate `tokens/*.css` file in this bundle — the site's Tailwind v4 build already inlines its token `@theme` block into the same compiled output components ship with, so read `_ds_bundle.css` directly rather than looking for a standalone tokens file.
- Each component's own `.prompt.md` — real usage examples ported from this project's authored preview stories.

### Example: a real composed snippet

```jsx
<StyledEngineProvider enableCssLayer>
  <ThemeProvider theme={muiTheme} defaultMode="light">
    <div className="max-w-sm">
      <HetOverline text="Key findings" />
      <p className="text-alt-black text-text">
        From 2018 to 2021, the rate of{' '}
        <HetHighlightSpan text="gun deaths among Black youth increased by approximately 75.44% in Georgia" />.
      </p>
      <HetDivider />
      <HetCTASmall onClick={() => {}}>Explore the data</HetCTASmall>
    </div>
  </ThemeProvider>
</StyledEngineProvider>
```
