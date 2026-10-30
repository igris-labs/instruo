# Contributing to Instruo

Bug reports, fixes, tool improvements and game contributions are welcome. Follow the [code of conduct](CODE_OF_CONDUCT.md).

## Get started

Use Node.js 24 and the pnpm version in `package.json`.

```sh
git clone https://github.com/igris-labs/instruo.git
cd instruo
corepack enable
pnpm install
pnpm dev
```

For contributions, fork the repository and create a focused feature branch in your fork.

## Project conventions

- Use Vue Composition API, TypeScript and `<script setup lang="ts">`.
- Use the existing IPEX/Akaza components in `app/components/ui/`; default controls are `sm`.
- Use Tailwind CSS and the existing theme tokens. Do not introduce another UI framework or recreate an available shared component.
- Keep tool/game-specific behavior in its feature directory. Shared shell and layout compositions belong in `app/components/product/`.
- Use primary buttons for explicit main operations, secondary outline for copy/download, and ghost controls for clear/reset. Live converters do not need a fake Run button.
- Handle invalid/empty inputs, loading, cancellation and stale results. Preserve keyboard access and responsive layout.
- Never upload user input or fetch entered URLs without making the behavior clear.

## Add a tool or game

1. Create the implementation in `app/features/tools/<category>/<tool>/` or `app/features/games/`, following adjacent features.
2. Register a lazy presenter in `app/features/catalogue/views.ts`, using a unique ID such as `tool:example`.
3. Add a Markdown document under `content/tools/<category>/` or `content/games/<category>/` with matching front matter:

   ```yaml
   ---
   resourceId: tool:example
   title: Example Tool
   description: Describe the task this tool performs.
   category: Developer
   tags: [example]
   icon: i-tabler-code
   processing: local
   ---
   ```

   Check `content.config.ts` for supported fields. Include usage instructions, examples, limitations and privacy behavior. Routes are derived from the resource ID; do not embed a second tool invocation in the document.

4. Add tests for real outputs, invalid-input recovery and relevant asynchronous/file lifecycles.
5. For a game, choose DOM or Phaser based on its interactions. Place catalogue artwork in `public/game-arts/`; keep licenses with third-party assets.

## Verify changes

```sh
pnpm typecheck
pnpm lint
pnpm format
pnpm test:unit
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
pnpm build
```

See [testing](tests/README.md) for isolated browser-server details. GitHub pull requests run these checks using Node.js 24, plus a production dependency audit.

## Pull requests

Keep changes focused. Explain what changed, include reproduction/verification steps and add before/after screenshots for visual changes. Use Conventional Commit titles such as `fix: align Markdown preview panels` or `feat: add a conversion mode`.

For bug reports, include the expected/actual behavior, steps, browser/OS and relevant errors. Do not include private tokens, credentials or personal files.

## Licensing

Contributions use the project's [MIT license](LICENSE). Preserve attribution and license files when adding third-party resources.
