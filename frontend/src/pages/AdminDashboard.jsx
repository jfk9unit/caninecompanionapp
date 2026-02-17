import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  Coins,
  Star,
  TrendingUp,
  Gift,
  Award,
  Activity,
  UserPlus,
  Trash2,
  Search,
  Download,
  RefreshCw,
  Crown,
  Ticket,
  BarChart3,
  PieChart,
  Calendar,
  CheckCircle,
  XCircle,
  Mail,
  Send
} from "lucide-react";

export const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [vipPlayers, setVipPlayers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newVipEmail, setNewVipEmail] = useState("");
  const [awardTokensDialog, setAwardTokensDialog] = useState(false);
  const [awardData, setAwardData] = useState({ email: "", tokens: 100 });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    try {
      const adminCheck = await axios.get(`${API}/admin/check`, { withCredentials: true });
      setIsAdmin(adminCheck.data.is_admin);
      
      if (adminCheck.data.is_admin) {
        await fetchAllData();
      }
    } catch (error) {
      console.error("Admin check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      const [statsRes, usersRes, vipRes, promoRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { withCredentials: true }).catch(() => ({ data: null })),
        axios.get(`${API}/admin/users`, { withCredentials: true }).catch(() => ({ data: { users: [] } })),
        axios.get(`${API}/admin/vip-players`, { withCredentials: true }).catch(() => ({ data: { vip_players: [] } })),
        axios.get(`${API}/admin/promo-codes`, { withCredentials: true }).catch(() => ({ data: { promo_codes: [] } }))
      ]);
      
      setStats(statsRes.data);
      setAllUsers(usersRes.data?.users || []);
      setVipPlayers(vipRes.data?.vip_players || []);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const awardTokens = async () => {
    if (!awardData.email || awardData.tokens <= 0) {
      toast.error("Please enter valid email and token amount");
      return;
    }

    try {
      await axios.post(`${API}/admin/award-tokens`, {
        email: awardData.email,
        tokens: parseInt(awardData.tokens)
      }, { withCredentials: true });
      
      toast.success(`Awarded ${awardData.tokens} tokens to ${awardData.email}`);
      setAwardTokensDialog(false);
      setAwardData({ email: "", tokens: 100 });
      fetchAllData();
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to award tokens";
      toast.error(message);
    }
  };

  const addVipPlayer = async () => {
    if (!newVipEmail || !newVipEmail.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    try {
      await axios.post(`${API}/admin/vip-players`, {
        email: newVipEmail
      }, { withCredentials: true });
      
      toast.success(`Added ${newVipEmail} as VIP player`);
      setNewVipEmail("");
      fetchAllData();
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to add VIP player";
      toast.error(message);
    }
  };

  const removeVipPlayer = async (email) => {
    if (!confirm(`Remove ${email} from VIP players?`)) return;

    try {
      await axios.delete(`${API}/admin/vip-players/${encodeURIComponent(email)}`, { withCredentials: true });
      toast.success(`Removed ${email} from VIP players`);
      fetchAllData();
    } catch (error) {
      toast.error("Failed to remove VIP player");
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <AppLayout user={user}>
        {() => (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout user={user}>
        {() => (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="font-heading font-bold text-2xl mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        )}
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user}>
      {() => (
        <div className="space-y-6 animate-fade-in" data-testid="admin-dashboard">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-purple-100 text-purple-700 rounded-full">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin Dashboard
                </Badge>
              </div>
              <h1 className="font-heading font-bold text-2xl sm:text-3xl">
                App Management
              </h1>
              <p className="text-muted-foreground">
                Manage users, VIPs, tokens, and app analytics
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={fetchAllData}
                variant="outline"
                className="rounded-full"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={awardTokensDialog} onOpenChange={setAwardTokensDialog}>
                <DialogTrigger asChild>
                  <Button className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500">
                    <Gift className="w-4 h-4 mr-2" />
                    Award Tokens
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Award Tokens to User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>User Email</Label>
                      <Input
                        value={awardData.email}
                        onChange={(e) => setAwardData({ ...awardData, email: e.target.value })}
                        placeholder="user@example.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Token Amount</Label>
                      <Input
                        type="number"
                        value={awardData.tokens}
                        onChange={(e) => setAwardData({ ...awardData, tokens: e.target.value })}
                        min="1"
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={awardTokens} className="w-full rounded-full">
                      <Send className="w-4 h-4 mr-2" />
                      Award Tokens
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{stats?.total_users || allUsers.length}</p>
                    <p className="text-xs text-blue-600">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Crown className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-700">{vipPlayers.length}</p>
                    <p className="text-xs text-amber-600">VIP Players</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Coins className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700">{stats?.total_tokens_distributed || 0}</p>
                    <p className="text-xs text-green-600">Tokens Given</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-700">{stats?.active_today || 0}</p>
                    <p className="text-xs text-purple-600">Active Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="vip" className="w-full">
            <TabsList className="bg-white rounded-full p-1 shadow-card w-full sm:w-auto flex-wrap">
              <TabsTrigger value="vip" className="rounded-full gap-2">
                <Crown className="w-4 h-4" />
                VIP Players
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-full gap-2">
                <Users className="w-4 h-4" />
                All Users
              </TabsTrigger>
              <TabsTrigger value="promo" className="rounded-full gap-2">
                <Ticket className="w-4 h-4" />
                Promo Codes
              </TabsTrigger>
            </TabsList>

            {/* VIP Players Tab */}
            <TabsContent value="vip" className="mt-6">
              <Card className="rounded-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-500" />
                      VIP Player Management
                    </CardTitle>
                    <div className="flex gap-2">
                      <Input
                        value={newVipEmail}
                        onChange={(e) => setNewVipEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-64"
                      />
                      <Button onClick={addVipPlayer} className="rounded-full">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add VIP
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-amber-50 rounded-xl p-4 mb-4">
                    <h4 className="font-semibold text-amber-800 mb-2">VIP Benefits:</h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> 1,200 tokens on first login
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> 20 FREE tokens every day
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Double XP on all rewards
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> VIP badge and special greetings
                      </li>
                    </ul>
                  </div>

                  {vipPlayers.length === 0 ? (
                    <div className="text-center py-8">
                      <Crown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-muted-foreground">No VIP players configured</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {vipPlayers.map((email, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-200 hover:border-amber-300 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                              <Star className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium">{email}</p>
                              <p className="text-xs text-muted-foreground">VIP Tester</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVipPlayer(email)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* All Users Tab */}
            <TabsContent value="users" className="mt-6">
              <Card className="rounded-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      All Users ({allUsers.length})
                    </CardTitle>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {filteredUsers.slice(0, 50).map((u, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                              {u.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{u.name || "Unknown"}</p>
                                {u.is_vip && (
                                  <Badge className="bg-amber-100 text-amber-700 text-xs rounded-full">VIP</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-amber-600">
                                <Coins className="w-4 h-4" />
                                <span className="font-bold">{u.tokens || 0}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">tokens</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAwardData({ email: u.email, tokens: 100 });
                                setAwardTokensDialog(true);
                              }}
                              className="rounded-full"
                            >
                              <Gift className="w-3 h-3 mr-1" />
                              Award
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Promo Codes Tab */}
            <TabsContent value="promo" className="mt-6">
              <Card className="rounded-2xl">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <Ticket className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Promo Code Management</h3>
                    <p className="text-muted-foreground mb-4">
                      Create and manage promotional codes for rewards and discounts
                    </p>
                    <Button
                      onClick={() => navigate("/admin/promo-codes")}
                      className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      Manage Promo Codes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Links */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card 
              className="rounded-xl cursor-pointer hover:shadow-lg transition-all"
              onClick={() => navigate("/admin/promo-codes")}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Ticket className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">Promo Codes</p>
                  <p className="text-xs text-muted-foreground">Create discount codes</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="rounded-xl cursor-pointer hover:shadow-lg transition-all"
              onClick={() => navigate("/leaderboard")}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Leaderboard</p>
                  <p className="text-xs text-muted-foreground">View top trainers</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="rounded-xl cursor-pointer hover:shadow-lg transition-all"
              onClick={() => navigate("/achievements")}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold">Achievements</p>
                  <p className="text-xs text-muted-foreground">View all badges</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default AdminDashboard;
