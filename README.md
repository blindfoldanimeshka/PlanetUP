# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## CI / Deployment

- **Node version** is pinned in `.nvmrc` (Node 22).
- **GitHub Actions** runs `.github/workflows/ci.yml` on every push and pull request to `main`:
  - `npm ci` (with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`)
  - `npm run lint`
  - `npm run test`
  - `npm run build`
- **Deployment** is handled by Vercel Git Integration:
  - Pushes to `main` deploy to production.
  - Pull requests get preview deployments.
  - No deploy secrets are stored in this repository.

If you ever need a manual deploy step in CI, store `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as GitHub Actions secrets and reference them only via `${{ secrets.XXX }}`. Never hardcode tokens in the workflow file.
