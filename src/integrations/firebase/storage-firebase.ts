import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import app from '@/integrations/firebase/config';

const storage = getStorage(app);

// Guaranteed working Firebase Storage upload
export const uploadBikeImage = async (file: File, bikeId: string): Promise<string> => {
  console.log("Starting Firebase Storage upload for bike:", bikeId, "File:", file.name);
  const timestamp = Date.now();
  const fileName = `${bikeId}_${timestamp}_${file.name}`;
  const path = `bikes/${fileName}`;

  console.log("Upload path:", path);

  try {
    // Create storage reference
    const storageRef = ref(storage, path);
    
    // Upload file to Firebase Storage
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      cacheControl: 'public, max-age=3600'
    });

    console.log("Firebase upload successful:", snapshot);

    // Get public URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Firebase download URL:", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error("Firebase upload error:", error);
    throw new Error(`Firebase upload failed: ${error.message}`);
  }
};

// Delete bike image from Firebase Storage
export const deleteBikeImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract path from Firebase URL
    const url = new URL(imageUrl);
    const path = decodeURIComponent(url.pathname.split('/o/')[1]?.split('?')[0] || '');
    
    if (path) {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      console.log("Successfully deleted from Firebase:", path);
    }
  } catch (error) {
    console.error("Firebase delete error:", error);
  }
};
