import { ref, get, set, push, update, remove, onValue, off } from "firebase/database";
import { database } from "./config";
import { Bike } from "@/types/bike";

const BIKES_PATH = "bikes";

// Get all bikes
export const getBikes = async (): Promise<Bike[]> => {
  const bikesRef = ref(database, BIKES_PATH);
  const snapshot = await get(bikesRef);
  
  if (!snapshot.exists()) {
    return [];
  }
  
  const bikesData = snapshot.val();
  return Object.keys(bikesData).map(key => ({
    id: key,
    ...bikesData[key]
  }));
};

// Get a single bike by ID
export const getBikeById = async (id: string): Promise<Bike | null> => {
  const bikeRef = ref(database, `${BIKES_PATH}/${id}`);
  const snapshot = await get(bikeRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return {
    id,
    ...snapshot.val()
  };
};

// Create a new bike
export const createBike = async (bike: Omit<Bike, 'id'>): Promise<string> => {
  console.log("Creating bike with data:", bike);
  const bikesRef = ref(database, BIKES_PATH);
  const newBikeRef = push(bikesRef);
  
  // Filter out undefined values to prevent Firebase errors
  const filteredBikeData = Object.keys(bike).reduce((acc, key) => {
    const value = bike[key as keyof typeof bike];
    if (value !== undefined) {
      acc[key as keyof typeof acc] = value;
    }
    return acc;
  }, {} as any);
  
  const bikeData = {
    ...filteredBikeData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log("Final bike data to save:", bikeData);
  console.log("New bike ref key:", newBikeRef.key);
  
  await set(newBikeRef, bikeData);
  console.log("Bike created successfully with ID:", newBikeRef.key);
  return newBikeRef.key!;
};

// Update a bike
export const updateBike = async (id: string, updates: Partial<Bike>): Promise<void> => {
  try {
    const bikeRef = ref(database, `${BIKES_PATH}/${id}`);
    
    // Filter out undefined values to prevent Firebase errors
    const filteredUpdates = Object.keys(updates).reduce((acc, key) => {
      const value = updates[key as keyof typeof updates];
      if (value !== undefined) {
        acc[key as keyof typeof acc] = value;
      }
      return acc;
    }, {} as any);
    
    const updateData = {
      ...filteredUpdates,
      updated_at: new Date().toISOString()
    };
    
    console.log('Updating bike in Firebase:', id, updateData);
    await update(bikeRef, updateData);
    console.log('Bike updated successfully');
  } catch (error: any) {
    console.error('Error updating bike:', error);
    throw new Error(`Failed to update bike: ${error.message || error.code || 'Unknown error'}`);
  }
};

// Delete a bike
export const deleteBike = async (id: string): Promise<void> => {
  const bikeRef = ref(database, `${BIKES_PATH}/${id}`);
  await remove(bikeRef);
};

// Update bike status
export const updateBikeStatus = async (id: string, status: Bike['status']): Promise<void> => {
  await updateBike(id, { status });
};

// Subscribe to bikes changes (real-time)
export const subscribeToBikes = (callback: (bikes: Bike[]) => void): () => void => {
  const bikesRef = ref(database, BIKES_PATH);
  
  const unsubscribe = onValue(
    bikesRef, 
    (snapshot) => {
      try {
        if (!snapshot.exists()) {
          callback([]);
          return;
        }
        
        const bikesData = snapshot.val();
        const bikes = Object.keys(bikesData).map(key => ({
          id: key,
          ...bikesData[key]
        }));
        
        callback(bikes);
      } catch (error) {
        console.error('Error processing bikes data:', error);
        callback([]);
      }
    },
    (error) => {
      console.error('Firebase subscription error:', error);
      // Try to fetch bikes once as fallback
      getBikes().then(bikes => callback(bikes)).catch(() => callback([]));
    }
  );
  
  return () => {
    try {
      off(bikesRef, 'value', unsubscribe);
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };
};
