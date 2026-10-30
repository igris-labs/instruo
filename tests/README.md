# Testing

Use Node.js 24 and install dependencies with `pnpm install`.

## Commands

```sh
pnpm test:unit
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
pnpm typecheck
pnpm lint
pnpm format
pnpm build
```

Playwright starts an isolated Nuxt server on port 3197 with the `.nuxt-e2e` build directory. It does not reuse an existing server. Keep that port free; normal development can continue on port 3000. For a focused run, use `pnpm test:e2e tests/e2e/tool-panel-alignment.spec.ts`.

`pnpm build` prerenders the deployable site into `dist/` and runs `scripts/check-static-output.mjs`. The check verifies every catalogue route has HTML and a payload, the homepage contains the catalogue data, and no Worker/Functions routing artifact remains. For deployment testing, serve `dist/` with a plain static HTTP server and check both direct URLs and client navigation.

## Coverage

- Unit tests exercise current calculator, crypto, parser, text and game engines; catalogue search and registration; branding; UI utilities; syntax highlighting, folding and large-file viewport behavior.
- Catalogue browser tests read the current `content/` metadata and registered presenters. They cover every tool and game without depending on historical migration inventories or Git commits.
- Browser workflows cover actual exports, input validation and recovery, asynchronous cancellation, dialogs and navigation, camera fallback, keyboard ownership, game controls and scoring.
- Layout checks cover mobile/tablet/desktop widths, both themes, panel alignment, checkbox spacing, overflow and action hierarchy.
- Code-editor tests exercise real Shiki tokens, JSON folding without export loss and 18,002-line documents.
- Brand tests compare shipped SVG geometry and verify exported PNG dimensions. Regenerate icons with `pnpm brand:export`.
- Some game rules still live in Vue SFCs. `helpers/feature-functions.ts` extracts the relevant declarations from current source for deterministic tests; prefer direct engine imports when practical.

Fixtures should be local and deterministic. Do not require a historical Git checkout or live external service to run unit tests. Add focused behavior and recovery tests when changing a tool or game.

## Boundaries

Passing tests is not a security, accessibility, financial, physical-camera or cross-browser certification. External APIs, hosting configuration and real devices require separate deployment checks. Production does not require a database binding. Run `pnpm audit:prod` and review dependency advisories before release; a successful build is not an audit pass.
