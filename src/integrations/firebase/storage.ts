import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./config";

const BIKES_IMAGES_PATH = "bikes/images";

// Upload bike image
export const uploadBikeImage = async (file: File, bikeId: string): Promise<string> => {
  const timestamp = Date.now();
  const fileName = `${bikeId}_${timestamp}_${file.name}`;
  const storageRef = ref(storage, `${BIKES_IMAGES_PATH}/${fileName}`);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
};

// Delete bike image
export const deleteBikeImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the path from the URL
    const url = new URL(imageUrl);
    const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    // Don't throw - image might not exist or be from external source
  }
};
