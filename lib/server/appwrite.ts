import { ID } from "appwrite";
import { InputFile } from "node-appwrite/file";

const sdk = require("node-appwrite");

// Ensure environment variables are available
const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const appwriteApiKey = process.env.NEXT_PUBLIC_APPWRITE_API_KEY;
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const appwriteDatabaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const appwriteCollectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID;
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
    console.log(`🔍 Appwrite: Starting audio save process:`, {
      fileName: fileName,
      blobSize: audioBlob.size,
      blobType: audioBlob.type,
      storageId: STORAGE_ID
    });

    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`🔄 Appwrite: Converted blob to buffer:`, {
      bufferSize: buffer.length,
      fileName: fileName
    });

    // ✅ Wrap buffer in Appwrite-compatible InputFile
    const file = InputFile.fromBuffer(buffer, fileName);

    console.log(`📁 Appwrite: Creating InputFile and uploading to storage...`);

    const response = await storage.createFile(STORAGE_ID, ID.unique(), file);

    console.log(`✅ Appwrite: File uploaded successfully:`, {
      fileId: response.$id,
      fileName: fileName,
      bucketId: response.bucketId,
      sizeOriginal: response.sizeOriginal,
      mimeType: response.mimeType
    });

    return response.$id;
  } catch (error) {
    console.error(`❌ Appwrite: Error saving audio to storage:`, {
      fileName: fileName,
      storageId: STORAGE_ID,
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
};

// Get audio file data from storage
export const getAudioData = async (fileId: string): Promise<Uint8Array | null> => {
  try {
    console.log(`🔍 Appwrite: Attempting to download file with ID: ${fileId}`);
    console.log(`📂 Storage bucket ID: ${STORAGE_ID}`);
    
    const result = await storage.getFileDownload(STORAGE_ID, fileId);
    
    console.log(`✅ Appwrite: Audio data retrieved successfully:`, {
      fileId: fileId,
      dataType: result.constructor.name,
      sizeBytes: result.byteLength,
      sizeKB: Math.round(result.byteLength / 1024 * 100) / 100,
      isUint8Array: result instanceof Uint8Array
    });
    
    return result;
  } catch (error) {
    console.error(`❌ Appwrite: Error getting audio data:`, {
      fileId: fileId,
      storageId: STORAGE_ID,
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
};
