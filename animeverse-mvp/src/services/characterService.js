import { loadFirebase } from "../lib/firebase";

/**
 * Upload a character model and metadata to Firebase
 * @param {File} modelFile - The .glb file to upload
 * @param {Object} metadata - Character information (name, description, etc.)
 * @param {Function} onProgress - Callback for upload progress (0-100)
 * @returns {Promise<Object>} - The created character document
 */
export async function uploadCharacter(modelFile, metadata, onProgress) {
  const { storage, db } = await loadFirebase();
  const [{ ref, uploadBytesResumable, getDownloadURL }, firestore] =
    await Promise.all([import("firebase/storage"), import("firebase/firestore")]);
  const { collection, addDoc, serverTimestamp } = firestore;

  // Validate file type
  if (!modelFile.name.endsWith(".glb") && !modelFile.name.endsWith(".gltf")) {
    throw new Error("Only .glb and .gltf files are supported");
  }

  // Generate unique ID for this character
  const characterId = `char_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  // Create reference for storage
  const storageRef = ref(storage, `models/${characterId}.glb`);

  // Upload file with progress tracking
  const uploadTask = uploadBytesResumable(storageRef, modelFile);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Progress callback
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        // Error callback
        reject(error);
      },
      async () => {
        // Success callback
        try {
          // Get download URL
          const modelUrl = await getDownloadURL(uploadTask.snapshot.ref);

          // Save metadata to Firestore
          const characterData = {
            ...metadata,
            modelUrl,
            characterId,
            createdAt: serverTimestamp(),
            fileSize: modelFile.size,
            fileName: modelFile.name,
          };

          const docRef = await addDoc(
            collection(db, "characters"),
            characterData
          );

          resolve({
            id: docRef.id,
            ...characterData,
            modelUrl, // Include the URL in response
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/**
 * Get all characters from Firestore
 * @returns {Promise<Array>} - Array of character objects
 */
export async function getAllCharacters() {
  try {
    const { db } = await loadFirebase();
    const { collection, getDocs } = await import("firebase/firestore");

    const querySnapshot = await getDocs(collection(db, "characters"));
    const characters = [];

    querySnapshot.forEach((doc) => {
      characters.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return characters;
  } catch (error) {
    // Network/auth failures must not take down the static exhibit list.
    console.error("Error fetching characters:", error);
    return [];
  }
}

/**
 * Delete a character and its model file
 * @param {string} characterId - The character document ID
 * @returns {Promise<void>}
 */
export async function deleteCharacter(characterId) {
  const { db } = await loadFirebase();
  const { deleteDoc, doc } = await import("firebase/firestore");

  try {
    // Delete from Firestore
    await deleteDoc(doc(db, "characters", characterId));

    // Note: File deletion from Storage would require additional setup
    // For now, just delete the database entry
    console.log("Character deleted from database");
  } catch (error) {
    console.error("Error deleting character:", error);
    throw error;
  }
}