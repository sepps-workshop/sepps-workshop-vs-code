# Sepp’s Workshop for VS Code — Port Design Spec

**Date:** 2026-10-01
**Status:** Approved
**Foundation:** `@sepps-workshop/design-system` 0.2.1 (on npm)
**Blueprint:** `vivid-life-theme/vivid-life-vs-code` 0.3.0

## Goal

A VS Code colour theme extension that renders the Sepp’s Workshop foundation: one dark theme on sepp.med Darkblue, with no variants. Every colour in the shipped theme file is a value the foundation publishes. The port decides which token feeds which VS Code key and nothing else.

The repository has the same shape as the Vivid Life port, so that someone who knows one can work in the other.

## Decisions already taken

- Overlays are emitted translucent from the foundation's recipe (`overlay.<name>.hexa`), as the Vivid Life port does since 0.3.0.
- Gaps are closed in the foundation, not in the port. Foundation 0.2.0 added the workbench overlays, `accent_hover` and `hexa` for this purpose.
- Scaffolding has full parity with the blueprint: build, tests, manifest, docs, skills, hooks, workflows.

## Assumptions to confirm

- Marketplace publisher `sepps-workshop`, extension name `sepps-workshop-theme`, display name "Sepp’s Workshop Theme", theme label "Sepp’s Workshop".
- Licence MIT, copyright sepp.med gmbh, as in the foundation.
- First version 0.1.0. Nothing is published, tagged or pushed as part of this work.

## Decision taken: inline diff highlights

The recommended option below was chosen and shipped as foundation 0.2.1. It also added `merge_incoming_header`, which keeps the merge editor's incoming header green.

VS Code draws `diffEditor.insertedTextBackground` on top of `diffEditor.insertedLineBackground`, behind syntax-coloured code. The foundation classes `diff_inserted_text` as carrying `fg` and `fg_muted` only, and measured with the foundation's colour maths that restriction is real:

| Composite                                      | Worst code text                                             |
| ---------------------------------------------- | ----------------------------------------------------------- |
| `diff_removed_text` over `diff_removed_line`   | 4.83:1, passes                                              |
| `diff_inserted_text` over `diff_inserted_line` | 3.37:1 (numbers, errors), comments 3.42:1, functions 3.72:1 |

So changed spans on inserted lines would fall below AA for most of the palette. Any green fill strong enough to see fails; the line fill alone is already at the limit (4.61:1).

**Recommended:** a foundation patch, 0.2.1, before the port is built. `diff_inserted_text` becomes a darkening recipe, Darkblack at 40 %. Over the green line that gives `#16324c`: worst code text 5.72:1, and 6.5 OKLab units from the line, so the changed span reads as a darker patch inside the green line. The foundation also gains a gate that both `*_text` recipes, stacked on their line recipes, carry all code text. This matches the foundation's own rule that overlays darken.

**Alternative:** ship with the 0.2.0 values and document the shortfall. I do not recommend it; the theme's claim is that every text pair passes AA.

The rest of this spec assumes the recommended option. If you choose the alternative, only the contrast test for stacked diff text changes.

## Dependency

```json
"devDependencies": {
  "@sepps-workshop/design-system": "^0.2.1",
  "@vscode/vsce": "^3.9.2",
  "prettier": "^3.9.6"
}
```

Imports are `tokens` from the package root and `contrast`, `deltaE`, `alphaOver`, `resolveTarget` from `@sepps-workshop/design-system/tools/build-tokens`. The package is on npm, so no GitHub URL is needed.

## Repository layout

```
build.mjs                         tokens -> themes/sepps-workshop-color-theme.json, icon.png
src/theme-template.mjs            pure buildTheme(tokens) -> theme object
src/theme-template.test.mjs       node --test
themes/sepps-workshop-color-theme.json   generated, committed
package.json                      extension manifest, one contributes.themes entry
icon.png                          copied by the build from the foundation's assets/icon-256.png
README.md  CHANGELOG.md  LICENSE  CLAUDE.md
.claude/settings.json             permissions, secret-file guard, Prettier on edit
.claude/skills/sepps-workshop/SKILL.md   copied from the foundation's handoff/SKILL.md
.claude/skills/release/SKILL.md   version bump, changelog, tag, push
.githooks/pre-commit              config-table sync, gitleaks
scripts/sync-config-table.sh      keeps the CLAUDE.md file table current
.github/workflows/claude.yml  claude-code-review.yml  publish-to-visual-studio-marketplace.yml
.gitignore  .prettierignore  .vscodeignore  .claudeignore
images/                           screenshots, added by hand later
```

Differences from the blueprint: one theme file instead of 24; `buildTheme(tokens)` takes no flavour or variant; the build copies the icon so it cannot drift.

## The template

One exported function, `buildTheme(tokens)`, returning `{ $schema, name, type: "dark", semanticHighlighting: true, colors, tokenColors, semanticTokenColors }`. It is built from three internal functions, one per section.

### Rules

1. **No literal colour and no alpha arithmetic.** The file contains no `#`. Translucent values are `overlay.<name>.hexa`; opaque ones are token values.
2. **Every role string goes through `resolveTarget`.** It throws on an unknown name, so a typo in the foundation or the port stops the build. The blueprint's own resolver falls back to `fg` silently and would turn `operator: "fg_muted"` into `fg`.
3. **A key with no role is not set.** VS Code's default applies.
4. **State is never colour alone.** A state colour comes with a border, an underline, a position or a font style.

### Workbench colours

The mapping follows the blueprint key by key. These are the places where it differs, because the foundation differs.

| Area                                                                  | Mapping                                                                                                              | Why                                                                                      |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Editor, active tab, peek editor, notebook                             | `surface.bg`                                                                                                         | Content surfaces                                                                         |
| Sidebar, activity bar, status bar, title bar, tab strip, panel        | `surface.bg_chrome`                                                                                                  | Chrome surfaces                                                                          |
| Menus, widgets, quick input, notifications                            | `surface.bg_overlay`                                                                                                 | Floating widgets sit on the darker surface                                               |
| Inputs, dropdowns, checkboxes                                         | `surface.bg_soft`, outline `border.control`, placeholder `fg_muted`                                                  | `bg_soft` carries `fg` and `fg_muted` only, so the placeholder steps up from `fg_subtle` |
| Terminal                                                              | `surface.bg`, the sixteen `ansi.*`, selection `overlay.selection`                                                    | No selection foreground: the foundation gates ANSI on the selection                      |
| Selection, line highlight                                             | `overlay.selection`, `selection_inactive`, `line_highlight`                                                          | Recipes darken                                                                           |
| Find                                                                  | `overlay.find_match` and `find_match_other`, each with its border                                                    | Border separates them from selection                                                     |
| Word, selection and symbol highlight                                  | `overlay.word_highlight`; write access and bracket match use `word_highlight_strong` with its border                 |                                                                                          |
| Hover (lists, tabs, menubar, status bar items)                        | `overlay.hover`                                                                                                      | Tabs do not use `bg_soft`: a tab label can carry a git colour                            |
| Drop targets, pressed items                                           | `overlay.active`                                                                                                     |                                                                                          |
| Selected row, focused and active                                      | `overlay.selected_item`, text `fg`, match highlight `accent`                                                         | Accent reaches 5.24:1 on it; a port test pins that                                       |
| Selected row, inactive; keyboard-focused row                          | `overlay.active`, plus `list.focusOutline` in `accent`                                                               | These rows keep their git-decoration colours, which `selected_item` cannot carry         |
| Scrollbar and minimap sliders, shadows                                | `overlay.slider*`, `overlay.scrim`                                                                                   |                                                                                          |
| Diff                                                                  | line and gutter: `diff_*_line`; changed spans: `diff_*_text`; overview: `semantic.success` and `danger`              | See the open decision                                                                    |
| Merge editor                                                          | current: `merge_current_*`; incoming: `diff_inserted_line` and `merge_incoming_header`; common: `hover` and `active` |                                                                                          |
| Debugger                                                              | both frame keys: `overlay.stack_frame`; top-frame arrow `semantic.warning`, focused-frame arrow `semantic.success`   | One recipe, two shapes                                                                   |
| Errors, warnings, info, hints, git states, bracket pairs              | `workbench_color_roles`, applied to squiggle, gutter, overview ruler, minimap, problems, file tree alike             | Hints are `fg_muted`, ignored files `fg_disabled`                                        |
| Status bar                                                            | background `bg_chrome`, top border `accent`, no-folder border `border.subtle`                                        | Accent is a border, never the bar's fill                                                 |
| Debugging status bar, error and offline items                         | `semantic_fill.danger` fill and text                                                                                 | Red as a fill is Signalred with white text                                               |
| Warning and prominent items                                           | `semantic_fill.warning` fill and text                                                                                |                                                                                          |
| Remote indicator                                                      | `ansi.cyan` with `accent_on` text (6.70:1)                                                                           | Distinct from the bar, the accent badges and the danger fill                             |
| Badges, primary button, progress bar                                  | `accent` with `accent_on`; button hover `accent_hover`                                                               |                                                                                          |
| Focus ring, cursor, active tab top border, active activity-bar border | `accent`                                                                                                             |                                                                                          |
| Input validation boxes                                                | fill `bg_overlay`, border and icon in the semantic colour, text `fg`                                                 | No tinted fills                                                                          |
| Links                                                                 | the `link` slot (function colour)                                                                                    | Accent is for focus and identity, not for every link                                     |
| Charts                                                                | red `semantic.danger`, blue `semantic.info`, yellow `accent`, orange `semantic.warning`, green `semantic.success`    | No purple in the brand                                                                   |

Left at VS Code defaults, and listed in the README: the four translucent overview-ruler marks (find, range, selection highlight, word highlight), `tab.activeBorder`, `menu.selectionBorder`, `menubar.selectionBorder`, `editorUnnecessaryCode.opacity`, `charts.purple`, `statusBarItem.prominentHoverBackground`. `editor.lineHighlightBorder` takes `overlay.line_highlight`, the same colour as the fill.

### Syntax (`tokenColors`)

Generated: one rule per entry of `scope_recommendations`, named after the slot.

- Colour: the slot itself for core slots, the `extended` entry otherwise, resolved with `resolveTarget`.
- Font style: `syntax_tokens.core_style` for core slots, the `style` of the extended entry otherwise. The blueprint ignores `core_style`; here comments, parameters and attributes would lose their italics without it.
- `emphasis` and `strong` have no colour in the foundation. Their rules set a font style only.
- `fg_fallthrough_jsts` resolves to `fg` with no style.

Hand-written additions, each derived from a foundation role and not copied from the blueprint:

| Rule                            | Scopes                                                                               | Colour and style                                       | Source                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| Template expression delimiters  | `punctuation.definition.template-expression`, `punctuation.section.embedded`         | `keyword`                                              |                                                                           |
| Escape sequence                 | `constant.character.escape`                                                          | `constant`                                             | `shell_roles.escape`                                                      |
| Shell variable                  | `source.shell variable.other`, `variable.other.normal.shell`                         | `type`                                                 | `shell_roles.variable`                                                    |
| YAML key                        | `entity.name.tag.yaml`                                                               | the `property` slot (`fg`)                             | Otherwise the `tag` rule paints YAML keys Sunset while JSON keys are `fg` |
| YAML alias                      | `variable.other.alias.yaml`                                                          | `string`, italic underline                             |                                                                           |
| Python docstring                | `string.quoted.docstring.multi`                                                      | `comment`, italic                                      |                                                                           |
| CSS at-rule                     | `keyword.control.at-rule`, `punctuation.definition.keyword`                          | `keyword`                                              |                                                                           |
| Markdown bold and italic        | the two nested `markup.bold` / `markup.italic` scopes                                | bold italic, no colour                                 |                                                                           |
| Markdown link text              | `string.other.link.description.markdown`, `string.other.link.title.markdown`         | the `link` slot                                        |                                                                           |
| Markdown code                   | `markup.inline.raw`, `markup.fenced_code.block`, `markup.raw.block`                  | `string`                                               |                                                                           |
| Markdown quote                  | `markup.quote`, `punctuation.definition.quote.begin`                                 | `fg_muted`, italic                                     |                                                                           |
| Markdown list bullet            | `beginning.punctuation.definition.list.markdown`, `punctuation.definition.list_item` | `keyword`                                              |                                                                           |
| Diff inserted, deleted, changed | `markup.inserted`, `markup.deleted`, `markup.changed`                                | `semantic.success`, `semantic.danger`, `semantic.info` | `workbench_color_roles.git`                                               |
| Diff hunk range                 | `punctuation.definition.range.diff`                                                  | `function`                                             |                                                                           |

Dropped from the blueprint because they end in `meta.*`, which the foundation forbids: the Markdown horizontal rule and the `meta.diff.*` header rules. Also dropped: the blueprint's JSON-key override, since `property` already covers it.

### Semantic tokens (`semanticTokenColors`)

Generated from `semantic_token_recommendations`.

- Each type gets its colour and its font style; a type without a style gets `fontStyle: ""`, so an italic TextMate rule underneath does not leak through.
- Each modifier other than `"none"` becomes a `*.<modifier>` rule with whatever colour or style the foundation gives it.

One effect to know: `*.readonly` takes the constant colour, so in TypeScript every `const` binding the language server reports as read-only is orange. That is the foundation's choice (the TextMate `const` scopes fall through to `fg` precisely so that the language server decides). If it turns out noisy in use, the fix belongs in the foundation.

## Manifest

`package.json`: name, display name, publisher and licence as assumed above; `"type": "module"`; `engines.vscode` `^1.74.0`; category Themes; one `contributes.themes` entry with `uiTheme: "vs-dark"`. `galleryBanner.color` is the one colour value a manifest must hold as a literal; a test pins it to `surface.bg`. Scripts: `build`, `test`, `format`, `format:check`, `prepackage`, `package`.

## Tests

All expected values come from the tokens, none from the blueprint's tests.

1. **Every colour is a foundation value.** Each colour in `colors`, `tokenColors` and `semanticTokenColors` is found among the foundation's opaque values or its `hexa` values. This enforces rule 1 on the output.
2. **The template source contains no `#`.** This enforces rule 1 on the input.
3. **No `tokenColors` rule ends in a `meta.*` scope.**
4. **Styles survive.** Comment, parameter and attribute rules are italic; `emphasis` and `strong` have no foreground; `operator` is `fg_muted`; `lang_var` is the keyword colour, italic.
5. **Semantic tokens.** `parameter` is italic, `class` and `type` have `fontStyle: ""`, no rule exists for a `"none"` modifier.
6. **Contrast of port-specific pairs,** at 4.5:1 for text and 3:1 for non-text: status bar text; remote, error, warning and debugging items; badges and buttons including hover; text and match highlight on selected rows; git and diagnostic colours on hovered and inactive-selected rows over `bg_chrome`; inactive tab text; placeholder on inputs; code text on stacked diff spans; focus ring on every surface.
7. **Translucency.** Every key VS Code documents as "must not be opaque" that the theme sets has an eight-digit value.
8. **Surfaces.** Panel, sidebar and status bar differ from the editor background; the terminal background equals `surface.bg` and differs from the panel around it.
9. **Manifest and build.** The manifest's theme path exists, its label equals the theme's `name`, the banner colour equals `surface.bg`, and the committed theme file equals a fresh `buildTheme(tokens)`.

## README

English, no emoji, exact where technical. Sections: what it is, install, recommended font (JetBrains Mono; JetBrainsMono Nerd Font for the terminal), what stays at VS Code defaults, contributing (`npm install`, `npm run build`, `npm test`, F5 for the Extension Development Host; colour problems go to the foundation), licence, and "Want to join Sepp’s Workshop?" linking to the foundation's `meta.career_url`.

A screenshot needs a running VS Code. The README references `images/screenshot.png`; I leave that file for you to add.

## Scaffolding carried over

Copied from the blueprint and adapted in names and paths only: `.claude/settings.json`, the release skill, the pre-commit hook, `scripts/sync-config-table.sh`, the three workflows, and the four ignore files. The publish workflow needs a `VSCE_PAT` secret and an existing Marketplace publisher; both are yours to set up, and the workflow only runs on a `v*` tag.

`CLAUDE.md` is written for this port: commands, structure, the hard rules from the skill, and the learnings instruction.

## Out of scope

- Publishing, tagging, pushing, creating the Marketplace publisher.
- Screenshots.
- File icons and product icons.
- The other four ports.

## Manual checks after the build

Run from the Extension Development Host, against the checklists in the two best-practice documents: a nested TypeScript file, HTML with embedded CSS and JS, Python with type hints, Markdown, JSON and YAML; find with a selection active; cursor on a symbol; a debug session; a WSL or SSH window; a diff and a merge conflict; the terminal's sixteen colours; peek view; the settings editor; keyboard focus.

## After this ships

Ask whether the theme used the foundation correctly and log corrections to `.claude/learnings.md`, as the skill requires. Then draft the Vivid Life issue.
