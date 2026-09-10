import { defineConfig } from 'vite'

// Minimal config for running geo-coverage-report.ts under vite-node.
//
// The report imports the real src/data/loading stack (DataManager,
// ApiDataFetcher, VariableProviderMap) so it reuses the app's actual data
// path instead of re-implementing it. That stack depends on import.meta.env
// and import.meta.glob, which only exist under a real Vite transform — plain
// tsx (the runner every other frontend/scripts/*.ts file uses) can't load it.
// The root vite.config.ts can't be reused directly here: it unconditionally
// imports @sentry/vite-plugin and vite-plugin-svgr for the app build, neither
// of which this script needs, so this file stays deliberately separate.
export default defineConfig({
  resolve: { tsconfigPaths: true },
})
