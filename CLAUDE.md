# sepps-workshop-vs-code

VS Code colour-theme port of the [Sepp’s Workshop design system](https://github.com/sepps-workshop/sepps-workshop-design-system). Node.js + ESM. Reads tokens from `@sepps-workshop/design-system`; emits one theme to `themes/`. One theme, no variants.

## Key Config Files

| File                                                         | Purpose                                                                                 |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `.claude/learnings.md`                                       | One-line corrections from past sessions; appended to, never rewritten                   |
| `.claude/settings.json`                                      | Permissions, secret-file guard, PostToolUse Prettier hook, env defaults                 |
| `.claude/skills/release/SKILL.md`                            | `/release` skill: version bump → CHANGELOG → tag → push                                 |
| `.claude/skills/sepps-workshop/SKILL.md`                     | Port-side skill: how to read foundation tokens; copied from the foundation's `handoff/` |
| `.claudeignore`                                              | Paths Claude Code should skip when indexing (`node_modules/`, `themes/`, `*.vsix`)      |
| `.githooks/pre-commit`                                       | Runs sync-config-table.sh and gitleaks on every commit                                  |
| `.github/workflows/claude-code-review.yml`                   | Auto-reviews PRs with Claude on open/synchronize                                        |
| `.github/workflows/claude.yml`                               | Responds to `@claude` mentions in issues, PRs, and review comments                      |
| `.github/workflows/publish-to-visual-studio-marketplace.yml` | Publishes to VS Code Marketplace on `v*` tag push                                       |
| `.gitignore`                                                 | Git ignore patterns                                                                     |
| `.prettierignore`                                            | Paths Prettier must skip — generated `themes/`, `icon.png`                              |
| `.vscodeignore`                                              | Paths `vsce package` should not bundle into the `.vsix`                                 |
| `build.mjs`                                                  | Reads foundation tokens, emits the theme JSON to `themes/` and copies `icon.png`        |
| `package.json`                                               | VS Code extension manifest with one `contributes.themes` entry                          |
| `scripts/sync-config-table.sh`                               | Keeps this table in sync with the filesystem (called by pre-commit)                     |

## Commands

- `npm install` — fetch deps (foundation tokens, vsce, prettier)
- `npm run build` — read tokens, emit `themes/sepps-workshop-color-theme.json` and `icon.png`
- `npm test` — template, contrast and manifest tests
- `npm run format` — run Prettier on the project
- `npm run package` — produce a `.vsix` (runs `build` first via `prepackage`)
- F5 in VS Code — launch Extension Development Host to preview the theme live

After cloning, run `git config core.hooksPath .githooks` to enable the pre-commit hook.

## Structure

- `build.mjs` — top-level build script
- `src/theme-template.mjs` — pure `buildTheme(tokens)`: syntax rules, semantic tokens, assembly
- `src/workbench-colors.mjs` — `buildWorkbenchColors(tokens)`: which token feeds which VS Code key
- `src/*.test.mjs`, `src/test-helpers.mjs` — tests; expected values come from the tokens
- `themes/` — **generated**, committed (so `git clone` + install works without rebuild)
- `icon.png` — **generated**: copied by the build from the foundation's `assets/icon-256.png`

## References

`.claude/skills/sepps-workshop/SKILL.md` **Read when:** adding or changing any colour mapping. It maps port needs to foundation tokens.

`node_modules/@sepps-workshop/design-system/README.md` **Read when:** you need to know what a role means or why a value is what it is.

`docs/superpowers/specs/2026-10-01-vs-code-port-design.md` **Read when:** you need the reasoning behind a mapping.

## Conventions

- **No colour in this repository.** No hex value and no alpha arithmetic in `src/`. Translucent values are `overlay.<name>.hexa`; opaque ones are token values. A test fails on any `#` in the template sources and on any theme colour the foundation does not publish.
- **Foundation gaps go upstream.** A value the port needs and cannot find is fixed in `sepps-workshop-design-system`, not approximated here. A VS Code key with no role stays at its default; list it in the README.
- **Resolve role names with `resolveTarget`.** It throws on an unknown name; do not add a fallback.
- **Content surfaces vs. chrome surfaces.** `surface.bg` for panes the user reads or edits (editor, active tab, peek editor, notebook, integrated terminal); `surface.bg_chrome` for panes that frame them (sidebar, activity bar, status bar, title bar, tab strip, panel). The panel's title row is the chrome strip that separates the terminal from the editor.
- **`bg_soft` and `overlay.selected_item` carry `fg` and `fg_muted` only.** Rows or controls that show git, diagnostic or syntax colours take a darkening overlay (`hover`, `active`).
- **The status bar stays on `bg_chrome`.** The accent is its top border. Debugging and error items use the danger fill with its white text; warning items use the warning fill.
- **Never colour alone.** A state colour comes with a border, an underline, a position or a font style.
- **Determinism.** Same tokens in, byte-identical theme out. `npm test` fails if `themes/` or `icon.png` is stale.
- **Writing.** The product name is written "Sepp’s Workshop" with a typographic apostrophe, the company "sepp.med gmbh". Docs are English, exact where technical, no emoji.

## Don't

- Don't hand-edit `themes/*.json` or `icon.png`; run `npm run build`.
- Don't add a second theme or a variant.
- Don't commit `*.vsix`.
- Don't commit secrets. Don't use `--force`.

## Learnings

When the user corrects a mistake or points out a recurring issue, append a one-line summary to `.claude/learnings.md`. Don't modify CLAUDE.md directly.

## Compact Instructions

When compacting, preserve: list of modified files, current test status, open TODOs, and key decisions made.
