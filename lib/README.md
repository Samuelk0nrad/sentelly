# Appwrite Configuration

This project now uses separate Appwrite configurations for client-side and server-side operations.

## File Structure

### `lib/client/appwrite.ts`

- **Purpose**: Client-side Appwrite operations
- **SDK**: Standard `appwrite` package
- **Usage**: Components, contexts, and client-side code
- **Functions**:
  - `login()` - User authentication
  - `register()` - User registration
  - `logout()` - User logout
  - `getCurrentUser()` - Get current user data
  - `account` - Account service instance
  - `ID` - ID utility for generating unique IDs

### `lib/server/appwrite.ts`

- **Purpose**: Server-side Appwrite operations (API routes)
- **SDK**: `node-appwrite` package
- **Usage**: API routes and server-side functions
- **Functions**:
  - `getWordFromDatabase()` - Fetch words from database
  - `saveWordToDatabase()` - Save words to database
  - `updateWordPronunciation()` - Update word with audio ID
  - `saveAudioToStorage()` - Save audio files to storage
  - `downloadAudioFromStorage()` - Download audio from storage
  - `getAudioUrl()` - Get audio file URLs
  - `databases` - Database service instance
  - `storage` - Storage service instance

## Usage Examples

### Client-side (Components/Contexts)

```typescript
import { login, register, logout, account } from "@/lib/client/appwrite";
```

### Server-side (API Routes)

```typescript
import {
  getWordFromDatabase,
  saveWordToDatabase,
  saveAudioToStorage,
} from "@/lib/server/appwrite";
```

## Environment Variables

Both configurations use the same environment variables:

- `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
- `NEXT_PUBLIC_APPWRITE_API_KEY` (server-side only)
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
- `NEXT_PUBLIC_APPWRITE_COLLECTION_ID`
- `NEXT_PUBLIC_APPWRITE_STORAGE_ID`

## Key Differences

1. **Client SDK**: Uses browser-compatible methods like `createEmailPasswordSession()`
2. **Server SDK**: Uses Node.js SDK with API key authentication for administrative operations
3. **Function Distribution**: Auth functions on client, database/storage operations on server
4. **Security**: Server-side operations use API key, client-side uses user sessions
