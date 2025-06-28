// Client-side activity tracking utilities
export interface ActivityTrackingData {
  user_id?: string;
  user_email?: string;
  activity_type:
    | "word_search"
    | "audio_generation"
    | "user_registration"
    | "user_login"
    | "spelling_correction_accepted"
    | "spelling_correction_dismissed";
  word_searched?: string;
  response_source: "database" | "gemini" | "cache" | "error";
  tokens_used?: number;
  response_time: number;
  success: boolean;
  error_message?: string;
  session_id?: string;
  user_agent?: string;
  metadata?: {
    gemini_model?: string;
    audio_duration_ms?: number;
    cache_hit?: boolean;
    [key: string]: any;
  };
}

// Generate a session ID for tracking user sessions
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create session ID from localStorage
export const getSessionId = (): string => {
  if (typeof window === "undefined") return generateSessionId();

  let sessionId = localStorage.getItem("sentelly_session_id");
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem("sentelly_session_id", sessionId);
  }
  return sessionId;
};

// Track activity by sending to API
export const trackActivity = async (
  data: ActivityTrackingData,
): Promise<void> => {
  try {
    // Only track on client-side to avoid server-side fetch issues
    if (typeof window === "undefined") {
      console.log("Skipping activity tracking on server-side");
      return;
    }

    const sessionId = getSessionId();
    const userAgent = window.navigator.userAgent;

    const activityData = {
      ...data,
      session_id: sessionId,
      user_agent: userAgent,
      // IP address will be captured on the server side
    };

    await fetch("/api/activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activityData),
    });
  } catch (error) {
    console.error("Failed to track activity:", error);
    // Don't throw error to avoid disrupting user experience
  }
};

// Performance measurement utility
export class PerformanceTracker {
  private startTime: number;
  private endTime?: number;

  constructor() {
    this.startTime = performance.now();
  }

  end(): number {
    this.endTime = performance.now();
    return Math.round(this.endTime - this.startTime);
  }

  getDuration(): number {
    if (this.endTime) {
      return Math.round(this.endTime - this.startTime);
    }
    return Math.round(performance.now() - this.startTime);
  }
}

// Utility to extract token usage from Gemini response
export const extractTokenUsage = (response: any): number => {
  try {
    // Gemini API typically returns usage metadata
    if (response?.usageMetadata?.totalTokenCount) {
      return response.usageMetadata.totalTokenCount;
    }
    if (response?.usage?.total_tokens) {
      return response.usage.total_tokens;
    }
    // Fallback: estimate based on response length
    const responseText = JSON.stringify(response);
    return Math.ceil(responseText.length / 4); // Rough estimation: 1 token ≈ 4 characters
  } catch (error) {
    console.error("Error extracting token usage:", error);
    return 0;
  }
};
