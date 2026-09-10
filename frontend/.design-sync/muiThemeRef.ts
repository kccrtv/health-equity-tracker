// Named re-export so cfg.provider's `{"$ref": "muiTheme"}` can address this
// via extraEntries — merged extraEntries exports land on window.<GLOBAL> by
// their export name, and the real muiTheme.tsx only has a default export.
export { default as muiTheme } from '../src/styles/theme/muiTheme'
