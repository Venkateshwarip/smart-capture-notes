import * as ImagePicker from 'expo-image-picker';
import { File, Directory, Paths } from 'expo-file-system';

// Images are copied into the app's document folder so they persist.
// Only the FILE NAME is stored in the database (the app's base path
// can change between updates), and the full URI is rebuilt when needed.
const imagesDir = new Directory(Paths.document, 'images');

function ensureDir() {
  if (!imagesDir.exists) imagesDir.create();
}

export function getImageUri(name) {
  return new File(imagesDir, name).uri;
}

export function imageExists(name) {
  try {
    return !!name && new File(imagesDir, name).exists;
  } catch {
    return false;
  }
}

export function deleteImage(name) {
  if (!name) return;
  try {
    const f = new File(imagesDir, name);
    if (f.exists) f.delete();
  } catch {
    /* best effort */
  }
}

// Returns the saved file name, or null if the user cancelled.
// Throws an Error with a user-friendly message on failure.
export async function pickImage(source) {
  let result;
  try {
    // quality 0.7 = compressed JPEG, keeps files small for offline use
    const options = { mediaTypes: ['images'], quality: 0.7, exif: false };
    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        throw new Error(
          perm.canAskAgain
            ? 'Camera permission is needed to take a photo.'
            : 'Camera permission is blocked. Please enable it in your phone Settings.'
        );
      }
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }
  } catch (e) {
    if (e.message && e.message.includes('permission')) throw e;
    throw new Error('Could not open the ' + (source === 'camera' ? 'camera' : 'gallery') + '.');
  }

  if (result.canceled || !result.assets || !result.assets.length) return null;

  try {
    ensureDir();
    const uri = result.assets[0].uri;
    const match = /\.(\w{3,4})(?:\?|$)/.exec(uri);
    const name = `${Date.now()}.${match ? match[1] : 'jpg'}`;
    new File(uri).copy(new File(imagesDir, name));
    return name;
  } catch {
    throw new Error('Could not save the image. Storage may be full.');
  }
}
