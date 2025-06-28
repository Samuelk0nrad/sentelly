import { NextResponse } from "next/server";
import { logActivity } from "@/lib/server/appwrite";
import { ActivityDocument } from "@/lib/server/appwrite";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extract IP address from request headers with better fallback handling
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const cfConnectingIp = request.headers.get("cf-connecting-ip"); // Cloudflare
    const xClientIp = request.headers.get("x-client-ip");

    let ipAddress = "unknown";

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

    const activityData: Omit<
      ActivityDocument,
      "$id" | "$createdAt" | "$updatedAt"
    > = {
      user_id: body.user_id || undefined,
      user_email: body.user_email || undefined,
      activity_type: body.activity_type,
      word_searched: body.word_searched?.toLowerCase() || undefined,
      response_source: body.response_source,
      tokens_used: body.tokens_used || undefined,
      response_time: body.response_time,
      success: body.success,
      error_message: body.error_message || undefined,
      user_agent: body.user_agent || undefined,
      ip_address: ipAddress,
      session_id: body.session_id || undefined,
      metadata: body.metadata || {},
    };

    const result = await logActivity(activityData);

    if (result) {
      return NextResponse.json({ success: true, id: result.$id });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to log activity" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Activity logging error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Optional: GET endpoint for retrieving activities (admin use)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const limit = parseInt(searchParams.get("limit") || "100");

    // You might want to add authentication here for admin access
    const { getUserActivities } = await import("@/lib/server/appwrite");
    const activities = await getUserActivities(userId || undefined, limit);

    return NextResponse.json({ success: true, activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activities" },
      { status: 500 },
    );
  }
}
