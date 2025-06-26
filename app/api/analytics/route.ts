import { NextResponse } from "next/server";
import { getActivityAnalytics } from "@/lib/server/appwrite";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") as "day" | "week" | "month" || "day";
    
    // You might want to add authentication here for admin access
    const analytics = await getActivityAnalytics(timeframe);
    
    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}