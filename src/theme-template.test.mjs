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

// Every token path a colour is published under.
const publishedAt = new Map();
for (const [path, colour] of collectColours(tokens))
  publishedAt.set(colour, [...(publishedAt.get(colour) ?? []), path]);

test("text takes a text, syntax, semantic or fill-text role", () => {
  // Lines VS Code calls "foreground"; they take a border.
  const lines = ["editorRuler.foreground", "textSeparator.foreground"];
  const textRole =
    /^(text|syntax|semantic|ansi)\.|^accent(_on)?$|^semantic_fill\.\w+\.text$/;
  const foregrounds = [
    ...Object.entries(colors).filter(
      ([key]) => /foreground\d*$/i.test(key) && !lines.includes(key),
    ),
    ...theme.tokenColors.map((r) => [
      `rule "${r.name}"`,
      r.settings.foreground,
    ]),
    ...Object.entries(theme.semanticTokenColors).map(([type, s]) => [
      `semantic ${type}`,
      s.foreground,
    ]),
  ].filter(([, colour]) => colour);
  for (const [where, colour] of foregrounds)
    assert.ok(
      (publishedAt.get(colour) ?? []).some((path) => textRole.test(path)),
      `${where} is ${colour}, published only as ${publishedAt.get(colour)}`,
    );
});

test("a wash is never replaced by its composited value", () => {
  // `hex` and `hex_terminal` are for ports that cannot blend. VS Code can.
  const flat = new Set(
    Object.values(tokens.overlay).flatMap((o) => [o.hex, o.hex_terminal]),
  );
  for (const [path, colour] of collectColours(tokens))
    if (!path.startsWith("overlay.")) flat.delete(colour);
  for (const [path, colour] of collectColours(theme))
    assert.ok(!flat.has(colour), `${path} is the composited ${colour}`);
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
  // Captures of a few characters that a grammar names meta.* all the same.
  const captures = ["meta.toc-list.line-number.diff"];
  for (const rule of theme.tokenColors)
    for (const scope of rule.scope) {
      const last = scope.trim().split(/\s+/).pop();
      assert.ok(
        !last.startsWith("meta.") || captures.includes(last),
        `rule "${rule.name}" targets "${scope}"`,
      );
    }
});

test("no hand-written rule repeats a generated scope", () => {
  const generated = new Set(Object.values(tokens.scope_recommendations).flat());
  const slots = Object.keys(tokens.scope_recommendations);
  for (const rule of theme.tokenColors)
    if (!slots.includes(rule.name))
      for (const scope of rule.scope)
        assert.ok(
          !generated.has(scope),
          `rule "${rule.name}" repeats ${scope}`,
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

test("emphasis and strong carry their foundation colour and a font style", () => {
  assert.deepEqual(findRule("emphasis"), {
    foreground: syntax.type,
    fontStyle: "italic",
  });
  assert.deepEqual(findRule("strong"), {
    foreground: syntax.constant,
    fontStyle: "bold",
  });
  assert.deepEqual(findRule("Markdown bold+italic"), {
    fontStyle: "bold italic",
  });
});

test("an extended slot without a style is upright inside italic rules", () => {
  // doc_keyword sits in a comment, selector on an attribute name.
  for (const slot of ["doc_keyword", "selector", "shebang", "operator"])
    assert.equal(findRule(slot).fontStyle, "", slot);
  assert.equal(findRule("doc_type").fontStyle, "italic");
  assert.equal(findRule("lang_var").fontStyle, "italic");
});

test("JS and TS const declarations fall through to fg", () => {
  assert.deepEqual(findRule("fg_fallthrough_jsts"), { foreground: text.fg });
});

test("primitive types take the type colour, not the keyword colour", () => {
  const rule = theme.tokenColors.find((r) => r.name === "primitive_type");
  assert.ok(rule.scope.includes("keyword.type"), "C# int, bool");
  assert.ok(rule.scope.includes("storage.type.built-in"), "C, C++ int, bool");
  assert.equal(findRule("primitive_type").foreground, syntax.type);
  assert.notEqual(syntax.type, syntax.keyword);
});

test("format placeholders share the escape sequence rule", () => {
  const rule = theme.tokenColors.find((r) => r.name === "Escape sequence");
  assert.ok(rule.scope.includes("constant.character.format.placeholder"));
});

test("hand-written rules take their colour from foundation roles", () => {
  assert.equal(findRule("Escape sequence").foreground, syntax.constant);
  assert.equal(findRule("Shell variable").foreground, syntax.type);
  assert.equal(findRule("At-rule marker").foreground, syntax.keyword);
  assert.equal(findRule("Diff hunk range").foreground, syntax.function);
  assert.equal(findRule("Diff inserted").foreground, semantic.success);
  assert.equal(findRule("Diff deleted").foreground, semantic.danger);
  assert.equal(findRule("Diff changed").foreground, semantic.info);
  assert.deepEqual(findRule("Python docstring"), {
    foreground: syntax.comment,
    fontStyle: "italic",
  });
});

test("YAML and JSON keys share the key slot", () => {
  for (const scope of [
    "entity.name.tag.yaml",
    "support.type.property-name.json",
  ])
    assert.ok(
      theme.tokenColors.find((r) => r.name === "key").scope.includes(scope),
      scope,
    );
  assert.equal(findRule("key").foreground, syntax.function);
  assert.equal(findRule("code").foreground, syntax.parameter);
  assert.equal(findRule("link").foreground, syntax.function);
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

/* ── Final-review fixes ──────────────────────────────────────────── */

test("the diff hunk range colours its numbers, not only the @@ markers", () => {
  assert.deepEqual(
    theme.tokenColors.find((r) => r.name === "Diff hunk range").scope,
    ["punctuation.definition.range.diff", "meta.toc-list.line-number.diff"],
  );
});

test("Markdown list bullets use the scope VS Code's grammar emits", () => {
  assert.ok(
    theme.tokenColors
      .find((r) => r.name === "Markdown list bullet")
      .scope.includes("punctuation.definition.list.begin.markdown"),
  );
});

test("fenced code blocks do not tint the embedded language", () => {
  for (const rule of theme.tokenColors)
    assert.ok(
      !rule.scope.includes("markup.fenced_code.block"),
      `rule "${rule.name}" colours whole fenced blocks`,
    );
});

test("string quotes and comment markers match what they delimit", () => {
  assert.deepEqual(findRule("String quotes"), { foreground: syntax.string });
  assert.deepEqual(findRule("Comment markers"), {
    foreground: syntax.comment,
    fontStyle: "italic",
  });
});

test("delimiters of strings that are not string-coloured follow their string", () => {
  // The deeper selector outranks the bare "String quotes" rule.
  assert.ok(
    theme.tokenColors
      .find((r) => r.name === "Python docstring")
      .scope.includes(
        "string.quoted.docstring.multi punctuation.definition.string",
      ),
  );
  const regex = theme.tokenColors.find((r) => r.name === "Regex delimiters");
  assert.deepEqual(regex?.scope, [
    "string.regexp punctuation.definition.string",
  ]);
  assert.deepEqual(regex.settings, { foreground: syntax.regex });
});
