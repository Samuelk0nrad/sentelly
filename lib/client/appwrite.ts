import { Client, Account, ID } from "appwrite";

// Ensure environment variables are available
const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!appwriteEndpoint || !appwriteProjectId) {
  console.warn("Appwrite environment variables are not set");
}

const client = new Client();

// Only set endpoint and project if they exist
if (appwriteEndpoint) {
  client.setEndpoint(appwriteEndpoint);
}
if (appwriteProjectId) {
  client.setProject(appwriteProjectId);
}

export const account = new Account(client);
export { client, ID };

// Word interface matching Appwrite structure (for type definitions)
export interface WordDocument {
  $id?: string;
  word: string;
  starting?: string;
  phonetic?: string;
  definition: string;
  examples?: string[];
  synonyms?: string[];
  usage: string;
  pronunciation_id?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

// Auth functions for client-side usage
export const login = async (email: string, password: string) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return { success: true, data: session };
  } catch (error: any) {
    return {
      success: false,
      error: { message: error.message || "Failed to login" },
    };
  }
};

export const register = async (
  email: string,
  password: string,
  name: string,
) => {
  try {
    const user = await account.create(ID.unique(), email, password, name);
    // After successful registration, automatically log in
    const session = await login(email, password);
    return { success: true, data: { user, session } };
  } catch (error: any) {
    return {
      success: false,
      error: { message: error.message || "Failed to create account" },
    };
  }
};

export const logout = async () => {
  try {
    await account.deleteSession("current");
    return { success: true, error: null };
  } catch (error: any) {
    return {
      success: false,
      error: { message: error.message || "Failed to logout" },
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await account.get();
    return { success: true, data: user };
  } catch (error: any) {
    return {
      success: false,
      error: { message: error.message || "Failed to get current user" },
    };
  }
};
