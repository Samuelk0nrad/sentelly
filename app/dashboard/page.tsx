"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Activity,
  Settings,
  BarChart3,
  Search,
  Volume2,
  Clock,
  Zap,
  Database,
  Sparkles,
  User,
  Mail,
  Calendar,
  TrendingUp,
  Target,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { getCurrentUser } from "@/lib/client/appwrite";
import { useToast } from "@/hooks/use-toast";

// Metadata for the dashboard page
export const metadata = {
  title: "Dashboard - Sentelly | AI Dictionary Analytics & Settings",
  description: "View your word search analytics, manage preferences, and track your learning progress with Sentelly's intelligent dictionary dashboard.",
  keywords: [
    "dictionary dashboard",
    "word analytics",
    "learning progress",
    "AI dictionary stats",
    "vocabulary tracking",
    "pronunciation analytics",
    "user settings",
    "word search history"
  ],
  openGraph: {
    title: "Sentelly Dashboard - Your AI Dictionary Analytics",
    description: "Track your vocabulary learning journey with detailed analytics, pronunciation stats, and personalized settings.",
    type: "website",
    url: "https://sentelly.netlify.app/dashboard",
    siteName: "Sentelly",
    images: [
      {
        url: "https://sentelly.netlify.app/og-dashboard.png",
        width: 1200,
        height: 630,
        alt: "Sentelly Dashboard - AI Dictionary Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sentelly Dashboard - AI Dictionary Analytics",
    description: "Track your vocabulary learning with detailed word search analytics and pronunciation statistics.",
    images: ["https://sentelly.netlify.app/og-dashboard.png"],
    creator: "@sentelly",
    site: "@sentelly",
  },
  robots: {
    index: false, // Dashboard should not be indexed by search engines
    follow: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
  alternates: {
    canonical: "https://sentelly.netlify.app/dashboard",
  },
};

interface UserStats {
  totalSearches: number;
  totalAudioGenerations: number;
  totalTokensUsed: number;
  averageResponseTime: number;
  successRate: number;
  uniqueWordsSearched: number;
  sourceBreakdown: {
    database: number;
    gemini: number;
    error: number;
  };
  recentActivity: Array<{
    $id: string;
    activity_type: string;
    word_searched?: string;
    response_time: number;
    success: boolean;
    tokens_used?: number;
    response_source: string;
    $createdAt: string;
  }>;
}

interface UserSettings {
  autoPlayAudio: boolean;
  enableSpellingCorrection: boolean;
  showDetailedAnalytics: boolean;
  emailNotifications: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    autoPlayAudio: false,
    enableSpellingCorrection: true,
    showDetailedAnalytics: true,
    emailNotifications: false,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { success, data } = await getCurrentUser();
        if (!success || !data) {
          router.push("/");
          return;
        }
        setUser(data);
        console.log("Dashboard: User data received:", {
          userId: data.$id,
          userEmail: data.email,
          userName: data.name,
          fullUserObject: data,
        });

        // Fetch user statistics
        const statsUrl = `/api/user-stats?user_id=${data.$id}`;
        console.log("Dashboard: Fetching stats from:", statsUrl);
        const statsResponse = await fetch(statsUrl);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        }

        // Load settings from localStorage
        const savedSettings = localStorage.getItem(`user_settings_${data.$id}`);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, toast]);

  const handleSettingChange = (key: keyof UserSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Save to localStorage
    if (user) {
      localStorage.setItem(
        `user_settings_${user.$id}`,
        JSON.stringify(newSettings),
      );
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "word_search":
        return <Search className="h-4 w-4" />;
      case "audio_generation":
        return <Volume2 className="h-4 w-4" />;
      case "spelling_correction_accepted":
      case "spelling_correction_dismissed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "database":
        return (
          <Badge
            variant="outline"
            className="border-blue-400/30 bg-blue-500/20 text-xs text-blue-200"
          >
            <Database className="mr-1 h-3 w-3" />
            Cached
          </Badge>
        );
      case "gemini":
        return (
          <Badge
            variant="outline"
            className="border-purple-400/30 bg-purple-500/20 text-xs text-purple-200"
          >
            <Sparkles className="mr-1 h-3 w-3" />
            AI
          </Badge>
        );
      case "error":
        return (
          <Badge
            variant="outline"
            className="border-red-400/30 bg-red-500/20 text-xs text-red-200"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="light-gradient min-h-screen">
        <div className="dashboard-gradient flex min-h-screen items-center justify-center">
          <div className="text-white">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="light-gradient min-h-screen">
      <div className="dashboard-gradient min-h-screen">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
                className="rounded-full border border-white/25 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  Dashboard
                </h1>
                <p className="text-white/60">
                  Welcome back, {user.name || user.email}
                </p>
              </div>
            </div>
          </div>

          {/* User Info Card */}
          <Card className="mb-6 border border-white/50 bg-gray-300/20 backdrop-blur-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#f7a372] to-[#fdd3b8]">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-white">
                    {user.name || "User"}
                  </h2>
                  <div className="flex items-center gap-2 text-white/60">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-white/60">
                    <Calendar className="h-4 w-4" />
                    Member since {new Date(user.$createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 border border-white/50 bg-gray-300/20 backdrop-blur-2xl">
              <TabsTrigger
                value="overview"
                className="text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                <Activity className="mr-2 h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {stats && (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border border-white/50 bg-gray-300/20 backdrop-blur-2xl">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white/60">
                              Total Searches
                            </p>
                            <p className="text-2xl font-bold text-white">
                              {stats.totalSearches}
                            </p>
                          </div>
                          <Search className="h-8 w-8 text-[#f7a372]" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-white/50 bg-gray-300/20 backdrop-blur-2xl">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white/60">
                              Audio Generated
                            </p>
                            <p className="text-2xl font-bold text-white">
                              {stats.totalAudioGenerations}
                            </p>
                          </div>
                          <Volume2 className="h-8 w-8 text-[#f7a372]" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-white/50 bg-gray-300/20 backdrop-blur-2xl">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white/60">Tokens Used</p>
                            <p className="text-2xl font-bold text-white">
                              {stats.totalTokensUsed.toLocaleString()}
                            </p>
                          </div>
                          <Zap className="h-8 w-8 text-[#f7a372]" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-white/50 bg-gray-300/20 backdrop-blur-2xl">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white/60">Success Rate</p>
                            <p className="text-2xl font-bold text-white">
                              {stats.successRate.toFixed(1)}%
                            </p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-[#f7a372]" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card className="border border-white/50 bg-gray-300/20 backdrop-blur-2xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Target className="h-5 w-5 text-[#f7a372]" />
                          Performance Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">
                            Unique Words Searched
                          </span>
                          <span className="font-semibold text-white">
                            {stats.uniqueWordsSearched}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">
                            Average Response Time
                          </span>
                          <span className="font-semibold text-white">
                            {stats.averageResponseTime}ms
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Cache Hit Rate</span>
                          <span className="font-semibold text-white">
                            {(
                              (stats.sourceBreakdown.database /
                                stats.totalSearches) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border border-white/50 bg-gray-300/20 backdrop-blur-2xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Database className="h-5 w-5 text-[#f7a372]" />
                          Source Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-blue-400" />
                            <span className="text-white/60">Database Cache</span>
                          </div>
                          <span className="font-semibold text-white">
                            {stats.sourceBreakdown.database}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-400" />
                            <span className="text-white/60">AI Generated</span>
                          </div>
                          <span className="font-semibold text-white">
                            {stats.sourceBreakdown.gemini}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-400" />
                            <span className="text-white/60">Errors</span>
                          </div>
                          <span className="font-semibold text-white">
                            {stats.sourceBreakdown.error}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card className="border border-white/50 bg-gray-300/20 backdrop-blur-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Activity className="h-5 w-5 text-[#f7a372]" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentActivity.map((activity) => (
                        <div
                          key={activity.$id}
                          className="flex items-center justify-between rounded-lg border border-white/15 bg-white/5 p-3 backdrop-blur-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-full p-2 ${
                                activity.success
                                  ? "bg-green-500/20"
                                  : "bg-red-500/20"
                              }`}
                            >
                              {getActivityIcon(activity.activity_type)}
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {activity.word_searched ||
                                  activity.activity_type.replace("_", " ")}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-white/60">
                                <Clock className="h-3 w-3" />
                                {formatDate(activity.$createdAt)}
                                <span>•</span>
                                <span>{activity.response_time}ms</span>
                                {activity.tokens_used && (
                                  <>
                                    <span>•</span>
                                    <span>{activity.tokens_used} tokens</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getSourceBadge(activity.response_source)}
                            {activity.success ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-white/60">
                      No recent activity found
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="border border-white/50 bg-gray-300/20 backdrop-blur-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Settings className="h-5 w-5 text-[#f7a372]" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Auto-play Audio</Label>
                      <p className="text-sm text-white/60">
                        Automatically play pronunciation when viewing word
                        definitions
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoPlayAudio}
                      onCheckedChange={(checked) =>
                        handleSettingChange("autoPlayAudio", checked)
                      }
                    />
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Spelling Correction</Label>
                      <p className="text-sm text-white/60">
                        Enable automatic spelling correction suggestions
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableSpellingCorrection}
                      onCheckedChange={(checked) =>
                        handleSettingChange("enableSpellingCorrection", checked)
                      }
                    />
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Detailed Analytics</Label>
                      <p className="text-sm text-white/60">
                        Show detailed usage statistics and performance metrics
                      </p>
                    </div>
                    <Switch
                      checked={settings.showDetailedAnalytics}
                      onCheckedChange={(checked) =>
                        handleSettingChange("showDetailedAnalytics", checked)
                      }
                    />
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-white">Email Notifications</Label>
                      <p className="text-sm text-white/60">
                        Receive email updates about new features and improvements
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingChange("emailNotifications", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-white/50 bg-gray-300/20 backdrop-blur-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <User className="h-5 w-5 text-[#f7a372]" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-white/60">Name</Label>
                      <p className="text-white">{user.name || "Not set"}</p>
                    </div>
                    <div>
                      <Label className="text-white/60">Email</Label>
                      <p className="text-white">{user.email}</p>
                    </div>
                    <div>
                      <Label className="text-white/60">User ID</Label>
                      <p className="font-mono text-sm text-white">{user.$id}</p>
                    </div>
                    <div>
                      <Label className="text-white/60">Member Since</Label>
                      <p className="text-white">
                        {new Date(user.$createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}