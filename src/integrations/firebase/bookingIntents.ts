import { ref, push, set, get, query, orderByChild, limitToLast, onValue, off } from "firebase/database";
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
