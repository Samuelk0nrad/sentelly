# Sentelly

**AI-Powered Dictionary & Pronunciation Guide**

Sentelly is a modern, intelligent dictionary application that provides instant word definitions, pronunciation guides, and smart spelling correction using cutting-edge AI technology. Built with Next.js and powered by Google's Gemini AI, it offers a seamless vocabulary learning experience.

 
## Features

- **🤖 AI-Powered Definitions**: Get comprehensive word definitions using Google's Gemini AI
- **🔊 Audio Pronunciation**: High-quality text-to-speech using ElevenLabs
- **✏️ Smart Spelling Correction**: Intelligent suggestions for misspelled words
- **💾 Smart Caching**: Database caching for faster repeated lookups
- **📊 User Analytics**: Personal dashboard with usage statistics
- **🔐 User Authentication**: Secure account management with Appwrite
- **📱 Responsive Design**: Beautiful UI that works on all devices
- **⚡ Real-time Performance**: Fast API responses with performance tracking

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Appwrite account
- Google AI API key
- ElevenLabs API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sentelly.git
   cd sentelly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your API keys and configuration:
   ```env
   # Appwrite Configuration
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id_here
   NEXT_PUBLIC_APPWRITE_COLLECTION_ID=words
   NEXT_PUBLIC_APPWRITE_STORAGE_ID=pronunciation
   
   # External APIs
   GOOGLE_API_KEY=your_google_api_key_here
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ How It Works

### Architecture Overview

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Next.js App  │────│  Appwrite    │────│   Google AI     │
│   (Frontend)    │    │  (Database)  │    │   (Gemini)      │
└─────────────────┘    └──────────────┘    └─────────────────┘
         │                       │                    │
         │              ┌──────────────┐             │
         └──────────────│  ElevenLabs  │─────────────┘
                        │    (TTS)     │
                        └──────────────┘
```

### Core Workflow

1. **Word Search**: User enters a word in the search interface
2. **Spelling Check**: AI analyzes for potential misspellings and suggests corrections
3. **Database Lookup**: System checks if the word definition exists in cache
4. **AI Generation**: If not cached, Gemini AI generates comprehensive definition
5. **Audio Generation**: ElevenLabs creates pronunciation audio on demand
6. **Caching**: Results are stored for future fast retrieval
7. **Analytics**: User activity is tracked for dashboard insights

### Key Components

- **Dictionary Search**: Main search interface with real-time suggestions
- **Result Display**: Beautiful card layout showing definitions, examples, and synonyms
- **Audio Player**: Integrated pronunciation with visual feedback
- **User Dashboard**: Personal analytics and usage statistics
- **Authentication**: Secure login/signup with session management

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Modern component library
- **Lucide React** - Beautiful icons

### Backend & APIs
- **Google Gemini AI** - Natural language processing
- **ElevenLabs** - Text-to-speech synthesis
- **Appwrite** - Backend-as-a-Service (Database, Auth, Storage)

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **React Hook Form** - Form management
- **Zod** - Schema validation

## Project Structure

```
sentelly/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── dictionary/    # Word definition endpoint
│   │   ├── tts/          # Text-to-speech endpoint
│   │   └── activity/     # Analytics tracking
│   ├── dashboard/        # User dashboard page
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── dictionary-search.tsx
│   ├── dictionary-result.tsx
│   └── auth-dialog.tsx
├── lib/                  # Utility libraries
│   ├── client/           # Client-side utilities
│   ├── server/           # Server-side utilities
│   └── utils/            # Shared utilities
└── public/               # Static assets
```

## Configuration

### Appwrite Setup

1. Create a new Appwrite project
2. Set up the following collections:
   - `words` - For caching word definitions
   - `activities` - For user analytics
3. Configure storage bucket for audio files
4. Set up authentication providers

### API Keys

- **Google AI**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **ElevenLabs**: Sign up at [ElevenLabs](https://elevenlabs.io/) for TTS API access
- **Appwrite**: Create project at [Appwrite Cloud](https://cloud.appwrite.io/)

## Deployment

### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Features Deep Dive

### Smart Caching System
- Database-first approach for faster responses
- Automatic fallback to AI when cache misses
- Intelligent cache invalidation

### User Analytics
- Personal usage statistics
- Response time tracking
- Token usage monitoring
- Activity history

### Audio Management
- On-demand audio generation
- Automatic caching of audio files
- High-quality voice synthesis

## Acknowledgments

- [Google AI](https://ai.google.dev/) for Gemini API
- [ElevenLabs](https://elevenlabs.io/) for text-to-speech
- [Appwrite](https://appwrite.io/) for backend services
- [Shadcn/UI](https://ui.shadcn.com/) for component library