# After Hours

A responsive reading companion with a personal library, reading goals, tasks, a focus timer, and ambient sounds.

## Development

Use Node.js 20.19+ (or Node.js 22.12+) and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:3000).

## Checks and production build

```sh
npm run check
npm run preview
```

`check` runs strict TypeScript checks (including unused code), the data-model tests, and a production build. Build output is generated in `dist/` and is ignored by Git. Production assets use the `/after-hours/` base path configured in `vite.config.ts`; follow the preview URL printed by Vite.

## Data and privacy

The library starts empty. Book search requests real metadata and covers from Open Library; no sample results are substituted if it fails. Manual book entry remains available. Books, tasks, goals, and reading history are stored in this browser, without account sync. Clearing browser storage deletes this local data. Settings provide a downloadable JSON backup and paste-to-restore; restoring replaces the current library after validation.

Catalog search, cover images, and Google Fonts require internet access. Ambient sounds are synthesized locally with Web Audio and start through user interaction. The original cover/audio files in `assets/` are retained source assets; the current app does not bundle them or load sample library data.

## Project structure

- `App.tsx`: application state and screen composition.
- `src/screens/`, `src/dialogs/`, `src/components/`: interface and interactions.
- `src/model.ts`, `src/useStore.ts`: data validation, updates, and local persistence.
- `src/catalog.ts`: live book search.
- `src/ambientAudio.ts`: browser audio engine.
- `src/theme/`: visual tokens.

## Platform status

This checkout currently builds with Vite, React, and React Native Web. It supports phone-sized browsers, but the Expo and EAS configuration was removed in the web migration. It cannot currently generate an Android APK. Restoring native packaging requires a separate implementation and device validation.

## Performance and library controls

Dialogs load on demand, with a loading sheet and a recoverable error message if a download fails. The React runtime is bundled separately so it can remain cached across app updates. Library search defers filtering during typing, and the shelf can be sorted by added order, title, or reading progress. Empty filtered results offer a clear-filters action.
