# Instruo

[Instruo](https://instruo.org) is an open-source collection of browser tools and games. Format code, convert images, work with text, calculate everyday numbers, or take a game break—without creating an account.

Most tools process input on your device. Features using external APIs need an internet connection; see each tool or game's documentation for details.

[Browse tools](https://instruo.org/tools) · [Play games](https://instruo.org/games) · [GitHub](https://github.com/igris-labs/instruo)

## Development

Use Node.js 24 (the local version is pinned in [.node-version](.node-version)) and the pnpm version specified in `package.json`.

```sh
corepack enable
pnpm install
pnpm dev
```

The development server runs at `http://localhost:3000`.

## Commands

| Command             | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Start the development server                 |
| `pnpm typecheck`    | Check TypeScript and Vue types               |
| `pnpm lint`         | Run Oxlint and ESLint                        |
| `pnpm format`       | Check formatting                             |
| `pnpm test:unit`    | Run Vitest                                   |
| `pnpm test:e2e`     | Run Chromium browser tests                   |
| `pnpm build`        | Build for Cloudflare Pages                   |
| `pnpm audit:prod`   | Check production dependency advisories       |
| `pnpm brand:export` | Regenerate PNG brand icons from shipped SVGs |

Before the first browser test run, install Chromium:

```sh
pnpm exec playwright install --with-deps chromium
```

See [testing](tests/README.md) for coverage and [contributing](CONTRIBUTING.md) for adding a tool or game.

## Project structure

- `app/features/tools/` — tool components, composables and engines.
- `app/features/games/` — DOM and canvas game implementations.
- `app/features/catalogue/` — view registration, search and presentation.
- `app/components/ui/` — shared IPEX components using Akaza UI.
- `app/components/product/` — application shell and shared product compositions.
- `content/tools/`, `content/games/` — public catalogue metadata and instructions.
- `public/` — brand assets, game artwork and licensed game resources.
- `tests/` — unit, browser and visual-layout regression checks.

Built with Nuxt, Vue, Tailwind CSS, Akaza UI and IPEX. Code editors use Shiki; canvas games use Phaser. Nuxt Image and nuxt-gtag remain part of the application.

## Deployment

`pnpm build` targets Cloudflare Pages. Nuxt Content requires a D1 database bound as `DB`; configure the environment and bindings for your deployment. A successful local build does not validate production bindings or external services.

## Contributing and support

Report bugs or suggest improvements on [GitHub](https://github.com/igris-labs/instruo/issues). Follow the [contribution guide](CONTRIBUTING.md) and [code of conduct](CODE_OF_CONDUCT.md).

Created by [Rahul Vashishtha](https://rahulv.dev) at [Igris Labs](https://igrislabs.com). You can [sponsor the maintainer](https://github.com/sponsors/rahul-vashishtha).

## License

[MIT](LICENSE). Third-party game resources retain their own included licenses.
