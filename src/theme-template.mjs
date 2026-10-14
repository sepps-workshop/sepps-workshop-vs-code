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
  const rules = Object.entries(tokens.scope_recommendations).map(
    ([slot, scope]) => {
      if (slot === "fg_fallthrough_jsts")
        return { name: slot, scope, settings: settings(tokens, "fg") };
      if (core.includes(slot))
        return {
          name: slot,
          scope,
          settings: settings(tokens, slot, core_style[slot]),
        };
      return { name: slot, scope, settings: settings(tokens, extended[slot]) };
    },
  );
  // A slot without a style whose own selector sits inside a styled slot
  // (doc_keyword in a comment, selector on an attribute name) would inherit
  // that style. fontStyle "" keeps it upright, as the foundation states.
  const styled = rules
    .filter((r) => r.settings.fontStyle)
    .flatMap((r) => r.scope)
    .filter((scope) => !scope.includes(" "));
  const inside = (selector) =>
    selector
      .split(/\s+/)
      .some((part) =>
        styled.some((scope) => part === scope || part.startsWith(`${scope}.`)),
      );
  for (const rule of rules)
    if (!rule.settings.fontStyle && rule.scope.some(inside))
      rule.settings.fontStyle = "";
  return rules;
}

function buildTokenColors(tokens) {
  const { core_style } = tokens.syntax_tokens;
  const { git } = tokens.workbench_color_roles;
  const rule = (name, scope, role) => ({
    name,
    scope,
    settings: settings(tokens, role),
  });
  return [
    ...buildGeneratedTokenRules(tokens),
    // The punct rule would dim quotes below their string and lift comment
    // markers above their comment.
    rule("String quotes", ["punctuation.definition.string"], "string"),
    rule("Comment markers", ["punctuation.definition.comment"], {
      color: "comment",
      style: core_style.comment,
    }),
    rule(
      "Regex delimiters",
      ["string.regexp punctuation.definition.string"],
      "regex",
    ),
    rule(
      "Template expression delimiter",
      [
        "punctuation.definition.template-expression",
        "punctuation.section.embedded",
      ],
      "keyword",
    ),
    // Format placeholders ({name} in a Python f-string) sit in the string
    // like an escape and take the same colour.
    rule(
      "Escape sequence",
      ["constant.character.escape", "constant.character.format.placeholder"],
      tokens.shell_roles.escape.color,
    ),
    rule(
      "Shell variable",
      ["source.shell variable.other", "variable.other.normal.shell"],
      tokens.shell_roles.variable.color,
    ),
    rule("YAML alias", ["variable.other.alias.yaml"], {
      color: "string",
      style: ["italic", "underline"],
    }),
    rule(
      "Python docstring",
      [
        "string.quoted.docstring.multi",
        "string.quoted.docstring.multi punctuation.definition.string",
      ],
      { color: "comment", style: ["italic"] },
    ),
    // The keyword slot covers the at-rule; its "@" would take punct.
    rule("At-rule marker", ["punctuation.definition.keyword"], "keyword"),
    rule(
      "Markdown bold+italic",
      [
        "markup.bold.markdown markup.italic.markdown",
        "markup.italic.markdown markup.bold.markdown",
      ],
      { style: ["bold", "italic"] },
    ),
    rule(
      "Markdown quote",
      ["markup.quote", "punctuation.definition.quote.begin"],
      { color: "fg_muted", style: ["italic"] },
    ),
    rule(
      "Markdown list bullet",
      [
        "punctuation.definition.list.begin.markdown",
        "beginning.punctuation.definition.list.markdown",
        "punctuation.definition.list_item",
      ],
      "keyword",
    ),
    rule("Diff inserted", ["markup.inserted"], git.added),
    rule("Diff deleted", ["markup.deleted"], git.deleted),
    rule("Diff changed", ["markup.changed"], git.modified),
    // The range numbers are a capture, not a region, despite the meta name.
    rule(
      "Diff hunk range",
      ["punctuation.definition.range.diff", "meta.toc-list.line-number.diff"],
      "function",
    ),
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
