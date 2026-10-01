// Maps Sepp's Workshop foundation tokens to a VS Code color theme.
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
