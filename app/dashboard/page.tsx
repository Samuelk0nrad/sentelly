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
  XCircle
} from "lucide-react";
import { getCurrentUser } from "@/lib/client/appwrite";
import { useToast } from "@/hooks/use-toast";

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
    response_time_ms: number;
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

        // Fetch user statistics
        const statsResponse = await fetch(`/api/user-stats?user_id=${data.$id}`);
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
      localStorage.setItem(`user_settings_${user.$id}`, JSON.stringify(newSettings));
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
          <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-200 border-blue-400/30">
            <Database className="w-3 h-3 mr-1" />
            Cached
          </Badge>
        );
      case "gemini":
        return (
          <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-200 border-purple-400/30">
            <Sparkles className="w-3 h-3 mr-1" />
            AI
          </Badge>
        );
      case "error":
        return (
          <Badge variant="outline" className="text-xs bg-red-500/20 text-red-200 border-red-400/30">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-white/60">Welcome back, {user.name || user.email}</p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <Card className="mb-6 border-white/20 bg-white/5 backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white">{user.name || "User"}</h2>
                <div className="flex items-center gap-2 text-white/60">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 text-white/60 mt-1">
                  <Calendar className="h-4 w-4" />
                  Member since {new Date(user.$createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-lg border border-white/20">
            <TabsTrigger value="overview" className="text-white/80 data-[state=active]:text-white data-[state=active]:bg-white/20">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-white/80 data-[state=active]:text-white data-[state=active]:bg-white/20">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white/80 data-[state=active]:text-white data-[state=active]:bg-white/20">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {stats && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-white/20 bg-white/5 backdrop-blur-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/60 text-sm">Total Searches</p>
                          <p className="text-2xl font-bold text-white">{stats.totalSearches}</p>
                        </div>
                        <Search className="h-8 w-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/20 bg-white/5 backdrop-blur-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/60 text-sm">Audio Generated</p>
                          <p className="text-2xl font-bold text-white">{stats.totalAudioGenerations}</p>
                        </div>
                        <Volume2 className="h-8 w-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/20 bg-white/5 backdrop-blur-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/60 text-sm">Tokens Used</p>
                          <p className="text-2xl font-bold text-white">{stats.totalTokensUsed.toLocaleString()}</p>
                        </div>
                        <Zap className="h-8 w-8 text-yellow-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/20 bg-white/5 backdrop-blur-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/60 text-sm">Success Rate</p>
                          <p className="text-2xl font-bold text-white">{stats.successRate.toFixed(1)}%</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-white/20 bg-white/5 backdrop-blur-lg">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Unique Words Searched</span>
                        <span className="text-white font-semibold">{stats.uniqueWordsSearched}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Average Response Time</span>
                        <span className="text-white font-semibold">{stats.averageResponseTime}ms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Cache Hit Rate</span>
                        <span className="text-white font-semibold">
                          {((stats.sourceBreakdown.database / stats.totalSearches) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/20 bg-white/5 backdrop-blur-lg">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Source Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-blue-400" />
                          <span className="text-white/60">Database Cache</span>
                        </div>
                        <span className="text-white font-semibold">{stats.sourceBreakdown.database}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-400" />
                          <span className="text-white/60">AI Generated</span>
                        </div>
                        <span className="text-white font-semibold">{stats.sourceBreakdown.gemini}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-400" />
                          <span className="text-white/60">Errors</span>
                        </div>
                        <span className="text-white font-semibold">{stats.sourceBreakdown.error}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="border-white/20 bg-white/5 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentActivity.map((activity) => (
                      <div
                        key={activity.$id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            activity.success ? "bg-green-500/20" : "bg-red-500/20"
                          }`}>
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {activity.word_searched || activity.activity_type.replace("_", " ")}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-white/60">
                              <Clock className="h-3 w-3" />
                              {formatDate(activity.$createdAt)}
                              <span>•</span>
                              <span>{activity.response_time_ms}ms</span>
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
                  <p className="text-white/60 text-center py-8">No recent activity found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-white/20 bg-white/5 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Auto-play Audio</Label>
                    <p className="text-sm text-white/60">
                      Automatically play pronunciation when viewing word definitions
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoPlayAudio}
                    onCheckedChange={(checked) => handleSettingChange("autoPlayAudio", checked)}
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
                    onCheckedChange={(checked) => handleSettingChange("enableSpellingCorrection", checked)}
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
                    onCheckedChange={(checked) => handleSettingChange("showDetailedAnalytics", checked)}
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
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-white/5 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <p className="text-white font-mono text-sm">{user.$id}</p>
                  </div>
                  <div>
                    <Label className="text-white/60">Member Since</Label>
                    <p className="text-white">{new Date(user.$createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}