import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Gift,
  Coins,
  Flame,
  Star,
  Trophy,
  Sparkles,
  CheckCircle,
  Lock,
  Zap
} from "lucide-react";

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STREAK_REWARDS = {
  1: { tokens: 1, xp: 10 },
  2: { tokens: 1, xp: 15 },
  3: { tokens: 2, xp: 20 },
  4: { tokens: 2, xp: 25 },
  5: { tokens: 3, xp: 30 },
  6: { tokens: 3, xp: 35 },
  7: { tokens: 5, xp: 50 },
};

export const DailyRewardCard = ({ onClaim }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    fetchStatus();
    checkVipStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API}/daily-reward/status`, { withCredentials: true });
      setStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch daily reward status:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkVipStatus = async () => {
    try {
      const response = await axios.get(`${API}/user/vip-status`, { withCredentials: true });
      setIsVip(response.data.is_vip);
    } catch (error) {
      console.error('Failed to check VIP status:', error);
    }
  };

  const claimReward = async () => {
    setClaiming(true);
    try {
      const response = await axios.post(`${API}/daily-reward/claim`, {}, { withCredentials: true });
      setClaimResult(response.data);
      setShowModal(true);
      fetchStatus();
      if (onClaim) onClaim(response.data.total_tokens);
    } catch (error) {
      if (error.response?.data?.detail === 'Already claimed today') {
        toast.info('Already claimed today! Come back tomorrow 🌅');
      } else {
        toast.error('Failed to claim reward');
      }
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-200"></div>
            <div className="flex-1">
              <div className="h-4 bg-amber-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-amber-200 rounded w-32"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) return null;

  const currentStreak = status.current_streak || 0;
  const claimedToday = status.claimed_today;
  const nextReward = status.next_reward;
  const streakDay = currentStreak > 0 ? ((currentStreak - 1) % 7) + 1 : 0;

  return (
    <>
      <Card className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-200 overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">Daily Rewards</h3>
                  <p className="text-xs text-white/80">
                    {claimedToday ? 'Come back tomorrow!' : 'Claim your reward!'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-white/90">
                  <Flame className="w-4 h-4" />
                  <span className="font-bold text-lg">{currentStreak}</span>
                </div>
                <p className="text-xs text-white/70">Day Streak</p>
              </div>
            </div>
          </div>

          {/* Week Progress */}
          <div className="p-4">
            <div className="flex justify-between mb-4">
              {WEEKDAYS.map((day, idx) => {
                const dayNum = idx + 1;
                const isCompleted = dayNum <= streakDay && claimedToday;
                const isCurrent = dayNum === (streakDay + 1) && !claimedToday;
                const isPast = dayNum < (streakDay + 1);
                const reward = STREAK_REWARDS[dayNum];
                
                return (
                  <div key={day} className="text-center flex-1">
                    <div 
                      className={`w-10 h-10 rounded-xl mx-auto mb-1 flex items-center justify-center text-sm font-bold transition-all ${
                        isCompleted || isPast
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md' 
                          : isCurrent
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white animate-pulse shadow-lg scale-110' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isCompleted || isPast ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : isCurrent ? (
                        <Gift className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{day}</p>
                    <p className="text-[10px] font-semibold text-amber-600">+{reward.tokens}</p>
                  </div>
                );
              })}
            </div>

            {/* Next Reward Info */}
            <div className="bg-white rounded-xl p-3 mb-4 border border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Coins className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {claimedToday ? "Tomorrow's Reward" : "Today's Reward"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      +{nextReward.tokens} Tokens, +{nextReward.xp} XP
                    </p>
                  </div>
                </div>
                {currentStreak >= 7 && (
                  <Badge className="bg-purple-100 text-purple-700 rounded-full">
                    <Star className="w-3 h-3 mr-1" />
                    Week Bonus!
                  </Badge>
                )}
              </div>
            </div>

            {/* Claim Button */}
            <Button
              onClick={claimReward}
              disabled={claimedToday || claiming}
              className={`w-full rounded-full font-bold py-6 transition-all ${
                claimedToday
                  ? 'bg-gray-200 text-gray-500'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50'
              }`}
            >
              {claiming ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : claimedToday ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Claimed Today!
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5 mr-2" />
                  Claim Daily Reward
                </>
              )}
            </Button>

            {/* Streak Info */}
            {currentStreak > 0 && (
              <p className="text-center text-xs text-muted-foreground mt-3">
                🔥 {currentStreak} day streak! {currentStreak >= 7 ? 'Amazing dedication!' : `${7 - (currentStreak % 7)} days until bonus!`}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Claim Result Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="text-center max-w-sm">
          <div className="py-6">
            {/* Celebration Animation */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-ping opacity-50" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50">
                <Gift className="w-12 h-12 text-white" />
              </div>
            </div>

            <h2 className="font-heading font-bold text-2xl mb-2">Reward Claimed!</h2>
            <p className="text-muted-foreground mb-6">
              Day {claimResult?.streak} streak continues! 🔥
            </p>

            <div className="flex justify-center gap-4 mb-6">
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <Coins className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-amber-600">+{claimResult?.tokens_earned}</p>
                <p className="text-xs text-amber-600/70">Tokens</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <Zap className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-purple-600">+{claimResult?.xp_earned}</p>
                <p className="text-xs text-purple-600/70">XP</p>
              </div>
            </div>

            {claimResult?.milestone_badge && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 mb-6">
                <Trophy className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold">{claimResult.milestone_badge}</p>
                <p className="text-sm text-white/80">+{claimResult.milestone_bonus} Bonus Tokens!</p>
              </div>
            )}

            <Button
              onClick={() => setShowModal(false)}
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8"
            >
              Awesome!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DailyRewardCard;
