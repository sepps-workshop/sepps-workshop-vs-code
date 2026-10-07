import { test } from "node:test";
import assert from "node:assert/strict";
import tokens from "@sepps-workshop/design-system";
import { buildWorkbenchColors } from "./workbench-colors.mjs";
import { on, assertContrast } from "./test-helpers.mjs";

const colors = buildWorkbenchColors(tokens);
const { text, surface, syntax, semantic } = tokens;

/* ── Workbench: surfaces and state ───────────────────────────────── */

test("content and terminal sit on the canvas, chrome on Darkblue", () => {
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
    assert.equal(colors[key], surface.bg_chrome, key);
  assert.notEqual(colors["panel.background"], colors["editor.background"]);
  assert.equal(colors["terminal.background"], surface.bg);
  assert.notEqual(colors["terminal.background"], colors["panel.background"]);
  assert.equal(
    colors["terminalCursor.background"],
    colors["terminal.background"],
  );
});

test("the status bar is neutral; the accent is its border", () => {
  assert.equal(colors["statusBar.background"], surface.bg_chrome);
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
  ]) {
    const bg = on(colors[wash], colors[base]);
    for (const key of texts)
      assertContrast(`${key} on ${wash} over ${base}`, colors[key], bg, 4.5);
  }
  // The request is itself a wash, so the slash command stacks on it.
  for (const base of ["sideBar.background", "editor.background"])
    assertContrast(
      `chat.slashCommandForeground on a request over ${base}`,
      colors["chat.slashCommandForeground"],
      on(
        colors["chat.slashCommandBackground"],
        on(colors["chat.requestBackground"], colors[base]),
      ),
      4.5,
    );
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

/* ── Final-review fixes ──────────────────────────────────────────── */

test("chat requests and welcome tiles keep links and descriptions readable", () => {
  for (const base of ["sideBar.background", "editor.background"])
    for (const wash of [
      "chat.requestBackground",
      "chat.requestBubbleBackground",
    ])
      for (const key of ["textLink.foreground", "textPreformat.foreground"])
        assertContrast(
          `${key} on ${wash} over ${base}`,
          colors[key],
          on(colors[wash], colors[base]),
          4.5,
        );
  assertContrast(
    "descriptionForeground on a hovered welcome tile",
    colors.descriptionForeground,
    on(
      colors["welcomePage.tileHoverBackground"],
      colors["welcomePage.tileBackground"],
    ),
    4.5,
  );
});

test("a token the foundation no longer has stops the build by key", () => {
  const broken = structuredClone(tokens);
  delete broken.text.fg_subtle;
  assert.throws(
    () => buildWorkbenchColors(broken),
    /No token value for descriptionForeground/,
  );
});
