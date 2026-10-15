# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

- Updated to `@sepps-workshop/design-system` 0.12.0.
- The selection is a light Sunset tint instead of Darkblack (`editor.selectionBackground`, `terminal.selectionBackground`, `selection.background`): 25 % when focused, 20 % when not. Darkblack differed from the editor background mostly in hue and hardly in lightness, so a selection was easy to miss. Text on a selection now reaches 3:1 instead of 4.5:1; plain text keeps 7:1.
- Word, symbol and bracket highlights are slightly fainter (Sunset 8 % instead of 10 %), so they stay apart from an unfocused selection.

## [0.4.0] - 2026-10-14

### Changed

- The agent sessions window follows the editor: the chat card sits on `bg` with `fg` text, and the window shell around it on `bg_chrome`. Before, VS Code's defaults put the chat on `bg_chrome` inside a `bg` shell. Agent answers still have no bubble; VS Code draws one around requests only.

## [0.3.1] - 2026-10-14

### Changed

- Chat request bubbles use `bg_soft` instead of a darkening wash, so they stand out from the editor and chrome backgrounds while still carrying links and inline code.

## [0.3.0] - 2026-10-13

### Changed

- Updated to `@sepps-workshop/design-system` 0.11.0.
- Primitive types (`int`, `bool`, `string` and their kin) take the type colour in C#, C, C++, Java and Go. Before, C# showed them in plain text and C and C++ in the keyword colour.
- Go keywords such as `func`, `var`, `struct` and `package` take the keyword colour instead of plain text. Java class references (`String`, `Integer`) take the type colour instead of the keyword colour.
- C# parameter declarations, C# and C++ enum members, C++ `std::` qualifiers, base classes and Python `self` are coloured like their kind elsewhere.
- Format placeholders, such as `{name}` in a Python f-string, take the escape-sequence colour instead of the string colour.
- The selection is Darkblack at full strength (`editor.selectionBackground`, `terminal.selectionBackground`), so it stands out further from the editor background.

## [0.2.2] - 2026-10-13

### Changed

- README rewritten in a friendlier voice: Sepp, the robot the theme is named after, now introduces it. The instructions are unchanged. The file icon and font recommendations are merged into one section.

## [0.2.1] - 2026-10-07

### Changed

- Updated to `@sepps-workshop/design-system` 0.6.0.
- Updated `@vscode/vsce` to 4.0.0, which clears the `npm audit` advisory.

### Added

- README recommends Material Icon Theme for file icons, as the design system does.

## [0.2.0] - 2026-10-07

### Changed

- Updated to `@sepps-workshop/design-system` 0.5.0.
- Markdown inline code takes the `code` role and YAML keys take the `key` role. JSON keys share the `key` role.
- Markdown italic and bold now carry the foundation's `emphasis` and `strong` colours.

## [0.1.0] - 2026-10-07

### Added

- The Sepp’s Workshop colour theme, generated from `@sepps-workshop/design-system` 0.4.0 (brand colours of the Farbtafel 2026): workbench colours, TextMate rules and semantic token colours.
