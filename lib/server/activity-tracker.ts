import { logActivity, ActivityDocument } from "@/lib/server/appwrite";
import { ActivityTrackingData } from "@/lib/utils/activity-tracker";

// Server-side activity tracking (direct database call)
export const trackActivityServer = async (
  data: ActivityTrackingData,
  request?: Request,
): Promise<void> => {
  try {
    // Extract IP address from request headers
    let ipAddress = "unknown";
    if (request) {
      const forwarded = request.headers.get("x-forwarded-for");
      const realIp = request.headers.get("x-real-ip");
      const cfConnectingIp = request.headers.get("cf-connecting-ip"); // Cloudflare
      const xClientIp = request.headers.get("x-client-ip");

      if (forwarded) {
        // x-forwarded-for can contain multiple IPs, take the first (original client)
        ipAddress = forwarded.split(",")[0].trim();
      } else if (cfConnectingIp) {
        ipAddress = cfConnectingIp;
      } else if (realIp) {
        ipAddress = realIp;
      } else if (xClientIp) {
        ipAddress = xClientIp;
      }

      // Handle localhost development - provide meaningful identifier
      if (
        ipAddress === "::1" ||
        ipAddress === "127.0.0.1" ||
        ipAddress === "localhost"
      ) {
        ipAddress = "localhost-dev";
      }
    }

    const activityData: Omit<
      ActivityDocument,
      "$id" | "$createdAt" | "$updatedAt"
    > = {
      user_id: data.user_id || undefined,
      user_email: data.user_email || undefined,
      activity_type: data.activity_type,
      word_searched: data.word_searched?.toLowerCase() || undefined,
      response_source: data.response_source,
      tokens_used: data.tokens_used || undefined,
      response_time: data.response_time,
      success: data.success,
      error_message: data.error_message || undefined,
      user_agent: data.user_agent || undefined,
      ip_address: ipAddress,
      session_id: data.session_id || undefined,
      metadata: data.metadata || {},
    };

    await logActivity(activityData);
  } catch (error) {
    console.error("Failed to track activity on server:", error);
    // Don't throw error to avoid disrupting user experience
  }
};
