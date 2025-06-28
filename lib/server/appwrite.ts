import { ID } from "appwrite";
import { InputFile } from "node-appwrite/file";

const sdk = require("node-appwrite");

// Ensure environment variables are available
const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const appwriteApiKey = process.env.NEXT_PUBLIC_APPWRITE_API_KEY;
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const appwriteDatabaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const appwriteCollectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID;
const appwriteActivityCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_ACTIVITY_COLLECTION_ID;
const appwriteStorageId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID;

if (!appwriteEndpoint || !appwriteProjectId) {
  console.warn("Appwrite environment variables are not set");
}

const client = new sdk.Client();

client
  .setEndpoint(appwriteEndpoint)
  .setProject(appwriteProjectId)
  .setKey(appwriteApiKey);

// Only set endpoint and project if they exist
if (appwriteEndpoint) {
  client.setEndpoint(appwriteEndpoint);
}
if (appwriteProjectId) {
  client.setProject(appwriteProjectId);
}

export const databases = new sdk.Databases(client);
export const storage = new sdk.Storage(client);
export { client, ID };

// Database and Storage IDs
export const DATABASE_ID = appwriteDatabaseId || "default";
export const COLLECTION_ID = appwriteCollectionId || "words";
export const ACTIVITY_COLLECTION_ID =
  appwriteActivityCollectionId || "activities";
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
  originalWord?: string;
  suggestedWord?: string;
  alternativeSuggestions?: string[];
  isCorrectionSuggested?: boolean;
  $createdAt?: string;
  $updatedAt?: string;
}

// Activity tracking interface
export interface ActivityDocument {
  $id?: string;
  user_id?: string; // null for anonymous users
  user_email?: string; // for easier identification
  activity_type:
    | "word_search"
    | "audio_generation"
    | "user_registration"
    | "user_login"
    | "spelling_correction_dismissed"
    | "spelling_correction_accepted";
  word_searched?: string;
  response_source: "database" | "gemini" | "cache" | "error";
  tokens_used?: number;
  response_time: number;
  success: boolean;
  error_message?: string;
  user_agent?: string;
  ip_address?: string;
  session_id?: string;
  metadata?: {
    gemini_model?: string;
    audio_duration_ms?: number;
    cache_hit?: boolean;
    original_word?: string;
    suggested_word?: string;
    clicked_word?: string;
    correction_source?: string;
    [key: string]: any;
  };
  $createdAt?: string;
  $updatedAt?: string;
}

// Check if word exists in database
export const getWordFromDatabase = async (
  word: string,
): Promise<WordDocument | null> => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      sdk.Query.equal("word", word.toLowerCase()),
    ]);

    if (response.documents.length > 0) {
      return response.documents[0] as unknown as WordDocument;
    }
    return null;
  } catch (error) {
    console.error("Error fetching word from database:", error);
    return null;
  }
};

// Save word to database
export const saveWordToDatabase = async (
  wordData: Omit<WordDocument, "$id" | "$createdAt" | "$updatedAt">,
): Promise<WordDocument | null> => {
  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        ...wordData,
        word: wordData.word.toLowerCase(),
        examples: wordData.examples || [],
        synonyms: wordData.synonyms || [],
      },
    );
    return document as unknown as WordDocument;
  } catch (error) {
    console.error("Error saving word to database:", error);
    return null;
  }
};

// Update word with pronunciation ID
export const updateWordPronunciation = async (
  documentId: string,
  pronunciationId: string,
): Promise<WordDocument | null> => {
  try {
    const document = await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      documentId,
      { pronunciation_id: pronunciationId },
    );
    return document as unknown as WordDocument;
  } catch (error) {
    console.error("Error updating word pronunciation:", error);
    return null;
  }
};

export const saveAudioToStorage = async (
  audioBlob: Blob,
  fileName: string,
): Promise<string | null> => {
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ Wrap buffer in Appwrite-compatible InputFile
    const file = InputFile.fromBuffer(buffer, fileName);
    const response = await storage.createFile(STORAGE_ID, ID.unique(), file);

    return response.$id;
  } catch (error) {
    console.error(`❌ Appwrite: Error saving audio to storage:`, {
      fileName: fileName,
      storageId: STORAGE_ID,
      error: error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
};

// Get audio file data from storage
export const getAudioData = async (
  fileId: string,
): Promise<Uint8Array | null> => {
  try {
    const result = await storage.getFileDownload(STORAGE_ID, fileId);

    return result;
  } catch (error) {
    console.error(`❌ Appwrite: Error getting audio data:`, {
      fileId: fileId,
      storageId: STORAGE_ID,
      error: error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
};

// Activity tracking functions
export const logActivity = async (
  activityData: Omit<ActivityDocument, "$id" | "$createdAt" | "$updatedAt">,
): Promise<ActivityDocument | null> => {
  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      ACTIVITY_COLLECTION_ID,
      ID.unique(),
      {
        ...activityData,
        word_searched: activityData.word_searched?.toLowerCase(),
        metadata: activityData.metadata || {},
      },
    );
    return document as unknown as ActivityDocument;
  } catch (error) {
    console.error("Error logging activity:", error);
    return null;
  }
};

// Get user activities (for analytics)
export const getUserActivities = async (
  userId?: string,
  limit: number = 100,
): Promise<ActivityDocument[]> => {
  try {
    const queries = [sdk.Query.orderDesc("$createdAt"), sdk.Query.limit(limit)];

    if (userId) {
      queries.push(sdk.Query.equal("user_id", userId));
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      ACTIVITY_COLLECTION_ID,
      queries,
    );

    return response.documents as unknown as ActivityDocument[];
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return [];
  }
};

// Get activity analytics
export const getActivityAnalytics = async (
  timeframe: "day" | "week" | "month" = "day",
): Promise<{
  totalSearches: number;
  uniqueWords: number;
  totalTokensUsed: number;
  averageResponseTime: number;
  successRate: number;
  sourceBreakdown: { database: number; gemini: number; error: number };
}> => {
  try {
    const now = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      ACTIVITY_COLLECTION_ID,
      [
        sdk.Query.equal("activity_type", "word_search"),
        sdk.Query.greaterThanEqual("$createdAt", startDate.toISOString()),
        sdk.Query.limit(10000), // Adjust based on your needs
      ],
    );

    const activities = response.documents as unknown as ActivityDocument[];

    const totalSearches = activities.length;
    const uniqueWords = new Set(
      activities.map((a) => a.word_searched).filter(Boolean),
    ).size;
    const totalTokensUsed = activities.reduce(
      (sum, a) => sum + (a.tokens_used || 0),
      0,
    );
    const averageResponseTime =
      activities.reduce((sum, a) => sum + a.response_time, 0) / totalSearches ||
      0;
    const successfulSearches = activities.filter((a) => a.success).length;
    const successRate =
      totalSearches > 0 ? (successfulSearches / totalSearches) * 100 : 0;

    const sourceBreakdown = activities.reduce(
      (acc, a) => {
        acc[a.response_source as keyof typeof acc] =
          (acc[a.response_source as keyof typeof acc] || 0) + 1;
        return acc;
      },
      { database: 0, gemini: 0, error: 0 } as {
        database: number;
        gemini: number;
        error: number;
      },
    );

    return {
      totalSearches,
      uniqueWords,
      totalTokensUsed,
      averageResponseTime: Math.round(averageResponseTime),
      successRate: Math.round(successRate * 100) / 100,
      sourceBreakdown,
    };
  } catch (error) {
    console.error("Error fetching activity analytics:", error);
    return {
      totalSearches: 0,
      uniqueWords: 0,
      totalTokensUsed: 0,
      averageResponseTime: 0,
      successRate: 0,
      sourceBreakdown: { database: 0, gemini: 0, error: 0 },
    };
  }
};
