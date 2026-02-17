import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Coins,
  Trophy,
  GraduationCap,
  PawPrint,
  MessageCircle,
  UserPlus,
  Clock,
  Target,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Eye,
  Star,
  Zap
} from "lucide-react";

// Simple chart component using CSS
const SimpleBarChart = ({ data, maxValue, color = "bg-green-500" }) => {
  return (
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-16 truncate">{item.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-full ${color} rounded-full transition-all duration-500`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium w-12 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, change, changeType, icon: Icon, color, subtitle }) => {
  const isPositive = changeType === "positive";
  return (
    <Card className="border-0 shadow-md rounded-xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-3 text-sm ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{change}%</span>
            <span className="text-gray-400 ml-1">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const CreatorAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  const fetchAnalytics = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const response = await axios.get(`${API}/admin/analytics?range=${timeRange}`, {
        withCredentials: true
      });
      setAnalytics(response.data);
    } catch (error) {
      // If not admin, show demo data
      setAnalytics(generateDemoData());
      if (error.response?.status === 403) {
        toast.info("Showing demo analytics data");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const generateDemoData = () => {
    const now = new Date();
    return {
      summary: {
        total_users: 156,
        active_users_today: 42,
        active_users_week: 89,
        new_users_period: 28,
        total_revenue: 1250.00,
        revenue_period: 380.50,
        total_tokens_sold: 45000,
        tokens_sold_period: 8500,
        avg_session_duration: "12m 34s",
        retention_rate: 68.5
      },
      growth: {
        users: 12.5,
        revenue: 18.3,
        engagement: 8.7,
        retention: -2.1
      },
      revenue_breakdown: {
        token_purchases: 850.00,
        premium_features: 280.50,
        referral_bonuses: 120.00
      },
      user_activity: {
        training_sessions: 1245,
        lessons_completed: 3420,
        pet_interactions: 8920,
        chat_messages: 456,
        achievements_earned: 234
      },
      top_lessons: [
        { name: "Basic Sit", completions: 89 },
        { name: "Stay Command", completions: 76 },
        { name: "Come/Recall", completions: 65 },
        { name: "Leash Walking", completions: 58 },
        { name: "Down Command", completions: 52 }
      ],
      daily_signups: [
        { date: "Mon", count: 5 },
        { date: "Tue", count: 8 },
        { date: "Wed", count: 6 },
        { date: "Thu", count: 12 },
        { date: "Fri", count: 9 },
        { date: "Sat", count: 15 },
        { date: "Sun", count: 11 }
      ],
      user_segments: {
        free_users: 120,
        token_buyers: 28,
        vip_users: 8
      },
      engagement_metrics: {
        daily_active_rate: 27,
        weekly_active_rate: 57,
        monthly_active_rate: 82,
        avg_actions_per_session: 18
      },
      token_economy: {
        tokens_in_circulation: 125000,
        tokens_spent: 80000,
        tokens_earned_rewards: 45000,
        avg_balance_per_user: 320
      }
    };
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-green-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const data = analytics;

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto" data-testid="creator-analytics">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-green-600" />
              Creator Analytics
            </h1>
            <p className="text-gray-500 text-sm mt-1">Track your app's performance and growth</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="365d">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Users"
            value={data.summary.total_users.toLocaleString()}
            change={data.growth.users}
            changeType={data.growth.users >= 0 ? "positive" : "negative"}
            icon={Users}
            color="bg-blue-500"
            subtitle={`${data.summary.new_users_period} new this period`}
          />
          <MetricCard
            title="Total Revenue"
            value={`$${data.summary.total_revenue.toLocaleString()}`}
            change={data.growth.revenue}
            changeType={data.growth.revenue >= 0 ? "positive" : "negative"}
            icon={DollarSign}
            color="bg-green-500"
            subtitle={`$${data.summary.revenue_period} this period`}
          />
          <MetricCard
            title="Active Today"
            value={data.summary.active_users_today}
            change={data.growth.engagement}
            changeType={data.growth.engagement >= 0 ? "positive" : "negative"}
            icon={Activity}
            color="bg-purple-500"
            subtitle={`${data.summary.active_users_week} this week`}
          />
          <MetricCard
            title="Retention Rate"
            value={`${data.summary.retention_rate}%`}
            change={data.growth.retention}
            changeType={data.growth.retention >= 0 ? "positive" : "negative"}
            icon={Target}
            color="bg-amber-500"
            subtitle="30-day retention"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="engagement">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Daily Signups Chart */}
              <Card className="border-0 shadow-md rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-blue-500" />
                    Daily Signups
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart 
                    data={data.daily_signups.map(d => ({ label: d.date, value: d.count }))}
                    maxValue={Math.max(...data.daily_signups.map(d => d.count))}
                    color="bg-blue-500"
                  />
                </CardContent>
              </Card>

              {/* Top Lessons */}
              <Card className="border-0 shadow-md rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-500" />
                    Top Training Lessons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart 
                    data={data.top_lessons.map(l => ({ label: l.name, value: l.completions }))}
                    maxValue={Math.max(...data.top_lessons.map(l => l.completions))}
                    color="bg-purple-500"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Activity Summary */}
            <Card className="border-0 shadow-md rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <GraduationCap className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-xl font-bold text-gray-900">{data.user_activity.training_sessions.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Training Sessions</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <Trophy className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-xl font-bold text-gray-900">{data.user_activity.lessons_completed.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Lessons Done</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <PawPrint className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-xl font-bold text-gray-900">{data.user_activity.pet_interactions.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Pet Interactions</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-xl">
                    <MessageCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-xl font-bold text-gray-900">{data.user_activity.chat_messages.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Chat Messages</p>
                  </div>
                  <div className="text-center p-3 bg-pink-50 rounded-xl">
                    <Star className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                    <p className="text-xl font-bold text-gray-900">{data.user_activity.achievements_earned.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Achievements</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Coins className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Token Purchases</p>
                      <p className="text-xl font-bold text-gray-900">${data.revenue_breakdown.token_purchases.toFixed(2)}</p>
                    </div>
                  </div>
                  <Progress value={68} className="h-2" />
                  <p className="text-xs text-gray-500 mt-2">68% of total revenue</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Star className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Premium Features</p>
                      <p className="text-xl font-bold text-gray-900">${data.revenue_breakdown.premium_features.toFixed(2)}</p>
                    </div>
                  </div>
                  <Progress value={22} className="h-2" />
                  <p className="text-xs text-gray-500 mt-2">22% of total revenue</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Referral Bonuses</p>
                      <p className="text-xl font-bold text-gray-900">${data.revenue_breakdown.referral_bonuses.toFixed(2)}</p>
                    </div>
                  </div>
                  <Progress value={10} className="h-2" />
                  <p className="text-xs text-gray-500 mt-2">10% of total revenue</p>
                </CardContent>
              </Card>
            </div>

            {/* Token Economy */}
            <Card className="border-0 shadow-md rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  Token Economy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{data.token_economy.tokens_in_circulation.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Tokens in Circulation</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{data.token_economy.tokens_spent.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Tokens Spent</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{data.token_economy.tokens_earned_rewards.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Earned via Rewards</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-900">{data.token_economy.avg_balance_per_user}</p>
                    <p className="text-sm text-gray-500">Avg Balance/User</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-md rounded-xl">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-medium">User Segments</p>
                    <PieChart className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                        <span className="text-sm">Free Users</span>
                      </div>
                      <span className="font-medium">{data.user_segments.free_users}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">Token Buyers</span>
                      </div>
                      <span className="font-medium">{data.user_segments.token_buyers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-sm">VIP Users</span>
                      </div>
                      <span className="font-medium">{data.user_segments.vip_users}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl col-span-2">
                <CardContent className="p-5">
                  <p className="font-medium mb-4">Engagement Rates</p>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Daily Active Rate</span>
                        <span className="font-medium">{data.engagement_metrics.daily_active_rate}%</span>
                      </div>
                      <Progress value={data.engagement_metrics.daily_active_rate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Weekly Active Rate</span>
                        <span className="font-medium">{data.engagement_metrics.weekly_active_rate}%</span>
                      </div>
                      <Progress value={data.engagement_metrics.weekly_active_rate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Monthly Active Rate</span>
                        <span className="font-medium">{data.engagement_metrics.monthly_active_rate}%</span>
                      </div>
                      <Progress value={data.engagement_metrics.monthly_active_rate} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-0 shadow-md rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Session Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl text-center">
                      <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <p className="text-xl font-bold">{data.summary.avg_session_duration}</p>
                      <p className="text-xs text-gray-500">Avg Session</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl text-center">
                      <Activity className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-xl font-bold">{data.engagement_metrics.avg_actions_per_session}</p>
                      <p className="text-xs text-gray-500">Actions/Session</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Feature Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart 
                    data={[
                      { label: "Training", value: data.user_activity.training_sessions },
                      { label: "Virtual Pet", value: data.user_activity.pet_interactions },
                      { label: "AI Chat", value: data.user_activity.chat_messages },
                      { label: "Achievements", value: data.user_activity.achievements_earned }
                    ]}
                    maxValue={data.user_activity.pet_interactions}
                    color="bg-green-500"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default CreatorAnalytics;
