import { mkdirSync, writeFileSync } from 'node:fs';
import { palettes } from './palettes.mjs';

const CONTRAST_RULES = {
  dark: { fg: [9.5, 12.5], syntax: [6.5, 10], comment: [4.5, 5.5] },
  warmDark: { fg: [9, 10.5], syntax: [6.5, 9.5], comment: [4.5, 5.5] },
  light: { fg: [10, 16], syntax: [5, 9], comment: [4.5, 6] },
};
const SYNTAX_ROLES = ['keyword', 'function', 'string', 'number', 'type', 'tag', 'attribute', 'property', 'escape'];

function luminance(hex) {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

// only for 6-digit colors
function alpha(hex, opacity) {
  const value = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${hex}${value}`.toUpperCase();
}

function rule(scope, foreground, fontStyle) {
  const settings = { foreground };
  if (fontStyle) settings.fontStyle = fontStyle;
  return { scope, settings };
}

function makeColors({ ui, syntax, status, ansi }) {
  const git = {
    added: status.success,
    modified: status.info,
    deleted: status.error,
    untracked: status.success,
    ignored: ui.fgSubtle,
    conflict: status.warning,
  };
  const brackets = [syntax.function, syntax.keyword, syntax.type];

  const colors = {
    // base
    focusBorder: alpha(ui.accent, 0.6),
    foreground: ui.fg,
    descriptionForeground: ui.fgMuted,
    disabledForeground: ui.fgSubtle,
    errorForeground: status.error,
    'icon.foreground': ui.fgMuted,
    'widget.shadow': ui.shadow,
    'selection.background': ui.selection,
    'sash.hoverBorder': ui.accent,
    'textLink.foreground': ui.link,
    'textLink.activeForeground': ui.accent,
    'textCodeBlock.background': ui.chrome,
    'textBlockQuote.background': ui.chrome,
    'textBlockQuote.border': ui.borderStrong,
    'textPreformat.foreground': syntax.string,
    'textSeparator.foreground': ui.border,

    // buttons and inputs
    'button.background': ui.accent,
    'button.foreground': ui.onAccent,
    'button.hoverBackground': alpha(ui.accent, 0.85),
    'button.secondaryBackground': ui.widget,
    'button.secondaryForeground': ui.fg,
    'button.secondaryHoverBackground': ui.borderStrong,
    'checkbox.background': ui.input,
    'checkbox.border': ui.borderStrong,
    'dropdown.background': ui.widget,
    'dropdown.listBackground': ui.widget,
    'dropdown.border': ui.borderStrong,
    'dropdown.foreground': ui.fg,
    'input.background': ui.input,
    'input.border': ui.borderStrong,
    'input.foreground': ui.fg,
    'input.placeholderForeground': ui.fgSubtle,
    'inputOption.activeBackground': alpha(ui.accent, 0.2),
    'inputOption.activeBorder': ui.accent,
    'inputOption.activeForeground': ui.fgStrong,
    'inputValidation.errorBackground': ui.widget,
    'inputValidation.warningBackground': ui.widget,
    'inputValidation.infoBackground': ui.widget,
    'inputValidation.errorBorder': status.error,
    'inputValidation.warningBorder': status.warning,
    'inputValidation.infoBorder': status.info,
    'badge.background': ui.accent,
    'badge.foreground': ui.onAccent,
    'progressBar.background': ui.accent,
    'scrollbar.shadow': ui.shadow,
    'scrollbarSlider.background': alpha(ui.fgMuted, 0.2),
    'scrollbarSlider.hoverBackground': alpha(ui.fgMuted, 0.35),
    'scrollbarSlider.activeBackground': alpha(ui.fgMuted, 0.5),

    // lists
    'list.activeSelectionBackground': alpha(ui.accent, 0.18),
    'list.activeSelectionForeground': ui.fgStrong,
    'list.inactiveSelectionBackground': alpha(ui.fgMuted, 0.12),
    'list.inactiveSelectionForeground': ui.fg,
    'list.hoverBackground': alpha(ui.fgMuted, 0.08),
    'list.hoverForeground': ui.fg,
    'list.focusOutline': alpha(ui.accent, 0.6),
    'list.highlightForeground': ui.link,
    'list.errorForeground': status.error,
    'list.warningForeground': status.warning,
    'list.dropBackground': alpha(ui.accent, 0.15),
    'tree.indentGuidesStroke': ui.borderStrong,

    // activity bar and side bar
    'activityBar.background': ui.chrome,
    'activityBar.foreground': ui.fgStrong,
    'activityBar.inactiveForeground': ui.fgSubtle,
    'activityBar.border': ui.border,
    'activityBar.activeBorder': ui.accent,
    'activityBarBadge.background': ui.accent,
    'activityBarBadge.foreground': ui.onAccent,
    'sideBar.background': ui.chrome,
    'sideBar.foreground': ui.fgMuted,
    'sideBar.border': ui.border,
    'sideBarTitle.foreground': ui.fg,
    'sideBarSectionHeader.background': ui.chrome,
    'sideBarSectionHeader.foreground': ui.fg,
    'sideBarSectionHeader.border': ui.border,

    // tabs and breadcrumbs
    'editorGroup.border': ui.border,
    'editorGroupHeader.tabsBackground': ui.chrome,
    'editorGroupHeader.tabsBorder': ui.border,
    'editorGroupHeader.noTabsBackground': ui.bg,
    'tab.activeBackground': ui.bg,
    'tab.activeForeground': ui.fgStrong,
    'tab.activeBorderTop': ui.accent,
    'tab.activeBorder': ui.bg,
    'tab.inactiveBackground': ui.chrome,
    'tab.inactiveForeground': ui.fgMuted,
    'tab.hoverBackground': ui.bg,
    'tab.border': ui.border,
    'tab.unfocusedActiveForeground': ui.fgMuted,
    'tab.unfocusedInactiveForeground': ui.fgSubtle,
    'tab.unfocusedActiveBorderTop': alpha(ui.accent, 0.4),
    'breadcrumb.foreground': ui.fgMuted,
    'breadcrumb.focusForeground': ui.fg,
    'breadcrumb.activeSelectionForeground': ui.fgStrong,
    'breadcrumbPicker.background': ui.widget,

    // editor
    'editor.background': ui.bg,
    'editor.foreground': ui.fg,
    'editorLineNumber.foreground': ui.lineNumber,
    'editorLineNumber.activeForeground': ui.lineNumberActive,
    'editorCursor.foreground': ui.cursor,
    'editorCursor.background': ui.bg,
    'editor.selectionBackground': ui.selection,
    'editor.inactiveSelectionBackground': ui.selectionHighlight,
    'editor.selectionHighlightBackground': ui.selectionHighlight,
    'editor.findRangeHighlightBackground': ui.selectionHighlight,
    'editor.rangeHighlightBackground': ui.selectionHighlight,
    'editor.wordHighlightBackground': ui.wordHighlight,
    'editor.wordHighlightStrongBackground': ui.wordHighlightStrong,
    'editor.findMatchBackground': ui.findMatch,
    'editor.findMatchBorder': ui.findMatchBorder,
    'editor.findMatchHighlightBackground': ui.findMatchHighlight,
    'editor.lineHighlightBackground': ui.lineHighlight,
    'editor.lineHighlightBorder': ui.lineHighlightBorder,
    'editorWhitespace.foreground': ui.borderStrong,
    'editorIndentGuide.background1': ui.indentGuide,
    'editorIndentGuide.activeBackground1': ui.indentGuideActive,
    'editorRuler.foreground': ui.border,
    'editorCodeLens.foreground': ui.fgSubtle,
    'editorLink.activeForeground': ui.link,
    'editorBracketMatch.background': alpha(ui.accent, 0.15),
    'editorBracketMatch.border': alpha(ui.accent, 0.6),
    'editorBracketHighlight.foreground1': brackets[0],
    'editorBracketHighlight.foreground2': brackets[1],
    'editorBracketHighlight.foreground3': brackets[2],
    'editorBracketHighlight.foreground4': brackets[0],
    'editorBracketHighlight.foreground5': brackets[1],
    'editorBracketHighlight.foreground6': brackets[2],
    'editorBracketHighlight.unexpectedBracket.foreground': status.error,
    'editorError.foreground': status.error,
    'editorWarning.foreground': status.warning,
    'editorInfo.foreground': status.info,
    'editorHint.foreground': ui.fgSubtle,
    'editorGutter.background': ui.bg,
    'editorGutter.addedBackground': git.added,
    'editorGutter.modifiedBackground': git.modified,
    'editorGutter.deletedBackground': git.deleted,
    'editorOverviewRuler.border': ui.border,
    'editorOverviewRuler.errorForeground': status.error,
    'editorOverviewRuler.warningForeground': status.warning,
    'editorOverviewRuler.infoForeground': status.info,
    'editorOverviewRuler.findMatchForeground': ui.findMatchBorder,
    'editorOverviewRuler.addedForeground': git.added,
    'editorOverviewRuler.modifiedForeground': git.modified,
    'editorOverviewRuler.deletedForeground': git.deleted,
    'editorInlayHint.background': alpha(ui.fgMuted, 0.1),
    'editorInlayHint.foreground': ui.fgSubtle,
    'editorStickyScroll.background': ui.bg,
    'editorStickyScrollHover.background': ui.widget,
    'editorLightBulb.foreground': status.warning,
    'minimap.selectionHighlight': ui.selection,
    'minimap.findMatchHighlight': ui.findMatchBorder,
    'minimapGutter.addedBackground': git.added,
    'minimapGutter.modifiedBackground': git.modified,
    'minimapGutter.deletedBackground': git.deleted,

    // diff and merge
    'diffEditor.insertedTextBackground': alpha(status.success, 0.15),
    'diffEditor.removedTextBackground': alpha(status.error, 0.15),
    'diffEditor.insertedLineBackground': alpha(status.success, 0.08),
    'diffEditor.removedLineBackground': alpha(status.error, 0.08),
    'diffEditor.diagonalFill': ui.border,
    'merge.currentHeaderBackground': alpha(status.success, 0.3),
    'merge.currentContentBackground': alpha(status.success, 0.1),
    'merge.incomingHeaderBackground': alpha(status.info, 0.3),
    'merge.incomingContentBackground': alpha(status.info, 0.1),

    // widgets
    'editorWidget.background': ui.widget,
    'editorSuggestWidget.background': ui.widget,
    'editorHoverWidget.background': ui.widget,
    'editorWidget.foreground': ui.fg,
    'editorSuggestWidget.foreground': ui.fg,
    'editorHoverWidget.foreground': ui.fg,
    'editorWidget.border': ui.borderStrong,
    'editorSuggestWidget.border': ui.borderStrong,
    'editorHoverWidget.border': ui.borderStrong,
    'editorSuggestWidget.selectedBackground': alpha(ui.accent, 0.18),
    'editorSuggestWidget.highlightForeground': ui.link,
    'editorSuggestWidget.focusHighlightForeground': ui.link,
    'peekView.border': ui.accent,
    'peekViewEditor.background': ui.chrome,
    'peekViewEditor.matchHighlightBackground': ui.findMatch,
    'peekViewResult.background': ui.widget,
    'peekViewResult.matchHighlightBackground': ui.findMatch,
    'peekViewResult.selectionBackground': alpha(ui.accent, 0.18),
    'peekViewTitle.background': ui.widget,
    'peekViewTitleLabel.foreground': ui.fgStrong,
    'peekViewTitleDescription.foreground': ui.fgMuted,

    // panel and terminal
    'panel.background': ui.chrome,
    'panel.border': ui.border,
    'panelTitle.activeBorder': ui.accent,
    'panelTitle.activeForeground': ui.fgStrong,
    'panelTitle.inactiveForeground': ui.fgMuted,
    'terminal.background': ui.chrome,
    'terminal.foreground': ui.fg,
    'terminalCursor.foreground': ui.cursor,
    'terminal.selectionBackground': ui.selection,

    // status bar, title bar, menus
    'statusBar.background': ui.chrome,
    'statusBar.foreground': ui.fgMuted,
    'statusBar.border': ui.border,
    'statusBar.debuggingBackground': status.warning,
    'statusBar.debuggingForeground': ui.chrome,
    'statusBar.noFolderBackground': ui.chrome,
    'statusBarItem.hoverBackground': alpha(ui.fgMuted, 0.12),
    'statusBarItem.remoteBackground': ui.accent,
    'statusBarItem.remoteForeground': ui.onAccent,
    'statusBarItem.errorBackground': status.error,
    'statusBarItem.errorForeground': ui.chrome,
    'statusBarItem.warningBackground': status.warning,
    'statusBarItem.warningForeground': ui.chrome,
    'titleBar.activeBackground': ui.chrome,
    'titleBar.inactiveBackground': ui.chrome,
    'titleBar.activeForeground': ui.fg,
    'titleBar.inactiveForeground': ui.fgSubtle,
    'titleBar.border': ui.border,
    'commandCenter.background': ui.bg,
    'commandCenter.foreground': ui.fgMuted,
    'commandCenter.border': ui.border,
    'commandCenter.activeBackground': ui.widget,
    'menu.background': ui.widget,
    'menu.foreground': ui.fg,
    'menu.selectionBackground': alpha(ui.accent, 0.18),
    'menu.selectionForeground': ui.fgStrong,
    'menu.separatorBackground': ui.borderStrong,
    'menu.border': ui.borderStrong,

    // notifications and quick input
    'notifications.background': ui.widget,
    'notificationCenterHeader.background': ui.widget,
    'notifications.foreground': ui.fg,
    'notifications.border': ui.borderStrong,
    'notificationLink.foreground': ui.link,
    'quickInput.background': ui.widget,
    'quickInputTitle.background': ui.widget,
    'quickInput.foreground': ui.fg,
    'quickInputList.focusBackground': alpha(ui.accent, 0.18),
    'quickInputList.focusForeground': ui.fgStrong,
    'pickerGroup.foreground': ui.link,
    'pickerGroup.border': ui.borderStrong,
    'keybindingLabel.background': alpha(ui.fgMuted, 0.1),
    'keybindingLabel.foreground': ui.fg,
    'keybindingLabel.border': ui.borderStrong,
    'keybindingLabel.bottomBorder': ui.borderStrong,

    // git and misc
    'gitDecoration.addedResourceForeground': git.added,
    'gitDecoration.modifiedResourceForeground': git.modified,
    'gitDecoration.deletedResourceForeground': git.deleted,
    'gitDecoration.untrackedResourceForeground': git.untracked,
    'gitDecoration.ignoredResourceForeground': git.ignored,
    'gitDecoration.conflictingResourceForeground': git.conflict,
    'settings.headerForeground': ui.fgStrong,
    'settings.modifiedItemIndicator': ui.accent,
    'debugToolBar.background': ui.widget,
    'charts.foreground': ui.fg,
    'charts.lines': ui.borderStrong,
    'charts.red': status.error,
    'charts.blue': status.info,
    'charts.yellow': status.warning,
    'charts.orange': syntax.number,
    'charts.green': status.success,
    'charts.purple': syntax.keyword,
    'testing.iconPassed': status.success,
    'testing.iconFailed': status.error,
  };

  for (const [name, color] of Object.entries(ansi)) {
    const key = `terminal.ansi${name[0].toUpperCase()}${name.slice(1)}`;
    colors[key] = color;
  }

  return Object.fromEntries(Object.entries(colors).filter(([, value]) => value));
}

function makeTokenColors({ ui, syntax: s, status }) {
  return [
    rule(['variable', 'variable.other.readwrite', 'variable.parameter', 'meta.definition.variable',
      'meta.template.expression', 'meta.embedded.expression', 'punctuation.definition.variable.php'], ui.fg),
    rule(['comment', 'punctuation.definition.comment', 'string.comment'], s.comment, 'italic'),
    rule(['punctuation', 'keyword.operator', 'meta.brace', 'meta.delimiter'], s.punctuation),
    rule(['keyword', 'storage', 'storage.type', 'storage.modifier',
      'keyword.operator.new', 'keyword.operator.expression', 'keyword.operator.word', 'keyword.operator.logical.python',
      'variable.language', 'variable.parameter.function.language.special.self.python',
      'support.function.construct', 'keyword.blade',
      'punctuation.section.embedded', 'punctuation.definition.template-expression',
      'keyword.control.alo', 'meta.attribute.logic.alo',
      'punctuation.definition.list.begin.markdown', 'meta.diff.header', 'meta.diff.range'], s.keyword),
    rule(['string', 'string.template', 'punctuation.definition.string', 'markup.inline.raw'], s.string),
    rule(['constant.numeric', 'constant.language', 'constant.other', 'support.constant', 'keyword.other.unit',
      'variable.other.enummember', 'support.constant.property-value.css',
      'variable.other.normal.shell', 'variable.other.special.shell', 'variable.other.positional.shell'], s.number),
    rule(['entity.name.function', 'support.function', 'variable.function', 'meta.function-call.generic',
      'entity.name.command.shell', 'entity.other.attribute-name.class.css', 'entity.other.attribute-name.id.css'], s.function),
    rule(['entity.name.type', 'entity.name.class', 'entity.name.namespace', 'entity.other.inherited-class',
      'support.class', 'support.type', 'support.type.primitive', 'storage.type.primitive',
      'keyword.other.type.php', 'support.other.namespace.php', 'support.class.component'], s.type),
    rule(['entity.name.tag'], s.tag),
    rule(['entity.other.attribute-name'], s.attribute),
    rule(['support.type.property-name', 'meta.object-literal.key', 'entity.name.tag.yaml'], s.property),
    rule(['constant.character.escape', 'string.regexp', 'constant.other.placeholder',
      'punctuation.decorator', 'punctuation.definition.decorator', 'entity.name.function.decorator',
      'storage.type.annotation'], s.escape),
    rule(['punctuation.section.embedded.begin.alo', 'punctuation.section.embedded.end.alo'], ui.accent),
    rule(['markup.heading', 'markup.heading entity.name', 'punctuation.definition.heading.markdown'], s.function, 'bold'),
    rule(['markup.bold'], ui.fgStrong, 'bold'),
    rule(['markup.italic'], ui.fg, 'italic'),
    rule(['markup.strikethrough'], ui.fgMuted, 'strikethrough'),
    rule(['string.other.link', 'markup.link'], s.type),
    rule(['markup.underline.link'], s.type, 'underline'),
    rule(['markup.quote'], s.comment),
    rule(['markup.inserted'], status.success),
    rule(['markup.deleted'], status.error),
    rule(['markup.changed'], status.info),
    rule(['invalid', 'invalid.illegal'], status.error),
    rule(['invalid.deprecated'], status.warning, 'strikethrough'),
  ];
}

function makeSemanticTokenColors({ syntax: s }) {
  return {
    class: s.type, interface: s.type, enum: s.type, struct: s.type, type: s.type,
    typeParameter: s.type, namespace: s.type,
    enumMember: s.number,
    function: s.function, method: s.function,
    decorator: s.escape, macro: s.escape,
    'property.declaration': s.property,
    'variable.defaultLibrary': s.type,
    '*.deprecated': { strikethrough: true },
  };
}

function makeTheme(p) {
  return {
    $schema: 'vscode://schemas/color-theme',
    name: p.name,
    type: p.type,
    semanticHighlighting: true,
    colors: makeColors(p),
    tokenColors: makeTokenColors(p),
    semanticTokenColors: makeSemanticTokenColors(p),
  };
}

function checkContrast(p) {
  const rules = CONTRAST_RULES[p.contrastProfile];
  const { ui, syntax, status, ansi } = p;
  const checks = [
    ['fg', ui.fg, ui.bg, rules.fg],
    ['comment', syntax.comment, ui.bg, rules.comment],
    ['punctuation', syntax.punctuation, ui.bg, [4.5, 21]],
    ...SYNTAX_ROLES.map((role) => [role, syntax[role], ui.bg, rules.syntax]),
    ['cursor', ui.cursor, ui.bg, [3, 21]],
    ['sidebar text', ui.fgMuted, ui.chrome, [4.5, 21]],
    ['link', ui.link, ui.bg, [4.5, 21]],
    ['link on chrome', ui.link, ui.chrome, [4.5, 21]],
    ['text on accent', ui.onAccent, ui.accent, [4.5, 21]],
    ...Object.entries(status).map(([name, color]) => [name, color, ui.bg, [4.5, 21]]),
    ...Object.entries(ansi)
      .filter(([name]) => name !== 'black')
      .map(([name, color]) => [`ansi ${name}`, color, ui.chrome, [4.5, 21]]),
  ];

  console.log(`\n${p.name}`);
  const failures = [];
  for (const [label, fg, bg, [min, max]] of checks) {
    const ratio = contrast(fg, bg);
    const ok = ratio >= min && ratio <= max;
    if (!ok) failures.push(label);
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${label.padEnd(20)} ${fg}  ${ratio.toFixed(2)}  (${min}–${max})`);
  }
  const lineNumberRatio = contrast(ui.lineNumber, ui.bg);
  if (lineNumberRatio < 2.5) {
    console.log(`  warn line number ${ui.lineNumber} ${lineNumberRatio.toFixed(2)} (< 2.5)`);
  }
  return failures.length;
}

mkdirSync(new URL('../themes/', import.meta.url), { recursive: true });
let failures = 0;
for (const palette of palettes) {
  const file = new URL(`../themes/${palette.file}-color-theme.json`, import.meta.url);
  writeFileSync(file, JSON.stringify(makeTheme(palette), null, 2) + '\n');
  failures += checkContrast(palette);
}
if (failures > 0) {
  console.error(`\n${failures} contrast check(s) failed`);
  process.exit(1);
}
console.log('\nAll themes built.');
