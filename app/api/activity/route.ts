import { NextResponse } from "next/server";
import { logActivity } from "@/lib/server/appwrite";
import { ActivityDocument } from "@/lib/server/appwrite";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extract IP address from request headers
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";
    
    const activityData: Omit<ActivityDocument, "$id" | "$createdAt" | "$updatedAt"> = {
      user_id: body.user_id || null,
      user_email: body.user_email || null,
      activity_type: body.activity_type,
      word_searched: body.word_searched || null,
      response_source: body.response_source,
      tokens_used: body.tokens_used || null,
      response_time_ms: body.response_time_ms,
      success: body.success,
      error_message: body.error_message || null,
      user_agent: body.user_agent || null,
      ip_address: ip,
      session_id: body.session_id || null,
      metadata: body.metadata || {},
    };

    const result = await logActivity(activityData);
    
    if (result) {
      return NextResponse.json({ success: true, id: result.$id });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to log activity" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Activity logging error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
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
      { status: 500 }
    );
  }
}