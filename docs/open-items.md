# Open items

State after the initial port (2026-10-02, `main` at v0.1.0, pushed, not published). Delete an item when it is done.

## Before the first release

- [x] Check the theme in a running VS Code (Extension Development Host): press F5, or `npm run package` and install the `.vsix`. Look at:
  - text on selected rows (lists, quick input, suggest widget, menus)
  - chat requests, slash commands and hovered welcome tiles
  - diff, merge and stack-frame backgrounds behind code
  - whether every `chat.*` key the theme sets still exists in the current VS Code
- [ ] Create the Marketplace publisher `sepps-workshop` and add the `VSCE_PAT` repository secret.
- [ ] Decide on `CLAUDE_CODE_MAX_OUTPUT_TOKENS` (16000) in `.claude/settings.json`. It was copied from the Vivid Life port and made a review agent fail once.
- [ ] After the visual check: log anything the theme got wrong about the foundation in `.claude/learnings.md`.

## Upstream, in `sepps-workshop-design-system`

- [ ] `punct` scopes catch string quotes and comment markers. The port overrides this ("String quotes", "Comment markers", "Regex delimiters", docstring selector); fix the scope recommendation and drop the overrides.
- [ ] Gate ANSI colours on the find-match overlays, as on the terminal selection. ANSI blue measures 4.29:1 on `find_match`; on `find_match_other` it reaches 4.55:1 since foundation 0.3.0.
- [ ] Document that `bg_soft` carries `fg` and `fg_muted` only (`fg_subtle` is 4.06:1; link reaches 4.94:1 since foundation 0.3.0).

## Vivid Life

- [ ] File the issue for `vivid-life-design-system` (overlay recipes and a generated `#rrggbbaa` field, so its port can drop its alpha table). The draft is appended below.

## Deferred minors from the review

- [ ] Selector and `doc_keyword` inherit italic from enclosing rules.
- [ ] Python `self` is not covered by `lang_var`.
- [ ] The CSS at-rule and Markdown link text rules partly duplicate generated rules.
- [ ] Diff hunk range colours only the `@@` markers.
- [ ] The bracket-border test passes by coincidence of values.
- [ ] The translucency list in `CLAUDE.md` is incomplete.
- [ ] The publish workflow keeps `npm install -g npm@latest` although it only runs `vsce publish`, and it does not check the tag against the manifest version.
- [ ] The "every colour is published" test does not catch misuse (Racing Red as text, an opaque `.hex` where a wash belongs).
- [ ] A future overlay border read placed before its `wash()` would throw an anonymous TypeError.

---

## Draft issue for `vivid-life-design-system` (not filed)

**Title:** Move the remaining port-side alpha decisions into overlay recipes and publish `#rrggbbaa`

### Problem

The VS Code port (v0.3.0) reads its code-area overlays from the foundation recipes, but `src/theme-template.mjs` still decides about 43 translucent colours itself: it holds an `ALPHA` table (`a10` … `a90`) and calls `withAlpha(colour, ALPHA.x)` on `accent`, `text.fg_subtle` and the semantic colours. None of these values passes a foundation gate, and every other port would have to re-invent them.

Sepp’s Workshop had the same gap. Its foundation closed it in 0.2.0 and 0.2.1, and its VS Code port now contains no alpha value and no hex at all (a test fails on any `#` in the template sources).

### Proposal

1. **Add recipes for what the port decides today**, grouped as the port uses them:
   - `hover`, `active` (row and control hover/pressed states, including button hover, which is `accent` at `a90` today; Sepp’s Workshop uses an opaque `accent_hover` token instead)
   - `slider`, `slider_hover`, `slider_active` (scrollbar and minimap sliders)
   - `merge_current_content`, `merge_current_header`, `merge_incoming_content`, `merge_incoming_header`, `merge_common_content`, `merge_common_header`
   - `stack_frame` (and the focused stack frame, if it should differ)
   - `scrim` (the dimmed area behind a modal)
   - the accent washes now written as `accent` at 10–40 %: selection highlight, hover highlight, symbol highlight, bracket match, find range, peek-view match, minimap and overview-ruler marks, input option active, validation backgrounds, chat request hover, slash command
2. **Publish a generated `hexa` field** (`#rrggbbaa`) next to each recipe's composited `hex`, per flavour. The port's `overlayHex()` and `withAlpha()` helpers then disappear.
3. **Give every recipe exactly one gate class** and fail the build when one has none: behind code, behind a label, a surface wash, or non-text. Gates that proved necessary in Sepp’s Workshop:
   - text and every syntax colour on each code overlay, and on stacked ones (inserted span on inserted line)
   - ANSI colours on the terminal selection
   - surface washes on every surface they can land on, and they must move away from the canvas visibly
   - the active slider at 3:1 against the surface
4. **Port follow-up:** once released, delete `ALPHA`, `withAlpha` and `overlayHex` from `vivid-life-vs-code` and add the "no `#` in the template" test.

### Notes from doing this once

- Measure before adding a recipe. Three planned recipes were dropped in Sepp’s Workshop after measuring (diff gutter, a second stack-frame hue, a terminal selection foreground).
- Stacked overlays are where AA fails first: the inserted-text span over the inserted line needed its own patch release.
- Overview-ruler marks have no text on them; they belong in the non-text class with a visibility minimum, not a contrast gate.
