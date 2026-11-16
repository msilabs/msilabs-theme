# msilabs Theme

[![Visual Studio Marketplace](https://vsmarketplacebadges.dev/version/msilabs.msilabs-theme.svg)](https://marketplace.visualstudio.com/items?itemName=msilabs.msilabs-theme)
[![CI](https://github.com/msilabs/msilabs-theme/actions/workflows/ci.yml/badge.svg)](https://github.com/msilabs/msilabs-theme/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/github/license/msilabs/msilabs-theme)](LICENSE)
[![Socket Badge](https://badge.socket.dev/vscode/package/msilabs.msilabs-theme/0.1.1?platform=universal)](https://socket.dev/vscode/package/msilabs.msilabs-theme/overview/0.1.1)

Eye-comfort VS Code themes built on the msilabs brand: navy, mint and an amber cursor, like the `<|>` logo.

## Moods

| Theme | Use it for |
|---|---|
| msilabs Dark | Everyday and evening. Navy, the flagship brand theme. |
| msilabs Light | Daytime and bright rooms. Same color families as Dark, on a soft off-white. |
| msilabs Notebook | Paper and ink: cream paper, pen-ink syntax, pencil comments, highlighter selection. |
| msilabs Warm Night | Late night in a dark room. Warm charcoal, little blue light, deliberately softer contrast. |

## Install

Search for **msilabs Theme** in the VS Code Extensions view, or install it from the [Marketplace page](https://marketplace.visualstudio.com/items?itemName=msilabs.msilabs-theme). Then pick a theme with `Cmd/Ctrl+K Cmd/Ctrl+T`.

## Auto switch with macOS appearance

```json
"window.autoDetectColorScheme": true,
"workbench.preferredDarkColorTheme": "msilabs Dark",
"workbench.preferredLightColorTheme": "msilabs Light"
```

## Notebook feel

A theme cannot change the font or draw ruled lines. For the handwritten look:

- Use a font with cursive italics, such as Victor Mono or Cascadia Code, so the italic comments look handwritten.
- Optionally use Monaspace Radon, a handwriting-style monospace, for all code.
- Create a VS Code Profile named "Notebook" and put the theme, `editor.fontFamily` and `"editor.lineHeight": 1.8` there. Other profiles stay untouched.

## Turn off comment italics

```json
"editor.tokenColorCustomizations": {
  "[msilabs Dark]": { "textMateRules": [{ "scope": "comment", "settings": { "fontStyle": "" } }] }
}
```

## Eye comfort

- No pure black or pure white.
- Balanced contrast: text is not too bright, comments are still readable.
- Few syntax colors, so nothing shouts.
- Light by day, dark at night.

## Development

- `npm run dev` rebuilds the theme JSON when `src/palettes.mjs` changes.
- `npm run preview` opens a VS Code window with the theme and the demo files in `samples/`.
- All colors live in `src/palettes.mjs`.
