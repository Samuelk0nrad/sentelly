# User Activity Tracking System

## Overview

This comprehensive activity tracking system monitors all user interactions with detailed analytics including token usage, response times, and user behavior patterns.

## Features Implemented

### 1. **Activity Collection Schema**
- **Collection Name**: `activities`
- **Tracks**: Word searches, audio generation, user registration, login/logout
- **Data Points**: Response times, token usage, success rates, error messages
- **User Context**: User ID, email, session ID, IP address, user agent

### 2. **Activity Types Tracked**
- `word_search` - When users search for word definitions
- `audio_generation` - When users play pronunciation audio
- `user_registration` - New user account creation
- `user_login` - User authentication events

### 3. **Token Usage Tracking**
- **Gemini API**: Tracks actual token consumption from API responses
- **Fallback Estimation**: Character-based estimation when metadata unavailable
- **Cost Analysis**: Enables cost tracking and optimization

### 4. **Performance Monitoring**
- **Response Times**: Millisecond-precision timing for all operations
- **Success Rates**: Track success/failure ratios
- **Error Tracking**: Detailed error messages and types
- **Cache Hit Rates**: Monitor database vs API usage

### 5. **User Session Tracking**
- **Session IDs**: Persistent session tracking across page reloads
- **Anonymous Users**: Track activity even for non-registered users
- **User Context**: Link activities to specific users when authenticated

## Database Schema

### Activities Collection Attributes

```typescript
interface ActivityDocument {
  $id?: string;
  user_id?: string;           // Appwrite user ID (null for anonymous)
  user_email?: string;        // User email for easier identification
  activity_type: string;      // "word_search" | "audio_generation" | "user_registration" | "user_login"
  word_searched?: string;     // The word that was searched (lowercase)
  response_source: string;    // "database" | "gemini" | "cache" | "error"
  tokens_used?: number;       // Number of tokens consumed (for Gemini calls)
  response_time_ms: number;   // Response time in milliseconds
  success: boolean;           // Whether the operation succeeded
  error_message?: string;     // Error details if operation failed
  user_agent?: string;        // Browser/device information
  ip_address?: string;        // User's IP address
  session_id?: string;        // Session identifier
  metadata?: object;          // Additional context data
  $createdAt?: string;        // Timestamp
  $updatedAt?: string;        // Last modified
}
```

## API Endpoints

### 1. **Activity Logging** - `POST /api/activity`
- Logs individual user activities
- Captures IP address from request headers
- Returns activity ID on success

### 2. **Activity Retrieval** - `GET /api/activity`
- Query parameters: `user_id`, `limit`
- Returns paginated activity history
- Useful for user dashboards

### 3. **Analytics Dashboard** - `GET /api/analytics`
- Query parameters: `timeframe` (day/week/month)
- Returns aggregated analytics:
  - Total searches
  - Unique words searched
  - Total tokens consumed
  - Average response time
  - Success rate percentage
  - Source breakdown (database vs Gemini)

## Implementation Details

### 1. **Server-Side Tracking**
- **Dictionary API** (`/api/dictionary`): Tracks word searches with token usage
- **TTS API** (`/api/tts`): Tracks audio generation requests
- **Automatic Logging**: All API calls automatically log activities

### 2. **Client-Side Tracking**
- **Performance Measurement**: High-precision timing using `performance.now()`
- **Session Management**: Persistent session IDs in localStorage
- **User Context**: Automatically includes user information when available
- **Error Handling**: Graceful failure - tracking errors don't disrupt user experience

### 3. **Token Usage Extraction**
- **Primary Method**: Extract from Gemini API response metadata
- **Fallback Method**: Character-based estimation (1 token ≈ 4 characters)
- **Accuracy**: Provides reliable cost tracking for API usage

## Setup Instructions

### 1. **Create Appwrite Collection**
```bash
Collection Name: activities
Database: [Your existing database]
```

### 2. **Collection Attributes**
Create these attributes in your Appwrite console:

| Attribute | Type | Size | Required | Default |
|-----------|------|------|----------|---------|
| user_id | String | 255 | No | null |
| user_email | String | 255 | No | null |
| activity_type | String | 50 | Yes | - |
| word_searched | String | 255 | No | null |
| response_source | String | 50 | Yes | - |
| tokens_used | Integer | - | No | null |
| response_time_ms | Integer | - | Yes | - |
| success | Boolean | - | Yes | - |
| error_message | String | 1000 | No | null |
| user_agent | String | 500 | No | null |
| ip_address | String | 45 | No | null |
| session_id | String | 255 | No | null |
| metadata | String | 2000 | No | {} |

### 3. **Environment Variables**
Add to your `.env.local`:
```env
# Existing Appwrite variables...
NEXT_PUBLIC_APPWRITE_ACTIVITY_COLLECTION_ID=activities
```

### 4. **Permissions**
Set appropriate read/write permissions for the activities collection:
- **Create**: Any authenticated user
- **Read**: User can read their own activities
- **Update**: Admin only
- **Delete**: Admin only

## Analytics Insights

### 1. **User Behavior**
- Most searched words
- Peak usage times
- User retention patterns
- Feature adoption rates

### 2. **Performance Metrics**
- API response times
- Cache hit rates
- Error frequencies
- Success rates by feature

### 3. **Cost Analysis**
- Token consumption patterns
- API usage costs
- Optimization opportunities
- ROI on caching strategies

### 4. **Technical Insights**
- Browser/device usage
- Geographic distribution
- Session lengths
- Error patterns

## Usage Examples

### Track a Custom Activity
```typescript
import { trackActivity } from "@/lib/utils/activity-tracker";

await trackActivity({
  user_id: currentUser?.id,
  user_email: currentUser?.email,
  activity_type: "word_search",
  word_searched: "example",
  response_source: "gemini",
  tokens_used: 150,
  response_time_ms: 1250,
  success: true,
  metadata: {
    custom_field: "value"
  }
});
```

### Get Analytics Data
```typescript
const response = await fetch("/api/analytics?timeframe=week");
const { analytics } = await response.json();

console.log(`Total searches: ${analytics.totalSearches}`);
console.log(`Tokens used: ${analytics.totalTokensUsed}`);
console.log(`Success rate: ${analytics.successRate}%`);
```

## Benefits

1. **Data-Driven Decisions**: Make informed product decisions based on actual usage
2. **Cost Optimization**: Track and optimize API costs through token monitoring
3. **Performance Monitoring**: Identify and fix performance bottlenecks
4. **User Experience**: Understand user behavior to improve features
5. **Error Tracking**: Proactive error detection and resolution
6. **Business Intelligence**: Generate insights for stakeholders

This comprehensive tracking system provides deep insights into your application's usage patterns, performance characteristics, and user behavior while maintaining user privacy and system performance.