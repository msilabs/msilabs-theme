# msilabs Theme

Eye-comfort VS Code themes built on the msilabs brand: navy, mint and an amber cursor, like the `<|>` logo.

## Moods

| Theme | Use it for |
|---|---|
| msilabs Dark | Everyday and evening. Navy, the flagship brand theme. |
| msilabs Light | Daytime and bright rooms. Same color families as Dark, on a soft off-white. |
| msilabs Notebook | Paper and ink: cream paper, pen-ink syntax, pencil comments, highlighter selection. |

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

## Development

- `npm run dev` rebuilds the theme JSON when `src/palettes.mjs` changes.
- `npm run preview` opens a VS Code window with the theme and the demo files in `samples/`.
- All colors live in `src/palettes.mjs`.
