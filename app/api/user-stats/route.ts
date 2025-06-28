import { NextResponse } from "next/server";
import { getUserActivities } from "@/lib/server/appwrite";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    // Fetch user activities (last 100)
    const activities = await getUserActivities(userId, 100);

    // Calculate statistics
    const wordSearches = activities.filter(
      (a) => a.activity_type === "word_search",
    );
    const audioGenerations = activities.filter(
      (a) => a.activity_type === "audio_generation",
    );

    const totalSearches = wordSearches.length;
    const totalAudioGenerations = audioGenerations.length;
    const totalTokensUsed = activities.reduce(
      (sum, a) => sum + (a.tokens_used || 0),
      0,
    );

    const successfulActivities = activities.filter((a) => a.success);
    const successRate =
      activities.length > 0
        ? (successfulActivities.length / activities.length) * 100
        : 0;

    const averageResponseTime =
      activities.length > 0
        ? Math.round(
            activities.reduce((sum, a) => sum + a.response_time, 0) /
              activities.length,
          )
        : 0;

    const uniqueWordsSearched = new Set(
      wordSearches
        .filter((a) => a.word_searched)
        .map((a) => a.word_searched!.toLowerCase()),
    ).size;

    const sourceBreakdown = activities.reduce(
      (acc, a) => {
        if (a.response_source === "database") acc.database++;
        else if (a.response_source === "gemini") acc.gemini++;
        else acc.error++;
        return acc;
      },
      { database: 0, gemini: 0, error: 0 },
    );

    // Get recent activity (last 20 items)
    const recentActivity = activities.slice(0, 20);

    const stats = {
      totalSearches,
      totalAudioGenerations,
      totalTokensUsed,
      averageResponseTime,
      successRate: Math.round(successRate * 100) / 100,
      uniqueWordsSearched,
      sourceBreakdown,
      recentActivity,
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user statistics" },
      { status: 500 },
    );
  }
}
