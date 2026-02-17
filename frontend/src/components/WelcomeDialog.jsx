import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  Star,
  Shield,
  Dog,
  Coins,
  Gift,
  X,
  PartyPopper,
  Crown,
  MessageSquare,
  Heart
} from "lucide-react";

export const WelcomeDialog = ({ open, onClose }) => {
  const [welcomeData, setWelcomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMemo, setShowMemo] = useState(false);

  useEffect(() => {
    if (open) {
      fetchWelcomeMessage();
    }
  }, [open]);

  const fetchWelcomeMessage = async () => {
    try {
      const response = await axios.get(`${API}/welcome-message`, { withCredentials: true });
      setWelcomeData(response.data);
      
      // Show memo if not seen today
      if (!response.data.memo_already_seen) {
        setShowMemo(true);
      }
    } catch (error) {
      console.error("Failed to fetch welcome message:", error);
    } finally {
      setLoading(false);
    }
  };

  const markMemoSeen = async () => {
    try {
      await axios.post(`${API}/daily-memo/mark-seen`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Failed to mark memo as seen:", error);
    }
    setShowMemo(false);
    onClose();
  };

  const handleClose = () => {
    if (showMemo) {
      markMemoSeen();
    } else {
      onClose();
    }
  };

  if (!welcomeData) return null;

  const getRoleIcon = () => {
    switch (welcomeData.role) {
      case "admin":
        return <Shield className="w-12 h-12 text-purple-500" />;
      case "vip":
        return <Crown className="w-12 h-12 text-amber-500" />;
      default:
        return <Dog className="w-12 h-12 text-green-500" />;
    }
  };

  const getRoleGradient = () => {
    switch (welcomeData.role) {
      case "admin":
        return "from-purple-500 to-indigo-600";
      case "vip":
        return "from-amber-400 to-orange-500";
      default:
        return "from-green-500 to-emerald-600";
    }
  };

  const getRoleBadge = () => {
    switch (welcomeData.role) {
      case "admin":
        return (
          <Badge className="bg-purple-100 text-purple-700 rounded-full">
            <Shield className="w-3 h-3 mr-1" /> Admin
          </Badge>
        );
      case "vip":
        return (
          <Badge className="bg-amber-100 text-amber-700 rounded-full">
            <Star className="w-3 h-3 mr-1" /> VIP Tester
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* VIP Bonus Celebration */}
        {welcomeData.vip_bonus_just_claimed && (
          <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 p-6 text-center animate-pulse">
            <PartyPopper className="w-16 h-16 text-white mx-auto mb-3 animate-bounce" />
            <h2 className="text-2xl font-bold text-white mb-2">
              VIP BONUS UNLOCKED!
            </h2>
            <div className="bg-white/20 rounded-xl p-4 inline-block">
              <div className="flex items-center gap-2 text-white">
                <Coins className="w-8 h-8" />
                <span className="text-4xl font-bold">+1,200</span>
                <span className="text-lg">Tokens!</span>
              </div>
            </div>
          </div>
        )}

        {/* Header with Role */}
        <div className={`bg-gradient-to-r ${getRoleGradient()} p-6 text-white ${welcomeData.vip_bonus_just_claimed ? '' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              {getRoleIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getRoleBadge()}
              </div>
              <h2 className="text-xl font-bold">
                Hello, {welcomeData.first_name}!
              </h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Greeting Message */}
          <div className="text-center">
            <p className="text-gray-700 leading-relaxed">
              {welcomeData.greeting}
            </p>
          </div>

          {/* VIP Daily Reward Info */}
          {welcomeData.is_vip && (
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Gift className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-800">VIP Daily Bonus</p>
                  <p className="text-sm text-amber-600">
                    You get <strong>20 FREE tokens</strong> every day!
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Daily Memo */}
          {showMemo && welcomeData.daily_memo && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-800 mb-1">
                    {welcomeData.daily_memo.title}
                  </p>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    {welcomeData.daily_memo.message}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Close Button */}
          <Button
            onClick={handleClose}
            className={`w-full rounded-full bg-gradient-to-r ${getRoleGradient()}`}
          >
            {welcomeData.is_vip ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Let's Go!
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                Start Training
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;
