# Smart Capture & Notes

**Technical Documentation: Storage Approach and Application Architecture**

React Native (Expo SDK 58)  |  [GitHub Repository](https://github.com/Venkateshwarip/smart-capture-notes)

---

## 1. Overview
Smart Capture & Notes is a mobile app built with **React Native (Expo SDK 58)**. Users capture a photo with the camera or pick one from the gallery, add a title, notes and category, and manage the saved records offline.

All data stays on the device. No backend or internet connection is required.

## 2. Technology choices

| Area | Choice | Reason |
| --- | --- | --- |
| Framework | React Native + Expo | Cross-platform (Android and iOS), fast to run on a real device with Expo Go |
| Language | JavaScript | Simple, readable code |
| Database | `expo-sqlite` | Reliable local storage with SQL search and filtering |
| Images | `expo-image-picker`, `expo-file-system` | Camera, gallery and file storage |
| Export | `expo-sharing`, React Native `Share` | Uses the phone's share sheet |
| Navigation | Simple state in `App.js` | Only three screens, so no extra library is needed |

## 3. Application architecture

The code is split into three layers. A screen never writes SQL or builds file paths itself.

```
┌─────────────────────────────────────────┐
│  UI layer          src/screens/         │
│  HomeScreen · EditScreen · DetailScreen │
│  src/components/ (SafeImage, Header,    │
│                   CategoryChips)        │
└───────────────┬─────────────────────────┘
                │ calls
┌───────────────▼─────────────────────────┐
│  Data / service layer                   │
│  src/db/database.js      (SQLite CRUD)  │
│  src/services/imageService.js (images)  │
└───────────────┬─────────────────────────┘
                │ reads / writes
┌───────────────▼─────────────────────────┐
│  Device storage                         │
│  SQLite database  ·  images/ folder     │
└─────────────────────────────────────────┘
```

### Folder structure
```
App.js                        navigation state + Android back button
index.js                      app entry point
src/theme.js                  colors, shared styles, category list
src/db/database.js            all SQL queries
src/services/imageService.js  permissions, pick, compress, save, delete
src/components/               reusable UI pieces
src/screens/                  Home (list/search/filter), Edit (create + edit), Detail
```

### Navigation
`App.js` keeps a `route` value (`home`, `detail` or `edit`, plus a record id) and renders the matching screen. It also handles the Android hardware back button. Each screen receives a `navigate` function.

## 4. Storage approach

### 4.1 Record details: SQLite
Records are stored in one table named `records`:

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | INTEGER, primary key | Unique record ID |
| `title` | TEXT, required | Record title |
| `notes` | TEXT | Notes |
| `category` | TEXT | One of General, Work, Personal, Receipts, Ideas |
| `image_file` | TEXT | Image **file name** (not the full path) |
| `created_at` | INTEGER | Timestamp (ms) |
| `updated_at` | INTEGER | Timestamp (ms), used for sorting |

The table is created automatically the first time the app opens. SQLite saves to disk, so records remain after the app is closed and reopened.

Search uses `LIKE` on title and notes. The category filter uses a `WHERE category = ?` clause. All queries use parameters (`?`), never string concatenation, which prevents SQL injection and quoting bugs. Category counts come from a `GROUP BY category` query.

### 4.2 Images: file system
When a user takes or picks a photo:
1. The picker returns a temporary file, compressed to JPEG quality 0.7.
2. The app copies it into the permanent folder `<documents>/images/` with a unique name (`<timestamp>.jpg`).
3. Only that **file name** is saved in the database.

**Why store only the file name?** The base folder path of an app can change after updates or restores, so a saved absolute path could break. The full path is rebuilt at runtime from the file name.

### 4.3 Keeping files and database in sync
- Editing a record and changing its image deletes the old image file after the update succeeds.
- Deleting a record deletes its image file.
- If a user picks an image but leaves the screen without saving, that unsaved file is removed, so no orphan files remain.

## 5. Feature flow

**Create:** Home → "+ New" → pick image → fill form → validation → image already saved to `images/` → insert row → back to list.

**Edit:** Detail → "Edit" → form pre-filled from database → update row → delete old image if replaced.

**Delete:** use the Delete button on the detail screen, or long-press an item in the list. Both show a confirmation dialog.

**Search / filter:** typing in the search box (debounced by 250 ms) and tapping a category chip re-query the database. The chips also show the number of records per category, which acts as a simple dashboard.

**Export:** the "Export" button offers to share the image or the title and notes through the phone's share sheet.

## 6. Error handling and edge cases

| Situation | Behaviour |
| --- | --- |
| Camera permission denied | Message explaining the problem; if blocked permanently, tells the user to enable it in Settings |
| Camera or gallery fails to open | Alert with a clear message |
| Image file missing or corrupt | `SafeImage` shows an "Image missing" placeholder instead of crashing |
| Storage full or copy fails | Alert: "Could not save the image" |
| Empty title | Inline error under the field |
| Title over 100 characters | Blocked by limit and validation |
| No image selected | Inline error "Please add an image" |
| Database read/write fails | Error message with a Retry button on the list; alerts on save/delete |
| Record no longer exists | App returns to the home screen |
| No records / no search results | Friendly empty-state text |
| Slow operations | Loading spinners on list load, save and image pick |

## 7. UI and responsiveness
- Layouts use flexible sizes (`flex`, percentages, `aspectRatio`), not fixed pixel widths.
- Content is limited to a maximum width of 720 and centered, so it stays readable on tablets and landscape.
- Safe-area handling keeps content clear of notches and system bars.
- The form uses `KeyboardAvoidingView` and a scroll view so the keyboard doesn't cover inputs.

## 8. Testing
The app was tested manually on a physical Android device through Expo Go. Tested flows: capture and gallery selection, create, view, edit, delete, search, category filter, and restarting the app to confirm records persist. No automated tests are included.

## 9. Known limitations
- One image per record (multiple attachments not implemented).
- No video recording.
- Categories are fixed in code.
- Export shares the image and the text separately, not as one bundle.
- No cloud backup or sync; uninstalling the app removes the data.
- Search is basic text matching with no pagination.
- Simple state-based navigation instead of React Navigation.
- Tested on Android only; iOS was not tested.

## 10. Possible improvements
- Multiple images per record
- Video attachment
- Custom categories
- Export a record as a single PDF
- Cloud backup (for example with Supabase or Firebase)
- Automated tests for the database and validation logic
