import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./config";

// Admin credentials (Fixed - Owner only)
export const ADMIN_EMAIL = "psrental08@gmail.com";
export const ADMIN_PASSWORD = "Psrental@08";

// Create admin user if it doesn't exist
export const ensureAdminUser = async (): Promise<void> => {
  try {
    // Try to create the admin user
    await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("Admin user created successfully");
  } catch (error: any) {
    // If user already exists, that's fine
    if (error.code === "auth/email-already-in-use") {
      console.log("Admin user already exists");
    } else {
      console.error("Error creating admin user:", error.message);
      // Don't throw - this is a setup function
    }
  }
};

// Sign in as admin
export const signInAsAdmin = async (): Promise<void> => {
  try {
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign in as admin");
  }
};
