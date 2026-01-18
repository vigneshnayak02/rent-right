import { ref, push, set, get, query, orderByChild, limitToLast, onValue, off, remove } from "firebase/database";
import { database } from "./config";
import { BookingIntent } from "@/types/bike";

const BOOKING_INTENTS_PATH = "bookingIntents";

// Create a booking intent
export const createBookingIntent = async (intent: Omit<BookingIntent, 'id' | 'created_at'>): Promise<string> => {
  const intentsRef = ref(database, BOOKING_INTENTS_PATH);
  const newIntentRef = push(intentsRef);
  
  const intentData = {
    ...intent,
    created_at: new Date().toISOString()
  };
  
  await set(newIntentRef, intentData);
  return newIntentRef.key!;
};

// Get all booking intents (latest first)
export const getBookingIntents = async (limit?: number): Promise<BookingIntent[]> => {
  const intentsRef = ref(database, BOOKING_INTENTS_PATH);
  
  let q = query(intentsRef, orderByChild('created_at'));
  if (limit) {
    q = query(q, limitToLast(limit));
  }
  
  const snapshot = await get(q);
  
  if (!snapshot.exists()) {
    return [];
  }
  
  const intentsData = snapshot.val();
  const intents = Object.keys(intentsData).map(key => ({
    id: key,
    ...intentsData[key]
  }));
  
  // Reverse to get latest first
  return intents.reverse();
};

// Subscribe to booking intents (real-time)
export const subscribeToBookingIntents = (
  callback: (intents: BookingIntent[]) => void,
  limit?: number
): () => void => {
  const intentsRef = ref(database, BOOKING_INTENTS_PATH);
  
  let q = query(intentsRef, orderByChild('created_at'));
  if (limit) {
    q = query(q, limitToLast(limit));
  }
  
  const unsubscribe = onValue(q, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const intentsData = snapshot.val();
    const intents = Object.keys(intentsData).map(key => ({
      id: key,
      ...intentsData[key]
    }));
    
    // Reverse to get latest first
    callback(intents.reverse());
  });
  
  return () => off(intentsRef, 'value', unsubscribe);
};

// Delete a single booking intent
export const deleteBookingIntent = async (intentId: string): Promise<void> => {
  const intentRef = ref(database, `${BOOKING_INTENTS_PATH}/${intentId}`);
  await remove(intentRef);
};

// Delete all booking intents
export const deleteAllBookingIntents = async (): Promise<void> => {
  const intentsRef = ref(database, BOOKING_INTENTS_PATH);
  await remove(intentsRef);
};

// Update booking intent status
export const updateBookingIntentStatus = async (
  intentId: string, 
  booked_status: 'booked' | 'not_booked'
): Promise<void> => {
  const intentRef = ref(database, `${BOOKING_INTENTS_PATH}/${intentId}`);
  const snapshot = await get(intentRef);
  
  if (snapshot.exists()) {
    const existingData = snapshot.val();
    await set(intentRef, {
      ...existingData,
      booked_status
    });
  }
};
