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

  const colors = {
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
    "editorGroup.emptyBackground": surface.bg_chrome,
    "editorGroupHeader.tabsBackground": surface.bg_chrome,
    "editorGroupHeader.tabsBorder": border.subtle,
    "editorGroupHeader.noTabsBackground": surface.bg_chrome,
    "tab.activeBackground": surface.bg,
    "tab.activeForeground": text.fg,
    "tab.activeBorderTop": accent,
    "tab.inactiveBackground": surface.bg_chrome,
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
    "activityBar.background": surface.bg_chrome,
    "activityBar.foreground": text.fg,
    "activityBar.inactiveForeground": text.fg_subtle,
    "activityBar.activeBorder": accent,
    "activityBar.activeBackground": wash("hover"),
    "activityBar.border": border.subtle,
    "activityBarBadge.background": accent,
    "activityBarBadge.foreground": accent_on,

    // sidebar
    "sideBar.background": surface.bg_chrome,
    "sideBar.foreground": text.fg_muted,
    "sideBar.border": border.subtle,
    "sideBar.dropBackground": wash("active"),
    "sideBarTitle.foreground": text.fg,
    "sideBarSectionHeader.background": surface.bg,
    "sideBarSectionHeader.foreground": text.fg_muted,
    "sideBarSectionHeader.border": border.subtle,

    // status bar — stays on the chrome surface so VS Code's own state signals
    // stand out. The accent is a strip along the top edge, never the fill;
    // statusBar.noFolderBorder removes the strip when no folder is open.
    "statusBar.background": surface.bg_chrome,
    "statusBar.foreground": text.fg,
    "statusBar.border": accent,
    "statusBar.noFolderBackground": surface.bg_chrome,
    "statusBar.noFolderForeground": text.fg,
    "statusBar.noFolderBorder": border.subtle,
    // Red as a fill is the danger fill with white text. The accent is already
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
    "titleBar.activeBackground": surface.bg_chrome,
    "titleBar.activeForeground": text.fg,
    "titleBar.inactiveBackground": surface.bg_chrome,
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
    "notificationCenterHeader.background": surface.bg_chrome,
    "notificationCenterHeader.foreground": text.fg,
    "notificationToast.border": border.default,
    "notificationLink.foreground": link,
    "notificationsErrorIcon.foreground": signal.error,
    "notificationsWarningIcon.foreground": signal.warning,
    "notificationsInfoIcon.foreground": signal.info,

    // panel (terminal/output container) — chrome, so it sits on bg_chrome
    // with the sidebar and the status bar. Section headers take the canvas.
    "panel.background": surface.bg_chrome,
    "panel.border": border.subtle,
    "panel.dropBorder": accent,
    "panelTitle.activeBorder": accent,
    "panelTitle.activeForeground": text.fg,
    "panelTitle.inactiveForeground": text.fg_subtle,
    "panelInput.border": border.control,
    "panelSection.border": border.subtle,
    "panelSectionHeader.background": surface.bg,
    "panelSectionHeader.foreground": text.fg,

    // terminal — embedded in the editor window, so it sits on the canvas
    // like the code; the panel's Darkblue title row separates the two.
    // No selection foreground: the foundation gates ANSI on the selection.
    "terminal.foreground": text.fg,
    "terminal.background": surface.bg,
    "terminal.border": border.subtle,
    "terminal.selectionBackground": wash("selection"),
    "terminal.inactiveSelectionBackground": wash("selection_inactive"),
    "terminal.findMatchBackground": wash("find_match"),
    "terminal.findMatchBorder": overlay.find_match.border,
    "terminal.findMatchHighlightBackground": wash("find_match_other"),
    "terminal.findMatchHighlightBorder": overlay.find_match_other.border,
    "terminalCursor.foreground": accent,
    "terminalCursor.background": surface.bg,
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
    "peekViewResult.background": surface.bg_chrome,
    "peekViewResult.fileForeground": text.fg,
    "peekViewResult.lineForeground": text.fg_muted,
    "peekViewResult.matchHighlightBackground": wash("find_match"),
    "peekViewResult.selectionBackground": wash("selected_item"),
    "peekViewResult.selectionForeground": text.fg,
    "peekViewTitle.background": surface.bg_chrome,
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
    "editorHoverWidget.statusBarBackground": surface.bg_chrome,

    // quick input (Ctrl+P, Ctrl+Shift+P)
    "quickInput.background": surface.bg_overlay,
    "quickInput.foreground": text.fg,
    "quickInputList.focusBackground": wash("selected_item"),
    "quickInputList.focusForeground": text.fg,
    "quickInputList.focusIconForeground": text.fg,
    "quickInputTitle.background": surface.bg_chrome,
    "pickerGroup.foreground": accent,
    "pickerGroup.border": border.subtle,

    // text links / preformatted — links take the link slot, not the accent:
    // the accent is for focus and identity.
    "textLink.foreground": link,
    "textLink.activeForeground": link,
    "textBlockQuote.background": surface.bg_chrome,
    "textBlockQuote.border": accent,
    "textCodeBlock.background": surface.bg_chrome,
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
    "welcomePage.tileBackground": surface.bg_chrome,
    "welcomePage.tileHoverBackground": wash("hover"),
    "welcomePage.progress.background": surface.bg_chrome,
    "welcomePage.progress.foreground": accent,
    "walkThrough.embeddedEditorBackground": surface.bg_chrome,

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
    "notebook.outputContainerBackgroundColor": surface.bg_chrome,
    "notebook.selectedCellBackground": wash("active"),
    "notebook.selectedCellBorder": border.default,
    "notebook.symbolHighlightBackground": wash("word_highlight"),

    // chat
    "chat.requestBorder": border.subtle,
    // Requests show links and inline code, which bg_soft cannot carry.
    "chat.requestBackground": wash("hover"),
    "chat.requestBubbleBackground": wash("hover"),
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

  // JSON.stringify drops undefined, so a token the foundation renamed would
  // silently leave its keys at VS Code defaults.
  for (const [key, value] of Object.entries(colors))
    if (typeof value !== "string") throw new Error(`No token value for ${key}`);
  return colors;
}
