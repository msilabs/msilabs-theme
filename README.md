# msilabs Theme

Eye-comfort VS Code themes built on the msilabs brand: navy, mint and an amber cursor, like the `<|>` logo.

## Moods

| Theme | Use it for |
|---|---|
| msilabs Dark | Everyday and evening. Navy, the flagship brand theme. |
| msilabs Light | Daytime and bright rooms. Same color families as Dark, on a soft off-white. |

## Auto switch with macOS appearance

```json
"window.autoDetectColorScheme": true,
"workbench.preferredDarkColorTheme": "msilabs Dark",
"workbench.preferredLightColorTheme": "msilabs Light"
```

## Development

- `npm run dev` rebuilds the theme JSON when `src/palettes.mjs` changes.
- `npm run preview` opens a VS Code window with the theme and the demo files in `samples/`.
- All colors live in `src/palettes.mjs`.
