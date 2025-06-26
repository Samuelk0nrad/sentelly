import { Client, Account, ID, Databases, Storage, Query } from "appwrite";

// Ensure environment variables are available
const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const appwriteDatabaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const appwriteCollectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID;
const appwriteStorageId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID;

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
export const databases = new Databases(client);
export const storage = new Storage(client);
export { client };

// Database and Storage IDs
export const DATABASE_ID = appwriteDatabaseId || "default";
export const COLLECTION_ID = appwriteCollectionId || "words";
export const STORAGE_ID = appwriteStorageId || "pronunciation";

// Word interface matching Appwrite structure
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

// Check if word exists in database
export const getWordFromDatabase = async (word: string): Promise<WordDocument | null> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal("word", word.toLowerCase())]
    );
    
    if (response.documents.length > 0) {
      return response.documents[0] as WordDocument;
    }
    return null;
  } catch (error) {
    console.error("Error fetching word from database:", error);
    return null;
  }
};

// Save word to database
export const saveWordToDatabase = async (wordData: Omit<WordDocument, '$id' | '$createdAt' | '$updatedAt'>): Promise<WordDocument | null> => {
  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        ...wordData,
        word: wordData.word.toLowerCase(),
        examples: wordData.examples || [],
        synonyms: wordData.synonyms || []
      }
    );
    return document as WordDocument;
  } catch (error) {
    console.error("Error saving word to database:", error);
    return null;
  }
};

// Update word with pronunciation ID
export const updateWordPronunciation = async (documentId: string, pronunciationId: string): Promise<WordDocument | null> => {
  try {
    const document = await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      documentId,
      { pronunciation_id: pronunciationId }
    );
    return document as WordDocument;
  } catch (error) {
    console.error("Error updating word pronunciation:", error);
    return null;
  }
};

// Save audio file to storage
export const saveAudioToStorage = async (audioBlob: Blob, fileName: string): Promise<string | null> => {
  try {
    const file = new File([audioBlob], fileName, { type: 'audio/mpeg' });
    const response = await storage.createFile(
      STORAGE_ID,
      ID.unique(),
      file
    );
    return response.$id;
  } catch (error) {
    console.error("Error saving audio to storage:", error);
    return null;
  }
};

// Get audio file URL from storage
export const getAudioUrl = async (fileId: string): Promise<string | null> => {
  try {
    const result = storage.getFileView(STORAGE_ID, fileId);
    return result.href;
  } catch (error) {
    console.error("Error getting audio URL:", error);
    return null;
  }
};

// Download audio file from storage
export const downloadAudioFromStorage = async (fileId: string): Promise<Blob | null> => {
  try {
    const result = await storage.getFileDownload(STORAGE_ID, fileId);
    return result;
  } catch (error) {
    console.error("Error downloading audio from storage:", error);
    return null;
  }
};

// Auth functions (existing)
export const login = async (email: string, password: string) => {
  try {
    const session = await account.createEmailSession(email, password);
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