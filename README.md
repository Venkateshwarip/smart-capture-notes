# Smart Capture & Notes (React Native + Expo)

Capture a photo or pick one from the gallery, add a title / notes / category, and manage your records offline.

## Features
- Camera capture **or** gallery selection, with image preview
- Title, notes, category per record
- Records persist after the app is closed (SQLite)
- List with thumbnails + titles; search (title/notes) and category filter
- View, edit, delete (confirmation dialog; long-press a list item to delete)
- Permission-denied handling, missing-image placeholder, input validation, loading indicators
- **Bonus:** category counts dashboard (on filter chips), image compression (JPEG quality 0.7), export (share image or title+notes)

## Tech stack
| Purpose | Library |
|---|---|
| Framework | React Native with Expo (SDK 58) |
| Database | `expo-sqlite` |
| Camera / gallery | `expo-image-picker` |
| File storage | `expo-file-system` |
| Export | `expo-sharing` + React Native `Share` |
| Safe areas | `react-native-safe-area-context` |

## Setup
Requirements: **Node.js 22.13+**, VS Code, and the **Expo Go** app on your phone.

This repository is a complete Expo project. Open a terminal in the project folder and run:

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS). Phone and computer must be on the same Wi-Fi.

If the QR code does not connect on your network, use a tunnel instead:
```bash
npm install --save-dev @expo/ngrok
npx expo start --tunnel ngrok
```

The project uses **Expo SDK 58**, so the Expo Go app on your phone must also be the SDK 58 version.

## Architecture
```
App.js                   state-based navigation (home / detail / edit) + Android back button
src/theme.js             colors, shared styles, categories
src/db/database.js       all SQL (CRUD, search, category counts)
src/services/imageService.js   permissions, pick, compress, save/delete image files
src/components/          SafeImage, CategoryChips, Header
src/screens/             HomeScreen, EditScreen (create + edit), DetailScreen
```
Layers: **Screens → db / imageService → SQLite / file system.** Screens contain no SQL or file-path logic.

## Storage approach
- Record details: SQLite table `records` (id, title, notes, category, image_file, created_at, updated_at).
- Images: copied into `<documents>/images/` so they stay available after restart.
- Only the **file name** is stored in the DB; the full URI is rebuilt at runtime because the app's base directory path can change.
- Replacing an image or deleting a record deletes the old file; an image picked but never saved is cleaned up when leaving the edit screen.

## Error handling
Camera permission denied (with "blocked in Settings" message), camera/gallery failure, storage failure, missing image placeholder, DB errors with retry/alerts, title required (≤100), image required, notes ≤2000, delete confirmation, loading spinners.

## Known limitations
- One image per record; no video recording
- Fixed categories (no custom categories)
- Export shares image and text separately (system share sheet), not as a single bundle
- No cloud sync; uninstalling the app removes the data
- Simple LIKE search, no pagination
- Basic state navigation instead of React Navigation
- No automated tests

## Screenshots
Screenshots are in the `/screenshots` folder. A screen recording is in `/video/screenrecord.mp4`.