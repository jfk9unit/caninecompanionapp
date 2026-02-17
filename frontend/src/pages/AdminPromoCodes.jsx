import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Shield,
  Plus,
  Ticket,
  Coins,
  Percent,
  Copy,
  ExternalLink,
  Trash2,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Link2,
  QrCode,
  Eye,
  EyeOff
} from "lucide-react";

export const AdminPromoCodes = ({ user }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [promoCodes, setPromoCodes] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState({
    code: "",
    code_type: "tokens",
    value: 10,
    max_uses: "",
    expires_at: "",
    description: ""
  });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await axios.get(`${API}/admin/check`, { withCredentials: true });
      setIsAdmin(response.data.is_admin);
      if (response.data.is_admin) {
        fetchPromoCodes();
      }
    } catch (error) {
      console.error("Admin check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPromoCodes = async () => {
    try {
      const response = await axios.get(`${API}/admin/promo-codes`, { withCredentials: true });
      setPromoCodes(response.data.promo_codes || []);
    } catch (error) {
      console.error("Failed to fetch promo codes:", error);
    }
  };

  const createPromoCode = async () => {
    if (!newCode.code.trim()) {
      toast.error("Please enter a code");
      return;
    }

    try {
      const payload = {
        code: newCode.code.toUpperCase(),
        code_type: newCode.code_type,
        value: parseInt(newCode.value) || 0,
        max_uses: newCode.max_uses ? parseInt(newCode.max_uses) : null,
        expires_at: newCode.expires_at || null,
        description: newCode.description || null
      };

      const response = await axios.post(`${API}/admin/promo-codes`, payload, { withCredentials: true });
      
      toast.success(
        <div>
          <p>Promo code created!</p>
          <p className="text-xs mt-1">Share link copied to clipboard</p>
        </div>
      );
      
      // Copy share link to clipboard
      navigator.clipboard.writeText(response.data.share_link);
      
      setCreateDialogOpen(false);
      setNewCode({
        code: "",
        code_type: "tokens",
        value: 10,
        max_uses: "",
        expires_at: "",
        description: ""
      });
      fetchPromoCodes();
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to create code";
      toast.error(message);
    }
  };

  const toggleCodeStatus = async (code, currentStatus) => {
    try {
      await axios.put(
        `${API}/admin/promo-codes/${code}`,
        { active: !currentStatus },
        { withCredentials: true }
      );
      toast.success(`Code ${!currentStatus ? "activated" : "deactivated"}`);
      fetchPromoCodes();
    } catch (error) {
      toast.error("Failed to update code");
    }
  };

  const deleteCode = async (code) => {
    if (!confirm(`Delete promo code "${code}"?`)) return;

    try {
      await axios.delete(`${API}/admin/promo-codes/${code}`, { withCredentials: true });
      toast.success("Code deleted");
      fetchPromoCodes();
    } catch (error) {
      toast.error("Failed to delete code");
    }
  };

  const copyShareLink = (code) => {
    const link = `${window.location.origin}/redeem?code=${code}`;
    navigator.clipboard.writeText(link);
    toast.success("Share link copied!");
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode({ ...newCode, code });
  };

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
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Contact the app administrator to get access.
            </p>
          </div>
        )}
      </AppLayout>
    );
  }

  const activeCodesCount = promoCodes.filter(c => c.active).length;
  const totalRedemptions = promoCodes.reduce((sum, c) => sum + (c.used_count || 0), 0);

  return (
    <AppLayout user={user}>
      {() => (
        <div className="space-y-6 animate-fade-in" data-testid="admin-promo-codes">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-purple-100 text-purple-700 rounded-full">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              </div>
              <h1 className="font-heading font-bold text-2xl sm:text-3xl">
                Promo Codes
              </h1>
              <p className="text-muted-foreground">
                Create and manage promotional codes for rewards & discounts
              </p>
            </div>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Code
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-amber-500" />
                    Create Promo Code
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  {/* Code Input */}
                  <div>
                    <Label>Code</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={newCode.code}
                        onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                        placeholder="WELCOME10"
                        className="font-mono uppercase"
                      />
                      <Button
                        variant="outline"
                        onClick={generateRandomCode}
                        className="shrink-0"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>

                  {/* Code Type */}
                  <div>
                    <Label>Reward Type</Label>
                    <Select
                      value={newCode.code_type}
                      onValueChange={(v) => setNewCode({ ...newCode, code_type: v })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tokens">
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-amber-500" />
                            Free Tokens
                          </div>
                        </SelectItem>
                        <SelectItem value="discount">
                          <div className="flex items-center gap-2">
                            <Percent className="w-4 h-4 text-purple-500" />
                            Purchase Discount
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Value */}
                  <div>
                    <Label>
                      {newCode.code_type === "tokens" ? "Token Amount" : "Discount Percentage"}
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        value={newCode.value}
                        onChange={(e) => setNewCode({ ...newCode, value: e.target.value })}
                        min="1"
                        max={newCode.code_type === "discount" ? "100" : "1000"}
                      />
                      <span className="text-muted-foreground font-medium">
                        {newCode.code_type === "tokens" ? "tokens" : "%"}
                      </span>
                    </div>
                  </div>

                  {/* Max Uses */}
                  <div>
                    <Label>Max Uses (optional)</Label>
                    <Input
                      type="number"
                      value={newCode.max_uses}
                      onChange={(e) => setNewCode({ ...newCode, max_uses: e.target.value })}
                      placeholder="Unlimited"
                      min="1"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty for unlimited uses
                    </p>
                  </div>

                  {/* Expiry */}
                  <div>
                    <Label>Expiry Date (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={newCode.expires_at}
                      onChange={(e) => setNewCode({ ...newCode, expires_at: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label>Description (optional)</Label>
                    <Input
                      value={newCode.description}
                      onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                      placeholder="Welcome bonus for new users"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    onClick={createPromoCode}
                    className="w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create & Copy Link
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="rounded-xl">
              <CardContent className="p-4 text-center">
                <Ticket className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{promoCodes.length}</p>
                <p className="text-xs text-muted-foreground">Total Codes</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{activeCodesCount}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{totalRedemptions}</p>
                <p className="text-xs text-muted-foreground">Redemptions</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl">
              <CardContent className="p-4 text-center">
                <Coins className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {promoCodes.filter(c => c.code_type === "tokens").reduce((sum, c) => sum + (c.value * c.used_count), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Tokens Given</p>
              </CardContent>
            </Card>
          </div>

          {/* Codes List */}
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">All Promo Codes</h3>

              {promoCodes.length === 0 ? (
                <div className="text-center py-12">
                  <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">No promo codes yet</p>
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    variant="outline"
                    className="mt-4 rounded-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Code
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {promoCodes.map((promo) => (
                    <PromoCodeRow
                      key={promo.code}
                      promo={promo}
                      onToggle={() => toggleCodeStatus(promo.code, promo.active)}
                      onCopyLink={() => copyShareLink(promo.code)}
                      onDelete={() => deleteCode(promo.code)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
};

// Promo Code Row Component
const PromoCodeRow = ({ promo, onToggle, onCopyLink, onDelete }) => {
  const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();
  const isMaxedOut = promo.max_uses && promo.used_count >= promo.max_uses;

  return (
    <div className={`rounded-xl p-4 border transition-all ${
      promo.active && !isExpired && !isMaxedOut
        ? "bg-white border-gray-200 hover:border-amber-300"
        : "bg-gray-50 border-gray-200 opacity-75"
    }`}>
      <div className="flex items-center gap-4">
        {/* Code Type Icon */}
        <div className={`p-3 rounded-xl ${
          promo.code_type === "tokens"
            ? "bg-amber-100"
            : "bg-purple-100"
        }`}>
          {promo.code_type === "tokens" ? (
            <Coins className="w-6 h-6 text-amber-600" />
          ) : (
            <Percent className="w-6 h-6 text-purple-600" />
          )}
        </div>

        {/* Code Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="font-mono font-bold text-lg">{promo.code}</code>
            {promo.active && !isExpired && !isMaxedOut ? (
              <Badge className="bg-green-100 text-green-700 rounded-full text-xs">
                Active
              </Badge>
            ) : isExpired ? (
              <Badge className="bg-red-100 text-red-700 rounded-full text-xs">
                Expired
              </Badge>
            ) : isMaxedOut ? (
              <Badge className="bg-gray-100 text-gray-700 rounded-full text-xs">
                Max Used
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-700 rounded-full text-xs">
                Inactive
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
            <span className={`font-medium ${
              promo.code_type === "tokens" ? "text-amber-600" : "text-purple-600"
            }`}>
              {promo.code_type === "tokens"
                ? `+${promo.value} tokens`
                : `${promo.value}% off`}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {promo.used_count}{promo.max_uses ? `/${promo.max_uses}` : ""} used
            </span>
            {promo.expires_at && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(promo.expires_at), "MMM d, yyyy")}
              </span>
            )}
          </div>

          {promo.description && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {promo.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCopyLink}
            className="h-9 w-9 rounded-full"
            title="Copy share link"
          >
            <Link2 className="w-4 h-4" />
          </Button>

          <Switch
            checked={promo.active}
            onCheckedChange={onToggle}
            disabled={isExpired || isMaxedOut}
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-9 w-9 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
            title="Delete code"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminPromoCodes;
