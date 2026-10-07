# Sepp’s Workshop for VS Code — Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the VS Code colour-theme extension that renders the Sepp’s Workshop foundation: one generated theme, tests that prove it uses only foundation colours, and the same repository scaffolding as the Vivid Life port.

**Architecture:** `src/workbench-colors.mjs` maps tokens to VS Code workbench keys; `src/theme-template.mjs` builds the syntax rules and semantic token colours and assembles the theme. `build.mjs` writes the theme JSON and copies the icon. No file in `src/` contains a colour: translucent values are `overlay.<name>.hexa`, opaque ones are token values.

**Tech Stack:** Node 20 or later, ES modules, `node --test`, `@sepps-workshop/design-system` 0.2.1 (npm), `@vscode/vsce`, Prettier.

**Spec:** `docs/superpowers/specs/2026-10-01-vs-code-port-design.md`

## Global Constraints

- No hex value and no alpha arithmetic in `src/*.mjs` (tests excluded). A value the port cannot find in the tokens is a foundation gap: stop and report it, do not approximate.
- A VS Code key with no role in the foundation is not set.
- Resolve role names with the foundation's `resolveTarget`; do not add a fallback.
- One theme, no variants. Theme label and `name`: `Sepp’s Workshop`, with the typographic apostrophe (U+2019). Company name: `sepp.med gmbh`.
- Publisher `sepps-workshop`, extension name `sepps-workshop-theme`, version `0.1.0`, licence MIT.
- Docs are English, exact where technical, no emoji. The README ends with the "Want to join Sepp’s Workshop?" section linking to https://www.seppmed.com/career/.
- `themes/` and `icon.png` are generated and committed. Never edit them by hand.
- Work on the branch `feat/initial-port`. The repository has no commits yet, so this branch is created unborn. Commits: Conventional Commits with gitmoji, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Do not push, tag or publish.
- The code in this plan was run against the released 0.2.1 tokens before the plan was written: 34 tests pass. If a step's output differs from its `Expected:` line, the cause is a transcription slip or a changed dependency, not a design question.
- Blueprint files are read from `/home/vanlaarmi12/Git-Repos/vivid-life-theme/vivid-life-vs-code` (referred to as `$VL`).

## Review Focus

- The foundation renames or removes a role or an overlay: the build must stop with the name, not emit `undefined` into the theme or throw an anonymous `TypeError`. (Task 2 and Task 3, the two "stops the build by name" tests)
- Someone bumps the design-system dependency and forgets to rebuild: `npm test` must fail and say `themes/` is stale. (Task 4, manifest test)
- Someone pastes a hex value or an alpha suffix into the template: a test must fail. (Task 3, the "no colour literal" and "every colour is a value the foundation publishes" tests)
- A git-decorated or error-marked row is hovered, focused or inactive-selected in the sidebar: its colour must stay at 4.5:1. (Task 2, the "rows that keep git and diagnostic colours" test)
- The packaged `.vsix` must contain the theme, icon, README, LICENSE, CHANGELOG and manifest, and none of `src/`, `docs/`, `scripts/`, `.claude/`. (Task 6, `vsce ls`)

---

### Task 1: Repository base

**Files:**

- Create: `package.json`, `LICENSE`, `.gitignore`, `.prettierignore`, `.vscodeignore`, `.claudeignore`

**Interfaces:**

- Produces: npm scripts `build`, `test`, `format`, `format:check`, `package`; installed `node_modules/@sepps-workshop/design-system`.

- [ ] **Step 1: Create the branch**

```bash
git switch -c feat/initial-port
```

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "sepps-workshop-theme",
  "displayName": "Sepp’s Workshop Theme",
  "description": "One medium-dark color theme for VS Code (Visual Studio Code) on sepp.med Darkblue. WCAG AA verified.",
  "version": "0.1.0",
  "publisher": "sepps-workshop",
  "license": "MIT",
  "author": {
    "name": "sepp.med gmbh"
  },
  "homepage": "https://github.com/sepps-workshop/sepps-workshop-vs-code",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/sepps-workshop/sepps-workshop-vs-code.git"
  },
  "bugs": {
    "url": "https://github.com/sepps-workshop/sepps-workshop-vs-code/issues"
  },
  "engines": {
    "vscode": "^1.74.0"
  },
  "categories": ["Themes"],
  "keywords": [
    "theme",
    "color-theme",
    "dark-theme",
    "wcag",
    "accessibility",
    "sepps-workshop"
  ],
  "icon": "icon.png",
  "galleryBanner": {
    "color": "#0d3174",
    "theme": "dark"
  },
  "type": "module",
  "scripts": {
    "build": "node build.mjs",
    "test": "node --test src/workbench-colors.test.mjs src/theme-template.test.mjs src/manifest.test.mjs",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "prepackage": "npm run build",
    "package": "vsce package"
  },
  "devDependencies": {
    "@sepps-workshop/design-system": "^0.2.1",
    "@vscode/vsce": "^3.9.2",
    "prettier": "^3.9.9"
  },
  "contributes": {
    "themes": [
      {
        "label": "Sepp’s Workshop",
        "uiTheme": "vs-dark",
        "path": "./themes/sepps-workshop-color-theme.json"
      }
    ]
  }
}
```

`galleryBanner.color` is the one colour a manifest must hold as a literal. Task 4 pins it to `surface.bg` with a test.

- [ ] **Step 3: Write `LICENSE`**

Copy `/home/vanlaarmi12/Git-Repos/sepps-workshop/sepps-workshop-design-system/LICENSE` and change the copyright line to:

```
Copyright (c) 2026 sepp.med gmbh
```

- [ ] **Step 4: Write the ignore files**

`.gitignore`: copy `$VL/.gitignore` unchanged.

`.prettierignore`:

```
node_modules/
themes/
package-lock.json
*.vsix
icon.png
images/
```

`.vscodeignore`:

```
.git/**
.github/**
.githooks/**
.gitignore
.vscodeignore
.prettierignore
.claudeignore
.claude/**
.superpowers/**
CLAUDE.md
node_modules/**
src/**
docs/**
scripts/**
build.mjs
package-lock.json
*.vsix
.DS_Store
```

`.claudeignore`:

```
node_modules/
themes/
*.vsix
```

- [ ] **Step 5: Install and verify the foundation**

```bash
npm install
node -e 'import("@sepps-workshop/design-system").then(({ default: t }) => console.log(t.meta.version, Object.keys(t.overlay).length, t.overlay.hover.hexa))'
```

Expected: `0.2.1 22 #1b1d1c4d`

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json LICENSE .gitignore .prettierignore .vscodeignore .claudeignore docs
git commit -m "🎉 chore: scaffold the extension manifest and add the port spec and plan

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Workbench colours

**Files:**

- Create: `src/workbench-colors.mjs`, `src/test-helpers.mjs`
- Test: `src/workbench-colors.test.mjs`

**Interfaces:**

- Consumes: `tokens` (default export of `@sepps-workshop/design-system`), `resolveTarget(tokens, target)`, `contrast(a, b)`, `alphaOver(fg, bg, alpha)` from `@sepps-workshop/design-system/tools/build-tokens`.
- Produces: `buildWorkbenchColors(tokens)` returning `{ [vscodeKey]: "#rrggbb" | "#rrggbbaa" }`. From `src/test-helpers.mjs`: `on(colour, base)` returning the opaque colour a theme value has on `base`, and `assertContrast(label, fg, bg, min)`.

- [ ] **Step 1: Write the test helpers**

`src/test-helpers.mjs`:

```js
// Shared by the test files; not part of the shipped extension.
import assert from "node:assert/strict";
import {
  contrast,
  alphaOver,
} from "@sepps-workshop/design-system/tools/build-tokens";

// What a theme colour looks like on `base`: itself if opaque, blended if not.
export const on = (colour, base) =>
  colour.length === 9
    ? alphaOver(colour.slice(0, 7), base, parseInt(colour.slice(7), 16) / 255)
    : colour;

export function assertContrast(label, fg, bg, min) {
  const ratio = contrast(fg, bg);
  assert.ok(
    ratio >= min,
    `${label}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min}:1`,
  );
}
```

- [ ] **Step 2: Write the failing tests**

`src/workbench-colors.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import tokens from "@sepps-workshop/design-system";
import { buildWorkbenchColors } from "./workbench-colors.mjs";
import { on, assertContrast } from "./test-helpers.mjs";

const colors = buildWorkbenchColors(tokens);
const { text, surface, syntax, semantic } = tokens;

/* ── Workbench: surfaces and state ───────────────────────────────── */

test("content sits on the canvas, chrome on the sunk surface", () => {
  assert.equal(colors["editor.background"], surface.bg);
  assert.equal(colors["tab.activeBackground"], surface.bg);
  for (const key of [
    "sideBar.background",
    "activityBar.background",
    "statusBar.background",
    "titleBar.activeBackground",
    "panel.background",
    "tab.inactiveBackground",
  ])
    assert.equal(colors[key], surface.bg_sunk, key);
  assert.notEqual(colors["panel.background"], colors["editor.background"]);
  assert.equal(colors["terminal.background"], surface.bg_terminal);
  assert.equal(
    colors["terminalCursor.background"],
    colors["terminal.background"],
  );
});

test("the status bar is neutral; the accent is its border", () => {
  assert.equal(colors["statusBar.background"], surface.bg_sunk);
  assert.equal(colors["statusBar.border"], tokens.accent);
  assert.notEqual(colors["statusBar.noFolderBorder"], tokens.accent);
  assert.equal(
    colors["statusBar.debuggingBackground"],
    tokens.semantic_fill.danger.fill,
  );
  for (const key of ["remote", "error", "warning", "prominent"])
    assert.notEqual(
      colors[`statusBarItem.${key}Background`],
      colors["statusBar.background"],
      key,
    );
  assert.notEqual(
    colors["statusBarItem.remoteBackground"],
    colors["statusBarItem.errorBackground"],
  );
  assert.notEqual(
    colors["statusBarItem.remoteBackground"],
    colors["badge.background"],
  );
});

test("the same role has the same colour wherever the state appears", () => {
  const same = (keys, colour) => {
    for (const key of keys) assert.equal(colors[key], colour, key);
  };
  same(
    [
      "editorError.foreground",
      "editorOverviewRuler.errorForeground",
      "minimap.errorHighlight",
      "problemsErrorIcon.foreground",
      "list.errorForeground",
      "notificationsErrorIcon.foreground",
      "gitDecoration.deletedResourceForeground",
      "editorGutter.deletedBackground",
      "editorBracketHighlight.unexpectedBracket.foreground",
    ],
    semantic.danger,
  );
  same(
    [
      "editorWarning.foreground",
      "editorOverviewRuler.warningForeground",
      "problemsWarningIcon.foreground",
      "gitDecoration.conflictingResourceForeground",
    ],
    semantic.warning,
  );
  same(
    [
      "gitDecoration.modifiedResourceForeground",
      "editorGutter.modifiedBackground",
      "minimapGutter.modifiedBackground",
      "editorInfo.foreground",
    ],
    semantic.info,
  );
  same(
    [
      "gitDecoration.addedResourceForeground",
      "gitDecoration.untrackedResourceForeground",
      "editorGutter.addedBackground",
    ],
    semantic.success,
  );
  assert.equal(colors["editorHint.foreground"], text.fg_muted);
  assert.equal(
    colors["gitDecoration.ignoredResourceForeground"],
    text.fg_disabled,
  );
});

test("bracket pairs follow the foundation's order and start neutral", () => {
  const pairs = tokens.workbench_color_roles.bracket_pairs;
  assert.equal(colors["editorBracketHighlight.foreground1"], text.fg);
  assert.equal(pairs.length, 6);
  for (let i = 1; i <= 6; i++)
    assert.notEqual(
      colors[`editorBracketHighlight.foreground${i}`],
      syntax.keyword,
      `level ${i}`,
    );
});

test("states are never colour alone: hued highlights carry a border", () => {
  assert.equal(
    colors["editor.findMatchBorder"],
    tokens.overlay.find_match.border,
  );
  assert.equal(
    colors["editor.findMatchHighlightBorder"],
    tokens.overlay.find_match_other.border,
  );
  assert.equal(
    colors["editor.wordHighlightStrongBorder"],
    tokens.overlay.word_highlight_strong.border,
  );
  assert.equal(colors["editorBracketMatch.border"], tokens.accent);
  assert.notEqual(
    colors["editor.findMatchBackground"],
    colors["editor.selectionBackground"],
  );
  // One fill for both debugger frames, two differently coloured arrows.
  assert.equal(
    colors["editor.stackFrameHighlightBackground"],
    colors["editor.focusedStackFrameHighlightBackground"],
  );
  assert.notEqual(
    colors["debugIcon.breakpointCurrentStackframeForeground"],
    colors["debugIcon.breakpointStackframeForeground"],
  );
});

test("keys VS Code requires to be translucent are translucent", () => {
  for (const key of [
    "editor.inactiveSelectionBackground",
    "editor.selectionHighlightBackground",
    "editor.wordHighlightBackground",
    "editor.wordHighlightStrongBackground",
    "editor.findMatchHighlightBackground",
    "editor.findRangeHighlightBackground",
    "editor.hoverHighlightBackground",
    "editor.rangeHighlightBackground",
    "editor.symbolHighlightBackground",
    "diffEditor.insertedTextBackground",
    "diffEditor.removedTextBackground",
    "diffEditor.insertedLineBackground",
    "diffEditor.removedLineBackground",
    "merge.currentHeaderBackground",
    "merge.currentContentBackground",
    "merge.incomingHeaderBackground",
    "merge.incomingContentBackground",
    "merge.commonHeaderBackground",
    "merge.commonContentBackground",
    "terminal.findMatchBackground",
    "terminal.findMatchHighlightBackground",
    "sideBar.dropBackground",
  ])
    assert.match(String(colors[key]), /^#[0-9a-f]{8}$/, key);
});

test("keys with no role in the foundation are left at VS Code defaults", () => {
  for (const key of [
    "editorOverviewRuler.findMatchForeground",
    "editorOverviewRuler.rangeHighlightForeground",
    "editorOverviewRuler.selectionHighlightForeground",
    "editorOverviewRuler.wordHighlightForeground",
    "tab.activeBorder",
    "menu.selectionBorder",
    "menubar.selectionBorder",
    "editorUnnecessaryCode.opacity",
    "charts.purple",
    "statusBarItem.prominentHoverBackground",
  ])
    assert.ok(!(key in colors), `${key} is set`);
});

/* ── Workbench: contrast of pairs only this port creates ─────────── */

test("fills carry readable text", () => {
  for (const [fg, bg] of [
    ["statusBar.foreground", "statusBar.background"],
    ["statusBar.debuggingForeground", "statusBar.debuggingBackground"],
    ["statusBarItem.remoteForeground", "statusBarItem.remoteBackground"],
    ["statusBarItem.errorForeground", "statusBarItem.errorBackground"],
    ["statusBarItem.warningForeground", "statusBarItem.warningBackground"],
    ["statusBarItem.prominentForeground", "statusBarItem.prominentBackground"],
    ["statusBarItem.offlineForeground", "statusBarItem.offlineBackground"],
    ["badge.foreground", "badge.background"],
    ["activityBarBadge.foreground", "activityBarBadge.background"],
    ["button.foreground", "button.background"],
    ["button.foreground", "button.hoverBackground"],
    ["button.secondaryForeground", "button.secondaryBackground"],
    ["button.secondaryForeground", "button.secondaryHoverBackground"],
    [
      "extensionButton.prominentForeground",
      "extensionButton.prominentHoverBackground",
    ],
    ["chat.avatarForeground", "chat.avatarBackground"],
    ["tab.inactiveForeground", "tab.inactiveBackground"],
    ["sideBar.foreground", "sideBar.background"],
    ["descriptionForeground", "sideBar.background"],
    ["input.foreground", "input.background"],
    ["input.placeholderForeground", "input.background"],
    ["dropdown.foreground", "dropdown.background"],
    ["panelTitle.inactiveForeground", "panel.background"],
    ["editorLineNumber.foreground", "editor.background"],
    ["peekViewResult.lineForeground", "peekViewResult.background"],
    ["textPreformat.foreground", "textCodeBlock.background"],
    ["textLink.foreground", "editor.background"],
    ["textLink.foreground", "notifications.background"],
  ])
    assertContrast(`${fg} on ${bg}`, colors[fg], colors[bg], 4.5);
});

test("selected rows carry their text and the match highlight", () => {
  for (const [wash, base, texts] of [
    [
      "list.activeSelectionBackground",
      "sideBar.background",
      ["list.activeSelectionForeground", "list.highlightForeground"],
    ],
    [
      "list.activeSelectionBackground",
      "editor.background",
      ["list.activeSelectionForeground", "list.highlightForeground"],
    ],
    [
      "quickInputList.focusBackground",
      "quickInput.background",
      ["quickInputList.focusForeground", "list.highlightForeground"],
    ],
    [
      "editorSuggestWidget.selectedBackground",
      "editorSuggestWidget.background",
      [
        "editorSuggestWidget.selectedForeground",
        "editorSuggestWidget.focusHighlightForeground",
      ],
    ],
    [
      "menu.selectionBackground",
      "menu.background",
      ["menu.selectionForeground"],
    ],
    [
      "peekViewResult.selectionBackground",
      "peekViewResult.background",
      ["peekViewResult.selectionForeground"],
    ],
    [
      "inputOption.activeBackground",
      "input.background",
      ["inputOption.activeForeground"],
    ],
    [
      "chat.slashCommandBackground",
      "chat.requestBackground",
      ["chat.slashCommandForeground"],
    ],
  ]) {
    const bg = on(colors[wash], colors[base]);
    for (const key of texts)
      assertContrast(`${key} on ${wash} over ${base}`, colors[key], bg, 4.5);
  }
});

test("rows that keep git and diagnostic colours stay readable", () => {
  const rowColours = [
    "sideBar.foreground",
    "gitDecoration.addedResourceForeground",
    "gitDecoration.modifiedResourceForeground",
    "gitDecoration.deletedResourceForeground",
    "gitDecoration.conflictingResourceForeground",
    "gitDecoration.stageModifiedResourceForeground",
    "list.errorForeground",
    "list.warningForeground",
    "list.deemphasizedForeground",
  ];
  for (const wash of [
    "list.hoverBackground",
    "list.inactiveSelectionBackground",
    "list.focusBackground",
    "list.dropBackground",
    "tab.hoverBackground",
  ])
    for (const base of ["sideBar.background", "editor.background"]) {
      const bg = on(colors[wash], colors[base]);
      for (const key of rowColours)
        assertContrast(`${key} on ${wash} over ${base}`, colors[key], bg, 4.5);
    }
});

test("ANSI colours stay readable on the terminal selection", () => {
  const term = colors["terminal.background"];
  for (const wash of [
    "terminal.selectionBackground",
    "terminal.inactiveSelectionBackground",
  ])
    for (const [key, value] of Object.entries(colors))
      if (key.startsWith("terminal.ansi") && key !== "terminal.ansiBlack")
        assertContrast(`${key} on ${wash}`, value, on(colors[wash], term), 4.5);
});

test("the focus ring and control outlines reach 3:1 on every surface", () => {
  for (const base of [
    "editor.background",
    "sideBar.background",
    "menu.background",
    "input.background",
  ]) {
    assertContrast(
      `focusBorder on ${base}`,
      colors.focusBorder,
      colors[base],
      3,
    );
    assertContrast(
      `input.border on ${base}`,
      colors["input.border"],
      colors[base],
      3,
    );
  }
  assertContrast(
    "scrollbar thumb while dragged",
    on(colors["scrollbarSlider.activeBackground"], colors["editor.background"]),
    colors["editor.background"],
    3,
  );
});

/* ── Foundation changes surface as named errors ──────────────────── */

test("an overlay the foundation no longer has stops the build by name", () => {
  const broken = structuredClone(tokens);
  delete broken.overlay.hover;
  assert.throws(() => buildWorkbenchColors(broken), /Unknown overlay: hover/);
});
```

- [ ] **Step 3: Run the tests and see them fail**

Run: `node --test src/workbench-colors.test.mjs`
Expected: the file fails to load with `Cannot find module` for `./workbench-colors.mjs`.

- [ ] **Step 4: Write `src/workbench-colors.mjs`**

```js
// Workbench colours: which foundation token feeds which VS Code key.
// A key with no role in the foundation is not set; VS Code's default applies.

import { resolveTarget } from "@sepps-workshop/design-system/tools/build-tokens";

export function buildWorkbenchColors(tokens) {
  const { surface, text, border, ansi, overlay } = tokens;
  const { accent, accent_on, accent_hover } = tokens;
  const { danger: dangerFill, warning: warningFill } = tokens.semantic_fill;
  const roles = tokens.workbench_color_roles;
  const resolve = (map) =>
    Object.fromEntries(
      Object.entries(map).map(([k, v]) => [k, resolveTarget(tokens, v)]),
    );
  const signal = resolve(roles.signals);
  const git = resolve(roles.git);
  const link = resolveTarget(tokens, tokens.syntax_tokens.extended.link);
  // The recipe itself, translucent: VS Code blends it over whatever is below.
  const wash = (name) => {
    if (!overlay[name]) throw new Error(`Unknown overlay: ${name}`);
    return overlay[name].hexa;
  };

  return {
    // base
    foreground: text.fg,
    "icon.foreground": text.fg_muted,
    descriptionForeground: text.fg_subtle,
    errorForeground: signal.error,
    focusBorder: accent,
    "widget.shadow": wash("scrim"),
    "selection.background": wash("selection"),

    // window
    "window.activeBorder": border.default,
    "window.inactiveBorder": border.subtle,

    // editor
    "editor.background": surface.bg,
    "editor.foreground": text.fg,
    "editorLineNumber.foreground": text.fg_subtle,
    "editorLineNumber.activeForeground": text.fg,
    "editor.lineHighlightBackground": wash("line_highlight"),
    "editor.lineHighlightBorder": wash("line_highlight"),
    "editor.selectionBackground": wash("selection"),
    "editor.inactiveSelectionBackground": wash("selection_inactive"),
    "editor.selectionHighlightBackground": wash("word_highlight"),
    // Read and write access share a fill; the write highlight adds the border.
    "editor.wordHighlightBackground": wash("word_highlight"),
    "editor.wordHighlightStrongBackground": wash("word_highlight_strong"),
    "editor.wordHighlightStrongBorder": overlay.word_highlight_strong.border,
    // Find matches are hued and bordered, so they never read as selection.
    "editor.findMatchBackground": wash("find_match"),
    "editor.findMatchBorder": overlay.find_match.border,
    "editor.findMatchHighlightBackground": wash("find_match_other"),
    "editor.findMatchHighlightBorder": overlay.find_match_other.border,
    "editor.findRangeHighlightBackground": wash("selection_inactive"),
    "editor.hoverHighlightBackground": wash("word_highlight"),
    "editor.rangeHighlightBackground": wash("hover"),
    "editor.symbolHighlightBackground": wash("word_highlight"),
    "editorCursor.foreground": accent,
    "editorWhitespace.foreground": text.fg_disabled,
    "editorIndentGuide.background1": border.subtle,
    "editorIndentGuide.activeBackground1": border.default,
    "editorRuler.foreground": border.subtle,
    "editorCodeLens.foreground": text.fg_subtle,
    "editorBracketMatch.background": wash("word_highlight_strong"),
    "editorBracketMatch.border": overlay.word_highlight_strong.border,
    "editorOverviewRuler.border": border.subtle,
    "editorOverviewRuler.modifiedForeground": git.modified,
    "editorOverviewRuler.addedForeground": git.added,
    "editorOverviewRuler.deletedForeground": git.deleted,
    "editorOverviewRuler.errorForeground": signal.error,
    "editorOverviewRuler.warningForeground": signal.warning,
    "editorOverviewRuler.infoForeground": signal.info,
    "editorOverviewRuler.bracketMatchForeground": accent,
    "editorError.foreground": signal.error,
    "editorWarning.foreground": signal.warning,
    "editorInfo.foreground": signal.info,
    "editorHint.foreground": signal.hint,
    "editorLink.activeForeground": link,

    // editor gutter
    "editorGutter.background": surface.bg,
    "editorGutter.modifiedBackground": git.modified,
    "editorGutter.addedBackground": git.added,
    "editorGutter.deletedBackground": git.deleted,

    // Bracket pairs: the foundation's order starts neutral, so the most
    // common pair doesn't shout, and skips the keyword colour.
    ...Object.fromEntries(
      roles.bracket_pairs.map((target, i) => [
        `editorBracketHighlight.foreground${i + 1}`,
        resolveTarget(tokens, target),
      ]),
    ),
    "editorBracketHighlight.unexpectedBracket.foreground": resolveTarget(
      tokens,
      roles.bracket_unexpected,
    ),

    // editor groups & tabs
    "editorGroup.border": border.subtle,
    "editorGroup.emptyBackground": surface.bg_sunk,
    "editorGroupHeader.tabsBackground": surface.bg_sunk,
    "editorGroupHeader.tabsBorder": border.subtle,
    "editorGroupHeader.noTabsBackground": surface.bg_sunk,
    "tab.activeBackground": surface.bg,
    "tab.activeForeground": text.fg,
    "tab.activeBorderTop": accent,
    "tab.inactiveBackground": surface.bg_sunk,
    "tab.inactiveForeground": text.fg_subtle,
    "tab.unfocusedActiveForeground": text.fg_muted,
    "tab.unfocusedInactiveForeground": text.fg_subtle,
    "tab.border": border.subtle,
    // Not bg_soft: a tab label can carry a git colour, bg_soft carries fg only.
    "tab.hoverBackground": wash("hover"),
    "tab.hoverForeground": text.fg,
    "tab.unfocusedHoverBackground": wash("hover"),
    "tab.activeModifiedBorder": signal.warning,
    "tab.inactiveModifiedBorder": signal.warning,

    // activity bar
    "activityBar.background": surface.bg_sunk,
    "activityBar.foreground": text.fg,
    "activityBar.inactiveForeground": text.fg_subtle,
    "activityBar.activeBorder": accent,
    "activityBar.activeBackground": wash("hover"),
    "activityBar.border": border.subtle,
    "activityBarBadge.background": accent,
    "activityBarBadge.foreground": accent_on,

    // sidebar
    "sideBar.background": surface.bg_sunk,
    "sideBar.foreground": text.fg_muted,
    "sideBar.border": border.subtle,
    "sideBar.dropBackground": wash("active"),
    "sideBarTitle.foreground": text.fg,
    "sideBarSectionHeader.background": surface.bg,
    "sideBarSectionHeader.foreground": text.fg_muted,
    "sideBarSectionHeader.border": border.subtle,

    // status bar — stays on the sunk surface so VS Code's own state signals
    // stand out. The accent is a strip along the top edge, never the fill;
    // statusBar.noFolderBorder removes the strip when no folder is open.
    "statusBar.background": surface.bg_sunk,
    "statusBar.foreground": text.fg,
    "statusBar.border": accent,
    "statusBar.noFolderBackground": surface.bg_sunk,
    "statusBar.noFolderForeground": text.fg,
    "statusBar.noFolderBorder": border.subtle,
    // Red as a fill is Signalred with white text. The accent is already
    // yellow, so debugging takes the danger fill, not the warning one.
    "statusBar.debuggingBackground": dangerFill.fill,
    "statusBar.debuggingForeground": dangerFill.text,
    "statusBar.debuggingBorder": border.subtle,
    "statusBarItem.activeBackground": wash("active"),
    "statusBarItem.hoverBackground": wash("hover"),
    // "prominent" is the Workspace Trust "Restricted Mode" badge: a soft
    // warning, so it shares the warning fill.
    "statusBarItem.prominentBackground": warningFill.fill,
    "statusBarItem.prominentForeground": warningFill.text,
    // The remote chip must differ from the bar, the accent badges and the
    // danger fill; ansi.cyan is none of them.
    "statusBarItem.remoteBackground": ansi.cyan,
    "statusBarItem.remoteForeground": accent_on,
    "statusBarItem.errorBackground": dangerFill.fill,
    "statusBarItem.errorForeground": dangerFill.text,
    "statusBarItem.warningBackground": warningFill.fill,
    "statusBarItem.warningForeground": warningFill.text,
    "statusBarItem.offlineBackground": dangerFill.fill,
    "statusBarItem.offlineForeground": dangerFill.text,

    // terminal command decorations (shell integration gutter dots)
    "terminalCommandDecoration.defaultBackground": text.fg_subtle,
    "terminalCommandDecoration.successBackground": signal.success,
    "terminalCommandDecoration.errorBackground": signal.error,

    // title bar
    "titleBar.activeBackground": surface.bg_sunk,
    "titleBar.activeForeground": text.fg,
    "titleBar.inactiveBackground": surface.bg_sunk,
    "titleBar.inactiveForeground": text.fg_subtle,
    "titleBar.border": border.subtle,

    // menubar / menu
    "menubar.selectionBackground": wash("hover"),
    "menubar.selectionForeground": text.fg,
    "menu.background": surface.bg_overlay,
    "menu.foreground": text.fg,
    "menu.selectionBackground": wash("selected_item"),
    "menu.selectionForeground": text.fg,
    "menu.separatorBackground": border.subtle,
    "menu.border": border.default,

    // buttons
    "button.background": accent,
    "button.foreground": accent_on,
    "button.hoverBackground": accent_hover,
    "button.secondaryBackground": surface.bg_overlay,
    "button.secondaryForeground": text.fg,
    "button.secondaryHoverBackground": surface.bg_soft,
    "button.border": border.control,
    "checkbox.background": surface.bg_soft,
    "checkbox.foreground": text.fg,
    "checkbox.border": border.control,

    // inputs — bg_soft carries fg and fg_muted only, so the placeholder
    // steps up from fg_subtle.
    "input.background": surface.bg_soft,
    "input.foreground": text.fg,
    "input.border": border.control,
    "input.placeholderForeground": text.fg_muted,
    "inputOption.activeBackground": wash("selected_item"),
    "inputOption.activeBorder": accent,
    "inputOption.activeForeground": text.fg,
    "inputOption.hoverBackground": wash("hover"),
    // Validation boxes: no tinted fill; the border carries the state.
    "inputValidation.errorBackground": surface.bg_overlay,
    "inputValidation.errorBorder": signal.error,
    "inputValidation.errorForeground": text.fg,
    "inputValidation.warningBackground": surface.bg_overlay,
    "inputValidation.warningBorder": signal.warning,
    "inputValidation.warningForeground": text.fg,
    "inputValidation.infoBackground": surface.bg_overlay,
    "inputValidation.infoBorder": signal.info,
    "inputValidation.infoForeground": text.fg,

    // dropdown
    "dropdown.background": surface.bg_soft,
    "dropdown.foreground": text.fg,
    "dropdown.border": border.control,
    "dropdown.listBackground": surface.bg_overlay,

    // lists & trees — the selected_item wash carries fg and fg_muted only.
    // Rows that keep their git colours (inactive selection, keyboard focus)
    // take the darkening `active` overlay instead.
    "list.activeSelectionBackground": wash("selected_item"),
    "list.activeSelectionForeground": text.fg,
    "list.activeSelectionIconForeground": text.fg,
    "list.inactiveSelectionBackground": wash("active"),
    "list.hoverBackground": wash("hover"),
    "list.focusBackground": wash("active"),
    "list.focusOutline": accent,
    "list.focusHighlightForeground": accent,
    "list.dropBackground": wash("active"),
    "list.highlightForeground": accent,
    "list.errorForeground": signal.error,
    "list.warningForeground": signal.warning,
    "list.deemphasizedForeground": text.fg_subtle,
    "list.invalidItemForeground": signal.error,
    "tree.indentGuidesStroke": border.default,
    "tree.inactiveIndentGuidesStroke": border.subtle,
    "listFilterWidget.background": surface.bg_overlay,
    "listFilterWidget.outline": accent,
    "listFilterWidget.noMatchesOutline": signal.error,

    // scrollbar
    "scrollbar.shadow": wash("scrim"),
    "scrollbarSlider.background": wash("slider"),
    "scrollbarSlider.hoverBackground": wash("slider_hover"),
    "scrollbarSlider.activeBackground": wash("slider_active"),

    // minimap
    "minimap.background": surface.bg,
    "minimap.findMatchHighlight": overlay.find_match.border,
    "minimap.selectionHighlight": text.fg_muted,
    "minimap.errorHighlight": signal.error,
    "minimap.warningHighlight": signal.warning,
    "minimap.selectionOccurrenceHighlight": text.fg_subtle,
    "minimapSlider.background": wash("slider"),
    "minimapSlider.hoverBackground": wash("slider_hover"),
    "minimapSlider.activeBackground": wash("slider_active"),
    "minimapGutter.addedBackground": git.added,
    "minimapGutter.modifiedBackground": git.modified,
    "minimapGutter.deletedBackground": git.deleted,

    // badge
    "badge.background": accent,
    "badge.foreground": accent_on,

    // progress bar
    "progressBar.background": accent,

    // notifications
    "notifications.background": surface.bg_overlay,
    "notifications.foreground": text.fg,
    "notifications.border": border.default,
    "notificationCenter.border": border.default,
    "notificationCenterHeader.background": surface.bg_sunk,
    "notificationCenterHeader.foreground": text.fg,
    "notificationToast.border": border.default,
    "notificationLink.foreground": link,
    "notificationsErrorIcon.foreground": signal.error,
    "notificationsWarningIcon.foreground": signal.warning,
    "notificationsInfoIcon.foreground": signal.info,

    // panel (terminal/output container) — chrome, so it sits on bg_sunk
    // with the sidebar and the status bar. Section headers take the canvas.
    "panel.background": surface.bg_sunk,
    "panel.border": border.subtle,
    "panel.dropBorder": accent,
    "panelTitle.activeBorder": accent,
    "panelTitle.activeForeground": text.fg,
    "panelTitle.inactiveForeground": text.fg_subtle,
    "panelInput.border": border.control,
    "panelSection.border": border.subtle,
    "panelSectionHeader.background": surface.bg,
    "panelSectionHeader.foreground": text.fg,

    // terminal — bg_terminal is the canvas: the Darkblue people recognise.
    // No selection foreground: the foundation gates ANSI on the selection.
    "terminal.foreground": text.fg,
    "terminal.background": surface.bg_terminal,
    "terminal.border": border.subtle,
    "terminal.selectionBackground": wash("selection"),
    "terminal.inactiveSelectionBackground": wash("selection_inactive"),
    "terminal.findMatchBackground": wash("find_match"),
    "terminal.findMatchBorder": overlay.find_match.border,
    "terminal.findMatchHighlightBackground": wash("find_match_other"),
    "terminal.findMatchHighlightBorder": overlay.find_match_other.border,
    "terminalCursor.foreground": accent,
    "terminalCursor.background": surface.bg_terminal,
    "terminal.ansiBlack": ansi.black,
    "terminal.ansiRed": ansi.red,
    "terminal.ansiGreen": ansi.green,
    "terminal.ansiYellow": ansi.yellow,
    "terminal.ansiBlue": ansi.blue,
    "terminal.ansiMagenta": ansi.magenta,
    "terminal.ansiCyan": ansi.cyan,
    "terminal.ansiWhite": ansi.white,
    "terminal.ansiBrightBlack": ansi.bright_black,
    "terminal.ansiBrightRed": ansi.bright_red,
    "terminal.ansiBrightGreen": ansi.bright_green,
    "terminal.ansiBrightYellow": ansi.bright_yellow,
    "terminal.ansiBrightBlue": ansi.bright_blue,
    "terminal.ansiBrightMagenta": ansi.bright_magenta,
    "terminal.ansiBrightCyan": ansi.bright_cyan,
    "terminal.ansiBrightWhite": ansi.bright_white,

    // git decoration
    "gitDecoration.addedResourceForeground": git.added,
    "gitDecoration.modifiedResourceForeground": git.modified,
    "gitDecoration.deletedResourceForeground": git.deleted,
    "gitDecoration.renamedResourceForeground": git.modified,
    "gitDecoration.untrackedResourceForeground": git.untracked,
    "gitDecoration.ignoredResourceForeground": git.ignored,
    "gitDecoration.conflictingResourceForeground": git.conflicting,
    "gitDecoration.stageModifiedResourceForeground": signal.warning,
    "gitDecoration.stageDeletedResourceForeground": git.deleted,
    "gitDecoration.submoduleResourceForeground": text.fg_subtle,

    // diff editor — a changed span is drawn on top of its line. The gutter
    // reuses the line recipe: a stronger one takes line numbers below AA.
    "diffEditor.insertedTextBackground": wash("diff_inserted_text"),
    "diffEditor.removedTextBackground": wash("diff_removed_text"),
    "diffEditor.insertedLineBackground": wash("diff_inserted_line"),
    "diffEditor.removedLineBackground": wash("diff_removed_line"),
    "diffEditorGutter.insertedLineBackground": wash("diff_inserted_line"),
    "diffEditorGutter.removedLineBackground": wash("diff_removed_line"),
    "diffEditorOverview.insertedForeground": git.added,
    "diffEditorOverview.removedForeground": git.deleted,

    // merge conflict
    "merge.currentHeaderBackground": wash("merge_current_header"),
    "merge.currentContentBackground": wash("merge_current_content"),
    "merge.incomingHeaderBackground": wash("merge_incoming_header"),
    "merge.incomingContentBackground": wash("diff_inserted_line"),
    "merge.commonHeaderBackground": wash("active"),
    "merge.commonContentBackground": wash("hover"),
    "merge.border": border.subtle,

    // peek view
    "peekView.border": accent,
    "peekViewEditor.background": surface.bg,
    "peekViewEditor.matchHighlightBackground": wash("find_match"),
    "peekViewEditor.matchHighlightBorder": overlay.find_match.border,
    "peekViewEditorGutter.background": surface.bg,
    "peekViewResult.background": surface.bg_sunk,
    "peekViewResult.fileForeground": text.fg,
    "peekViewResult.lineForeground": text.fg_muted,
    "peekViewResult.matchHighlightBackground": wash("find_match"),
    "peekViewResult.selectionBackground": wash("selected_item"),
    "peekViewResult.selectionForeground": text.fg,
    "peekViewTitle.background": surface.bg_sunk,
    "peekViewTitleDescription.foreground": text.fg_subtle,
    "peekViewTitleLabel.foreground": text.fg,

    // breadcrumbs
    "breadcrumb.background": surface.bg,
    "breadcrumb.foreground": text.fg_muted,
    "breadcrumb.focusForeground": text.fg,
    "breadcrumb.activeSelectionForeground": accent,
    "breadcrumbPicker.background": surface.bg_overlay,

    // editor widgets
    "editorWidget.background": surface.bg_overlay,
    "editorWidget.foreground": text.fg,
    "editorWidget.border": border.default,
    "editorWidget.resizeBorder": accent,
    "editorSuggestWidget.background": surface.bg_overlay,
    "editorSuggestWidget.border": border.default,
    "editorSuggestWidget.foreground": text.fg,
    "editorSuggestWidget.highlightForeground": accent,
    "editorSuggestWidget.focusHighlightForeground": accent,
    "editorSuggestWidget.selectedBackground": wash("selected_item"),
    "editorSuggestWidget.selectedForeground": text.fg,
    "editorSuggestWidget.selectedIconForeground": text.fg,
    "editorHoverWidget.background": surface.bg_overlay,
    "editorHoverWidget.border": border.default,
    "editorHoverWidget.foreground": text.fg,
    "editorHoverWidget.statusBarBackground": surface.bg_sunk,

    // quick input (Ctrl+P, Ctrl+Shift+P)
    "quickInput.background": surface.bg_overlay,
    "quickInput.foreground": text.fg,
    "quickInputList.focusBackground": wash("selected_item"),
    "quickInputList.focusForeground": text.fg,
    "quickInputList.focusIconForeground": text.fg,
    "quickInputTitle.background": surface.bg_sunk,
    "pickerGroup.foreground": accent,
    "pickerGroup.border": border.subtle,

    // text links / preformatted — links take the link slot, not the accent:
    // the accent is for focus and identity.
    "textLink.foreground": link,
    "textLink.activeForeground": link,
    "textBlockQuote.background": surface.bg_sunk,
    "textBlockQuote.border": accent,
    "textCodeBlock.background": surface.bg_sunk,
    "textPreformat.foreground": tokens.syntax.string,
    "textSeparator.foreground": border.subtle,

    // settings editor
    "settings.headerForeground": text.fg,
    "settings.modifiedItemIndicator": accent,
    "settings.dropdownBackground": surface.bg_soft,
    "settings.dropdownForeground": text.fg,
    "settings.dropdownBorder": border.control,
    "settings.checkboxBackground": surface.bg_soft,
    "settings.checkboxForeground": text.fg,
    "settings.checkboxBorder": border.control,
    "settings.textInputBackground": surface.bg_soft,
    "settings.textInputForeground": text.fg,
    "settings.textInputBorder": border.control,
    "settings.numberInputBackground": surface.bg_soft,
    "settings.numberInputForeground": text.fg,
    "settings.numberInputBorder": border.control,

    // debug — one fill for both frames; the gutter arrow tells them apart.
    "debugToolBar.background": surface.bg_overlay,
    "debugToolBar.border": border.default,
    "debugIcon.breakpointForeground": signal.error,
    "debugIcon.breakpointDisabledForeground": text.fg_disabled,
    "debugIcon.breakpointUnverifiedForeground": text.fg_subtle,
    "debugIcon.breakpointCurrentStackframeForeground": signal.warning,
    "debugIcon.breakpointStackframeForeground": signal.success,
    "debugIcon.startForeground": signal.success,
    "debugIcon.pauseForeground": signal.info,
    "debugIcon.stopForeground": signal.error,
    "debugIcon.disconnectForeground": signal.warning,
    "debugIcon.restartForeground": signal.success,
    "debugIcon.stepOverForeground": signal.info,
    "debugIcon.stepIntoForeground": signal.info,
    "debugIcon.stepOutForeground": signal.info,
    "debugIcon.continueForeground": signal.success,
    "debugConsole.infoForeground": signal.info,
    "debugConsole.warningForeground": signal.warning,
    "debugConsole.errorForeground": signal.error,
    "debugConsole.sourceForeground": text.fg_muted,
    "debugConsoleInputIcon.foreground": accent,
    "editor.stackFrameHighlightBackground": wash("stack_frame"),
    "editor.focusedStackFrameHighlightBackground": wash("stack_frame"),

    // problems
    "problemsErrorIcon.foreground": signal.error,
    "problemsWarningIcon.foreground": signal.warning,
    "problemsInfoIcon.foreground": signal.info,

    // welcome page
    "welcomePage.background": surface.bg,
    "welcomePage.tileBackground": surface.bg_sunk,
    "welcomePage.tileHoverBackground": surface.bg_soft,
    "welcomePage.progress.background": surface.bg_sunk,
    "welcomePage.progress.foreground": accent,
    "walkThrough.embeddedEditorBackground": surface.bg_sunk,

    // charts — the brand has no purple; charts.purple stays at the default.
    "charts.foreground": text.fg,
    "charts.lines": text.fg_subtle,
    "charts.red": signal.error,
    "charts.blue": signal.info,
    "charts.yellow": accent,
    "charts.orange": signal.warning,
    "charts.green": signal.success,

    // notebook — cells hold code, so a selected cell darkens.
    "notebook.cellBorderColor": border.subtle,
    "notebook.cellHoverBackground": wash("hover"),
    "notebook.cellInsertionIndicator": accent,
    "notebook.cellStatusBarItemHoverBackground": wash("hover"),
    "notebook.cellToolbarSeparator": border.subtle,
    "notebook.editorBackground": surface.bg,
    "notebook.focusedCellBackground": wash("hover"),
    "notebook.focusedCellBorder": accent,
    "notebook.focusedEditorBorder": accent,
    "notebook.inactiveFocusedCellBorder": border.default,
    "notebook.inactiveSelectedCellBorder": border.default,
    "notebook.outputContainerBackgroundColor": surface.bg_sunk,
    "notebook.selectedCellBackground": wash("active"),
    "notebook.selectedCellBorder": border.default,
    "notebook.symbolHighlightBackground": wash("word_highlight"),

    // chat
    "chat.requestBorder": border.subtle,
    "chat.requestBackground": surface.bg_soft,
    "chat.requestBubbleBackground": surface.bg_soft,
    "chat.requestCodeBorder": border.default,
    "chat.checkpointSeparator": border.subtle,
    "chat.thinkingShimmer": accent,
    "chat.avatarBackground": ansi.cyan,
    "chat.avatarForeground": accent_on,
    "chat.slashCommandBackground": wash("selected_item"),
    "chat.slashCommandForeground": text.fg,
    "chat.editedFileForeground": accent,
    "chat.linesAddedForeground": git.added,
    "chat.linesRemovedForeground": git.deleted,
    "chatManagement.sashBorder": border.subtle,

    // extensions
    "extensionButton.prominentBackground": accent,
    "extensionButton.prominentForeground": accent_on,
    "extensionButton.prominentHoverBackground": accent_hover,
    "extensionBadge.remoteBackground": accent,
    "extensionBadge.remoteForeground": accent_on,
    "extensionIcon.starForeground": signal.warning,
    "extensionIcon.verifiedForeground": signal.success,
    "extensionIcon.preReleaseForeground": signal.info,
  };
}
```

- [ ] **Step 5: Run the tests and see them pass**

Run: `node --test src/workbench-colors.test.mjs`
Expected: 13 tests, 13 pass. A contrast failure names the pair and the ratio; if one appears, check the key against Step 4 before anything else.

- [ ] **Step 6: Commit**

```bash
git add src/workbench-colors.mjs src/workbench-colors.test.mjs src/test-helpers.mjs
git commit -m "✨ feat(theme): map foundation tokens to workbench colours

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Syntax rules, semantic tokens and the theme object

**Files:**

- Create: `src/theme-template.mjs`
- Test: `src/theme-template.test.mjs`

**Interfaces:**

- Consumes: `buildWorkbenchColors(tokens)` from Task 2; `on`, `assertContrast` from `src/test-helpers.mjs`.
- Produces: `buildTheme(tokens)` returning `{ $schema, name, type, semanticHighlighting, colors, tokenColors, semanticTokenColors }`. Each `tokenColors` entry is `{ name, scope: string[], settings: { foreground?, fontStyle? } }`.

- [ ] **Step 1: Write the failing tests**

`src/theme-template.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import tokens from "@sepps-workshop/design-system";
import { buildTheme } from "./theme-template.mjs";
import { on, assertContrast } from "./test-helpers.mjs";

const theme = buildTheme(tokens);
const { colors } = theme;
const { text, surface, syntax, semantic } = tokens;

// Look up a tokenColors entry by its `name` field.
function findRule(name) {
  const rule = theme.tokenColors.find((r) => r.name === name);
  if (!rule) throw new Error(`No tokenColors rule named "${name}"`);
  return rule.settings;
}

// Every string under `node` that is a colour, with the path it sits at.
function collectColours(node, path = "", out = []) {
  if (typeof node === "string") {
    if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(node)) out.push([path, node]);
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node))
      collectColours(v, path ? `${path}.${k}` : k, out);
  }
  return out;
}

/* ── Shape ───────────────────────────────────────────────────────── */

test("buildTheme returns a complete dark theme", () => {
  assert.equal(theme.name, "Sepp’s Workshop");
  assert.equal(theme.type, "dark");
  assert.equal(theme.semanticHighlighting, true);
  assert.ok(Object.keys(colors).length > 300, "workbench colours");
  assert.ok(theme.tokenColors.length > 40, "tokenColors");
  assert.ok(theme.semanticTokenColors.function, "semanticTokenColors");
});

test("buildTheme is deterministic", () => {
  assert.equal(
    JSON.stringify(buildTheme(tokens)),
    JSON.stringify(buildTheme(tokens)),
  );
});

/* ── The port decides nothing about colour ───────────────────────── */

test("every colour in the theme is a value the foundation publishes", () => {
  const published = new Set(collectColours(tokens).map(([, c]) => c));
  for (const [path, colour] of collectColours(theme))
    assert.ok(published.has(colour), `${path} is ${colour}: not a token`);
});

test("no theme value is missing", () => {
  for (const [key, value] of Object.entries(colors))
    assert.match(String(value), /^#[0-9a-f]{6}([0-9a-f]{2})?$/, key);
  for (const rule of theme.tokenColors)
    assert.ok(
      rule.settings.foreground || rule.settings.fontStyle,
      `rule "${rule.name}" sets nothing`,
    );
});

test("the template sources contain no colour literal", () => {
  for (const file of ["theme-template.mjs", "workbench-colors.mjs"]) {
    const src = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.ok(!src.includes("#"), `${file} contains a "#"`);
  }
});

/* ── Syntax ──────────────────────────────────────────────────────── */

test("no tokenColors rule ends in a meta scope", () => {
  for (const rule of theme.tokenColors)
    for (const scope of rule.scope)
      assert.ok(
        !scope.trim().split(/\s+/).pop().startsWith("meta."),
        `rule "${rule.name}" targets "${scope}"`,
      );
});

test("every scope_recommendations slot becomes a rule", () => {
  for (const slot of Object.keys(tokens.scope_recommendations))
    assert.deepEqual(
      theme.tokenColors.find((r) => r.name === slot)?.scope,
      tokens.scope_recommendations[slot],
      slot,
    );
});

test("core slots keep their own font style", () => {
  for (const slot of ["comment", "parameter", "attr"]) {
    assert.equal(findRule(slot).foreground, syntax[slot], slot);
    assert.equal(findRule(slot).fontStyle, "italic", slot);
  }
  assert.equal(findRule("keyword").fontStyle, undefined);
  assert.equal(findRule("type").fontStyle, undefined);
});

test("extended slots resolve text and semantic targets", () => {
  assert.equal(findRule("operator").foreground, text.fg_muted);
  assert.equal(findRule("variable").foreground, text.fg);
  assert.deepEqual(findRule("lang_var"), {
    foreground: syntax.keyword,
    fontStyle: "italic",
  });
  assert.deepEqual(findRule("invalid"), {
    foreground: semantic.danger,
    fontStyle: "italic underline",
  });
  assert.deepEqual(findRule("invalid_deprecated"), {
    foreground: text.fg,
    fontStyle: "italic underline",
  });
  assert.deepEqual(findRule("heading"), {
    foreground: syntax.keyword,
    fontStyle: "bold",
  });
});

test("emphasis and strong set a font style and no colour", () => {
  assert.deepEqual(findRule("emphasis"), { fontStyle: "italic" });
  assert.deepEqual(findRule("strong"), { fontStyle: "bold" });
  assert.deepEqual(findRule("Markdown bold+italic"), {
    fontStyle: "bold italic",
  });
});

test("JS and TS const declarations fall through to fg", () => {
  assert.deepEqual(findRule("fg_fallthrough_jsts"), { foreground: text.fg });
});

test("hand-written rules take their colour from foundation roles", () => {
  assert.equal(findRule("Escape sequence").foreground, syntax.constant);
  assert.equal(findRule("Shell variable").foreground, syntax.type);
  assert.equal(findRule("YAML key").foreground, text.fg);
  assert.equal(findRule("Markdown link text").foreground, syntax.function);
  assert.equal(findRule("Diff inserted").foreground, semantic.success);
  assert.equal(findRule("Diff deleted").foreground, semantic.danger);
  assert.equal(findRule("Diff changed").foreground, semantic.info);
  assert.deepEqual(findRule("Python docstring"), {
    foreground: syntax.comment,
    fontStyle: "italic",
  });
});

test("the YAML key rule comes after the tag rule it overrides", () => {
  const names = theme.tokenColors.map((r) => r.name);
  assert.ok(names.indexOf("YAML key") > names.indexOf("tag"));
});

test("an unknown colour target stops the build by name", () => {
  const broken = structuredClone(tokens);
  broken.syntax_tokens.extended.operator = "fg_mutde";
  assert.throws(() => buildTheme(broken), /Unknown colour target: fg_mutde/);
});

/* ── Semantic tokens ─────────────────────────────────────────────── */

test("semantic token types carry colour and an explicit font style", () => {
  const sem = theme.semanticTokenColors;
  assert.deepEqual(sem.parameter, {
    fontStyle: "italic",
    foreground: syntax.parameter,
  });
  assert.deepEqual(sem.class, { fontStyle: "", foreground: syntax.type });
  assert.deepEqual(sem.typeParameter, {
    fontStyle: "",
    foreground: syntax.parameter,
  });
  assert.equal(sem.operator.foreground, text.fg_muted);
  assert.equal(sem.variable.foreground, text.fg);
  for (const type of Object.keys(tokens.semantic_token_recommendations.types))
    assert.ok(sem[type].foreground, `${type} has no colour`);
});

test("semantic token modifiers follow the foundation, none is skipped", () => {
  const sem = theme.semanticTokenColors;
  assert.deepEqual(sem["*.readonly"], { foreground: syntax.constant });
  assert.deepEqual(sem["*.deprecated"], { fontStyle: "italic underline" });
  assert.deepEqual(sem["*.defaultLibrary"], { fontStyle: "italic" });
  for (const [modifier, role] of Object.entries(
    tokens.semantic_token_recommendations.modifiers,
  ))
    assert.equal(`*.${modifier}` in sem, role !== "none", modifier);
});

test("code stays readable on stacked diff spans, merge regions and the stack frame", () => {
  const codeColours = [
    ...new Set(
      theme.tokenColors.map((r) => r.settings.foreground).filter(Boolean),
    ),
    colors["editor.foreground"],
  ];
  const canvas = colors["editor.background"];
  const backgrounds = {
    "inserted span on inserted line": on(
      colors["diffEditor.insertedTextBackground"],
      on(colors["diffEditor.insertedLineBackground"], canvas),
    ),
    "removed span on removed line": on(
      colors["diffEditor.removedTextBackground"],
      on(colors["diffEditor.removedLineBackground"], canvas),
    ),
    "merge current": on(colors["merge.currentContentBackground"], canvas),
    "merge incoming": on(colors["merge.incomingContentBackground"], canvas),
    "merge common": on(colors["merge.commonContentBackground"], canvas),
    "stack frame": on(colors["editor.stackFrameHighlightBackground"], canvas),
    "selected notebook cell": on(
      colors["notebook.selectedCellBackground"],
      canvas,
    ),
    "bracket match": on(colors["editorBracketMatch.background"], canvas),
  };
  for (const [name, bg] of Object.entries(backgrounds))
    for (const fg of codeColours)
      assertContrast(`code on ${name}`, fg, bg, 4.5);
  // Line numbers sit on the diff gutter.
  for (const key of [
    "diffEditorGutter.insertedLineBackground",
    "diffEditorGutter.removedLineBackground",
  ])
    assertContrast(
      `line numbers on ${key}`,
      colors["editorLineNumber.foreground"],
      on(colors[key], canvas),
      4.5,
    );
});
```

- [ ] **Step 2: Run the tests and see them fail**

Run: `node --test src/theme-template.test.mjs`
Expected: the file fails to load with `Cannot find module` for `./theme-template.mjs`.

- [ ] **Step 3: Write `src/theme-template.mjs`**

```js
// Maps Sepp’s Workshop foundation tokens to a VS Code color theme.
// One pure function: tokens -> theme JSON object. No colour is written
// in this port: every value is read from the tokens.

import { resolveTarget } from "@sepps-workshop/design-system/tools/build-tokens";
import { buildWorkbenchColors } from "./workbench-colors.mjs";

// A role as the foundation writes it — "keyword", { color, style } or
// { style } — to tokenColors settings. `baseStyle` is a core slot's own style.
function settings(tokens, role, baseStyle = []) {
  const { color, style = [] } =
    typeof role === "string" ? { color: role } : role;
  const out = {};
  if (color) out.foreground = resolveTarget(tokens, color);
  const styles = [...baseStyle, ...style];
  if (styles.length) out.fontStyle = styles.join(" ");
  return out;
}

// One rule per slot in scope_recommendations, named after the slot.
function buildGeneratedTokenRules(tokens) {
  const { core, core_style, extended } = tokens.syntax_tokens;
  return Object.entries(tokens.scope_recommendations).map(([slot, scope]) => {
    if (slot === "fg_fallthrough_jsts")
      return { name: slot, scope, settings: settings(tokens, "fg") };
    if (core.includes(slot))
      return {
        name: slot,
        scope,
        settings: settings(tokens, slot, core_style[slot]),
      };
    return { name: slot, scope, settings: settings(tokens, extended[slot]) };
  });
}

function buildTokenColors(tokens) {
  const { extended } = tokens.syntax_tokens;
  const { git } = tokens.workbench_color_roles;
  const rule = (name, scope, role) => ({
    name,
    scope,
    settings: settings(tokens, role),
  });
  return [
    ...buildGeneratedTokenRules(tokens),
    rule(
      "Template expression delimiter",
      [
        "punctuation.definition.template-expression",
        "punctuation.section.embedded",
      ],
      "keyword",
    ),
    rule(
      "Escape sequence",
      ["constant.character.escape"],
      tokens.shell_roles.escape.color,
    ),
    rule(
      "Shell variable",
      ["source.shell variable.other", "variable.other.normal.shell"],
      tokens.shell_roles.variable.color,
    ),
    // Without this the tag rule paints YAML keys while JSON keys stay fg.
    rule("YAML key", ["entity.name.tag.yaml"], extended.property),
    rule("YAML alias", ["variable.other.alias.yaml"], {
      color: "string",
      style: ["italic", "underline"],
    }),
    rule("Python docstring", ["string.quoted.docstring.multi"], {
      color: "comment",
      style: ["italic"],
    }),
    rule(
      "CSS at-rule",
      ["keyword.control.at-rule", "punctuation.definition.keyword"],
      "keyword",
    ),
    rule(
      "Markdown bold+italic",
      [
        "markup.bold.markdown markup.italic.markdown",
        "markup.italic.markdown markup.bold.markdown",
      ],
      { style: ["bold", "italic"] },
    ),
    rule(
      "Markdown link text",
      [
        "string.other.link.description.markdown",
        "string.other.link.title.markdown",
      ],
      extended.link,
    ),
    rule(
      "Markdown inline/fenced code",
      ["markup.inline.raw", "markup.fenced_code.block", "markup.raw.block"],
      "string",
    ),
    rule(
      "Markdown quote",
      ["markup.quote", "punctuation.definition.quote.begin"],
      { color: "fg_muted", style: ["italic"] },
    ),
    rule(
      "Markdown list bullet",
      [
        "beginning.punctuation.definition.list.markdown",
        "punctuation.definition.list_item",
      ],
      "keyword",
    ),
    rule("Diff inserted", ["markup.inserted"], git.added),
    rule("Diff deleted", ["markup.deleted"], git.deleted),
    rule("Diff changed", ["markup.changed"], git.modified),
    rule("Diff hunk range", ["punctuation.definition.range.diff"], "function"),
  ];
}

function buildSemanticTokenColors(tokens) {
  const { types, modifiers } = tokens.semantic_token_recommendations;
  const out = {};
  // fontStyle "" stops an italic TextMate rule underneath leaking through.
  for (const [type, role] of Object.entries(types))
    out[type] = { fontStyle: "", ...settings(tokens, role) };
  for (const [modifier, role] of Object.entries(modifiers))
    if (role !== "none") out[`*.${modifier}`] = settings(tokens, role);
  return out;
}

export function buildTheme(tokens) {
  return {
    $schema: "vscode://schemas/color-theme",
    name: "Sepp’s Workshop",
    type: "dark",
    semanticHighlighting: true,
    colors: buildWorkbenchColors(tokens),
    tokenColors: buildTokenColors(tokens),
    semanticTokenColors: buildSemanticTokenColors(tokens),
  };
}
```

- [ ] **Step 4: Run the tests and see them pass**

Run: `node --test src/workbench-colors.test.mjs src/theme-template.test.mjs`
Expected: 30 tests, 30 pass.

- [ ] **Step 5: Commit**

```bash
git add src/theme-template.mjs src/theme-template.test.mjs
git commit -m "✨ feat(theme): generate syntax rules and semantic token colours

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Build output, icon and manifest checks

**Files:**

- Create: `build.mjs`
- Create (generated): `themes/sepps-workshop-color-theme.json`, `icon.png`
- Test: `src/manifest.test.mjs`

**Interfaces:**

- Consumes: `buildTheme(tokens)` from Task 3; the manifest from Task 1.
- Produces: `npm run build` writes the theme file as `JSON.stringify(theme, null, 2) + "\n"` and copies the foundation's `assets/icon-256.png` to `icon.png`.

- [ ] **Step 1: Write the failing tests**

`src/manifest.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tokens from "@sepps-workshop/design-system";
import { buildTheme } from "./theme-template.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url));
const manifest = JSON.parse(read("package.json"));
const [entry] = manifest.contributes.themes;

test("the manifest contributes exactly one dark theme", () => {
  assert.equal(manifest.contributes.themes.length, 1);
  assert.equal(entry.uiTheme, "vs-dark");
  assert.equal(entry.label, buildTheme(tokens).name);
});

test("the committed theme file is what the build produces", () => {
  assert.equal(
    read(entry.path).toString("utf8"),
    JSON.stringify(buildTheme(tokens), null, 2) + "\n",
    "themes/ is stale: run `npm run build`",
  );
});

test("the gallery banner is the canvas colour", () => {
  assert.equal(manifest.galleryBanner.color, tokens.surface.bg);
  assert.equal(manifest.galleryBanner.theme, "dark");
});

test("the icon is the foundation's 256 px render", () => {
  const source = readFileSync(
    fileURLToPath(
      import.meta.resolve("@sepps-workshop/design-system/assets/icon-256.png"),
    ),
  );
  assert.ok(read(manifest.icon).equals(source), "icon.png is stale");
});
```

- [ ] **Step 2: Run the tests and see them fail**

Run: `node --test src/manifest.test.mjs`
Expected: the theme-file and icon tests fail with `ENOENT`; the other two pass.

- [ ] **Step 3: Write `build.mjs`**

```js
// Reads foundation tokens from @sepps-workshop/design-system, emits the
// VS Code color-theme JSON and copies the icon from the foundation.

import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import tokens from "@sepps-workshop/design-system";

import { buildTheme } from "./src/theme-template.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const THEME = join(ROOT, "themes", "sepps-workshop-color-theme.json");

mkdirSync(dirname(THEME), { recursive: true });
writeFileSync(
  THEME,
  JSON.stringify(buildTheme(tokens), null, 2) + "\n",
  "utf8",
);

// The icon is the foundation's render; copying it here keeps it from drifting.
copyFileSync(
  fileURLToPath(
    import.meta.resolve("@sepps-workshop/design-system/assets/icon-256.png"),
  ),
  join(ROOT, "icon.png"),
);

console.log("Built themes/sepps-workshop-color-theme.json and icon.png");
```

- [ ] **Step 4: Build and run everything**

```bash
npm run build
npm test
npx prettier --check .
```

Expected: `Built themes/sepps-workshop-color-theme.json and icon.png`; 34 tests, 34 pass; Prettier reports all files formatted. If Prettier complains about a file under `src/`, run `npm run format` and rerun the tests.

- [ ] **Step 5: Check the staleness guard works**

```bash
printf '\n' >> themes/sepps-workshop-color-theme.json
node --test src/manifest.test.mjs 2>&1 | grep -c "themes/ is stale"
npm run build
node --test src/manifest.test.mjs 2>&1 | grep -E "ℹ (pass|fail)"
```

Expected: a count of at least 1 from the first test run, then `pass 4` and `fail 0` after the rebuild.

- [ ] **Step 6: Commit**

```bash
git add build.mjs src/manifest.test.mjs themes icon.png
git commit -m "✨ feat(build): emit the theme file and copy the icon from the foundation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: README, changelog, project instructions

**Files:**

- Create: `README.md`, `CHANGELOG.md`, `CLAUDE.md`

**Interfaces:**

- Consumes: the list of keys left at defaults, which the Task 2 test `keys with no role in the foundation are left at VS Code defaults` pins.

- [ ] **Step 1: Write `README.md`**

````markdown
# Sepp’s Workshop for VS Code

One colour theme for VS Code (Visual Studio Code): medium-dark, on sepp.med Darkblue, with Sunset yellow as the accent. Every text pair passes WCAG AA, and the build of the [Sepp’s Workshop design system](https://github.com/sepps-workshop/sepps-workshop-design-system) refuses to ship a colour that does not.

There are no variants. This is the one theme.

<p align="center">
  <img src="./images/screenshot.png" width="760" alt="A TypeScript file in the Sepp’s Workshop theme" />
</p>

## Install

From the VS Code Marketplace: search for **Sepp’s Workshop Theme**, install it, then pick **Sepp’s Workshop** from `Preferences: Color Theme` (`Ctrl+K Ctrl+T`).

## Recommended font

Themes cannot ship fonts. The design system recommends [JetBrains Mono](https://www.jetbrains.com/lp/mono/) for the editor, and [JetBrainsMono Nerd Font](https://www.nerdfonts.com/font-downloads) for the integrated terminal if your prompt shows icons.

```jsonc
"editor.fontFamily": "\"JetBrains Mono\", \"Cascadia Code\", Consolas, monospace",
"terminal.integrated.fontFamily": "\"JetBrainsMono Nerd Font\", \"JetBrains Mono\", monospace"
```

## How it is built

The theme file is generated. Colours, contrast ratios and the map from syntax role to colour all come from the design system; this repository only decides which token feeds which VS Code setting. It contains no colour value of its own, and a test fails if one appears.

A few things follow from the palette and are deliberate:

- Three hues carry the syntax (yellow, orange, cyan-blue), each at two lightness steps, with italics as a third axis. The brand has no more hues that stay apart on Darkblue.
- Selection and the current line darken the canvas. A lighter selection would cost contrast.
- Red and green are signals only: errors, additions, removals. Neither colours any syntax.
- The status bar stays neutral. The yellow strip along its top edge means a folder is open; while debugging, the bar turns red.

### Left at VS Code defaults

The design system has no role for these settings, so the theme does not set them:

- `editorOverviewRuler.findMatchForeground`, `.rangeHighlightForeground`, `.selectionHighlightForeground`, `.wordHighlightForeground`
- `tab.activeBorder`, `menu.selectionBorder`, `menubar.selectionBorder`
- `editorUnnecessaryCode.opacity`
- `charts.purple` (the brand has no purple)
- `statusBarItem.prominentHoverBackground`

## Contributing

```bash
npm install
npm run build   # regenerates themes/ and icon.png from @sepps-workshop/design-system
npm test
```

To preview locally, press `F5` in VS Code. That opens an Extension Development Host; pick the theme there.

If a colour looks wrong, or two things are hard to tell apart, the cause is almost always in the design system and not in this port. Please open the issue [there](https://github.com/sepps-workshop/sepps-workshop-design-system/issues). A mapping mistake (the right colour on the wrong setting) belongs here.

## License

MIT. See [LICENSE](./LICENSE).

## Want to join Sepp’s Workshop?

sepp.med builds and tests software for places where a bug is more than an inconvenience: medical devices, cars, aircraft. If you would rather get the contrast ratio right than argue about it, you might like it here.

Have a look at the [open positions](https://www.seppmed.com/career/), or just say hello.
````

The README references `images/screenshot.png`, which does not exist yet. It needs a running VS Code and is added by the user. Do not create a placeholder image.

- [ ] **Step 2: Write `CHANGELOG.md`**

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- The Sepp’s Workshop colour theme, generated from `@sepps-workshop/design-system` 0.2.1: workbench colours, TextMate rules and semantic token colours.
```

- [ ] **Step 3: Write `CLAUDE.md`**

```markdown
# sepps-workshop-vs-code

VS Code colour-theme port of the [Sepp’s Workshop design system](https://github.com/sepps-workshop/sepps-workshop-design-system). Node.js + ESM. Reads tokens from `@sepps-workshop/design-system`; emits one theme to `themes/`. One theme, no variants.

## Key Config Files

| File                                                         | Purpose                                                                                 |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `build.mjs`                                                  | Reads foundation tokens, emits the theme JSON to `themes/` and copies `icon.png`        |
| `.claudeignore`                                              | Paths Claude Code should skip when indexing (`node_modules/`, `themes/`, `*.vsix`)      |
| `.claude/settings.json`                                      | Permissions, secret-file guard, PostToolUse Prettier hook, env defaults                 |
| `.claude/skills/release/SKILL.md`                            | `/release` skill: version bump → CHANGELOG → tag → push                                 |
| `.claude/skills/sepps-workshop/SKILL.md`                     | Port-side skill: how to read foundation tokens; copied from the foundation's `handoff/` |
| `.githooks/pre-commit`                                       | Runs sync-config-table.sh and gitleaks on every commit                                  |
| `.github/workflows/claude-code-review.yml`                   | Auto-reviews PRs with Claude on open/synchronize                                        |
| `.github/workflows/claude.yml`                               | Responds to `@claude` mentions in issues, PRs, and review comments                      |
| `.github/workflows/publish-to-visual-studio-marketplace.yml` | Publishes to VS Code Marketplace on `v*` tag push                                       |
| `.gitignore`                                                 | Git ignore patterns                                                                     |
| `package.json`                                               | VS Code extension manifest with one `contributes.themes` entry                          |
| `.prettierignore`                                            | Paths Prettier must skip — generated `themes/`, `icon.png`                              |
| `scripts/sync-config-table.sh`                               | Keeps this table in sync with the filesystem (called by pre-commit)                     |
| `.vscodeignore`                                              | Paths `vsce package` should not bundle into the `.vsix`                                 |

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
- **Content surfaces vs. chrome surfaces.** `surface.bg` for panes the user reads or edits (editor, active tab, peek editor, notebook); `surface.bg_sunk` for panes that frame them (sidebar, activity bar, status bar, title bar, tab strip, panel).
- **`bg_soft` and `overlay.selected_item` carry `fg` and `fg_muted` only.** Rows or controls that show git, diagnostic or syntax colours take a darkening overlay (`hover`, `active`).
- **The status bar stays on `bg_sunk`.** The accent is its top border. Debugging and error items use the danger fill with its white text; warning items use the warning fill.
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
```

- [ ] **Step 4: Check the README's defaults list against the test**

```bash
for key in editorOverviewRuler.findMatchForeground tab.activeBorder menu.selectionBorder menubar.selectionBorder editorUnnecessaryCode.opacity charts.purple statusBarItem.prominentHoverBackground; do
  grep -q "\"$key\"" themes/sepps-workshop-color-theme.json && echo "SET: $key"
  grep -q "$key" README.md || echo "NOT IN README: $key"
done; echo checked
```

Expected: only `checked`.

- [ ] **Step 5: Format and commit**

```bash
npx prettier --write README.md CHANGELOG.md CLAUDE.md
git add README.md CHANGELOG.md CLAUDE.md
git commit -m "📝 docs: add README, changelog and project instructions

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Scaffolding parity and packaging

**Files:**

- Create: `.claude/settings.json`, `.claude/skills/sepps-workshop/SKILL.md`, `.claude/skills/release/SKILL.md`
- Create: `.githooks/pre-commit`, `scripts/sync-config-table.sh`
- Create: `.github/workflows/claude.yml`, `.github/workflows/claude-code-review.yml`, `.github/workflows/publish-to-visual-studio-marketplace.yml`

**Interfaces:**

- Consumes: the "Key Config Files" table in `CLAUDE.md` from Task 5, which `scripts/sync-config-table.sh` rewrites.

- [ ] **Step 1: Copy the files that need no change**

```bash
VL=/home/vanlaarmi12/Git-Repos/vivid-life-theme/vivid-life-vs-code
mkdir -p .claude/skills/sepps-workshop .claude/skills/release .githooks scripts .github/workflows
cp "$VL/.claude/settings.json" .claude/settings.json
cp "$VL/.githooks/pre-commit" .githooks/pre-commit
cp "$VL/scripts/sync-config-table.sh" scripts/sync-config-table.sh
cp "$VL/.github/workflows/claude.yml" "$VL/.github/workflows/claude-code-review.yml" "$VL/.github/workflows/publish-to-visual-studio-marketplace.yml" .github/workflows/
cp node_modules/@sepps-workshop/design-system/handoff/SKILL.md .claude/skills/sepps-workshop/SKILL.md
chmod +x .githooks/pre-commit scripts/sync-config-table.sh
```

Read each copied file once before going on. They are generic; if one names Vivid Life, fix it and note it in the final report.

- [ ] **Step 2: Add `npm test` to the allowed commands and to the publish workflow**

In `.claude/settings.json`, add `"Bash(npm test:*)"` to `permissions.allow`, after `"Bash(npm run build:*)"`.

In `.github/workflows/publish-to-visual-studio-marketplace.yml`, add a step between `npm ci` and `npm install -g npm@latest`, so a stale or broken theme cannot be published:

```yaml
- run: npm test
```

- [ ] **Step 3: Adapt the release skill**

```bash
VL=/home/vanlaarmi12/Git-Repos/vivid-life-theme/vivid-life-vs-code
sed -e 's/vivid-life-vs-code/sepps-workshop-vs-code/g' \
    -e 's#github.com/vivid-life-theme/#github.com/sepps-workshop/#g' \
    -e 's/itemName=vivid-life-theme\.vivid-life-theme/itemName=sepps-workshop.sepps-workshop-theme/' \
    -e 's/Claude Sonnet 4\.6/Claude Opus 5.5/' \
    -e 's/new themes, new variants, new features/new workbench or syntax coverage, a foundation minor bump/' \
    "$VL/.claude/skills/release/SKILL.md" > .claude/skills/release/SKILL.md
grep -n -i "vivid" .claude/skills/release/SKILL.md; echo "grep exit: $?"
```

Expected: no matching lines and `grep exit: 1`.

Then, in the skill's Pre-flight list, add after the build check:

```markdown
- Verify tests pass: `npm test` must exit without error
```

- [ ] **Step 4: Enable the hook and run the table sync**

```bash
git config core.hooksPath .githooks
bash -n scripts/sync-config-table.sh && bash scripts/sync-config-table.sh
grep -n "TODO: add description" CLAUDE.md; echo "grep exit: $?"
git diff --stat CLAUDE.md
```

Expected: `sync-config-table: updated CLAUDE.md` (the script sorts the rows its own way and stages the file), then `grep exit: 1`. A second run prints `no changes`. If the script added a row with `TODO: add description`, write the description by hand.

- [ ] **Step 5: Check what the package would contain**

```bash
npx vsce ls
```

Expected: exactly these entries, in any order: `package.json`, `README.md`, `CHANGELOG.md`, `LICENSE`, `icon.png`, `themes/sepps-workshop-color-theme.json`. `vsce` may warn about the missing `images/screenshot.png`; that is expected until the user adds it. If anything from `src/`, `docs/`, `scripts/`, `.claude/` or `.githooks/` is listed, fix `.vscodeignore`.

- [ ] **Step 6: Run everything and commit**

```bash
npm test
npx prettier --check .
git add .claude .githooks scripts .github CLAUDE.md
git commit -m "🔧 chore: add Claude Code config, skills, hooks and workflows

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Expected: 34 tests pass, Prettier clean, and the pre-commit hook runs without error. If `gitleaks` is not installed the hook skips the scan.

---

### Task 7: Final verification and report

**Files:** none changed.

- [ ] **Step 1: Verify from a clean state**

```bash
git status --short
npm run build && git status --short
npm test
```

Expected: both status outputs empty (the build is deterministic and the committed output is current); 34 tests pass.

- [ ] **Step 2: Report**

Report to the user:

- the commits on `feat/initial-port`;
- anything that differed from this plan and why;
- the three things only a person can do: add `images/screenshot.png`, walk the manual checklist in the spec from the Extension Development Host (`F5`), and create the Marketplace publisher and `VSCE_PAT` secret before the first release;
- the question the foundation's skill requires: did the theme use the foundation correctly? Log any correction to `.claude/learnings.md`.

Also tell the user that `main` does not exist yet: the repository had no commits, so everything is on `feat/initial-port`. They can create `main` from it (`git branch main feat/initial-port`) or push the branch as `main`.

Then stop. Creating `main`, pushing, tagging and publishing are the user's decisions.
