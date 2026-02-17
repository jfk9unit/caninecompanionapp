import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Trophy,
  Medal,
  Crown,
  Star,
  Target,
  Flame,
  Gift,
  Coins,
  GraduationCap,
  Sparkles,
  Users,
  Clock,
  CheckCircle,
  ChevronUp,
  Shield,
  Swords,
  Calendar
} from "lucide-react";

const RANK_STYLES = {
  1: { bg: "bg-gradient-to-r from-yellow-400 to-amber-500", icon: Crown, color: "text-yellow-600" },
  2: { bg: "bg-gradient-to-r from-gray-300 to-gray-400", icon: Medal, color: "text-gray-500" },
  3: { bg: "bg-gradient-to-r from-amber-600 to-amber-700", icon: Medal, color: "text-amber-700" }
};

const CHALLENGE_ICONS = {
  training: GraduationCap,
  tasks: Target,
  health: Star,
  pet: Sparkles,
  social: Users,
  k9: Shield
};

const TOURNAMENT_THEMES = {
  training: { icon: GraduationCap, color: "from-purple-500 to-indigo-600" },
  pet: { icon: Sparkles, color: "from-pink-500 to-rose-600" },
  achievements: { icon: Trophy, color: "from-amber-500 to-orange-600" },
  k9_protection: { icon: Shield, color: "from-slate-700 to-zinc-800" }
};

export const Leaderboard = ({ user }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [weekInfo, setWeekInfo] = useState({});
  const [tournament, setTournament] = useState(null);
  const [myTournamentPos, setMyTournamentPos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overall");
  const [claiming, setClaiming] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leaderboardRes, rankRes, challengesRes, tournamentRes, tournamentPosRes] = await Promise.all([
        axios.get(`${API}/leaderboard?category=${activeTab}`, { withCredentials: true }),
        axios.get(`${API}/leaderboard/my-rank`, { withCredentials: true }),
        axios.get(`${API}/competitions/challenges`, { withCredentials: true })
      ]);
      setLeaderboard(leaderboardRes.data.leaderboard || []);
      setMyRank(rankRes.data);
      setChallenges(challengesRes.data.challenges || []);
      setWeekInfo({
        start: challengesRes.data.week_start,
        end: challengesRes.data.week_end
      });
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (challengeId) => {
    setClaiming(challengeId);
    try {
      const response = await axios.post(`${API}/competitions/claim/${challengeId}`, {}, { withCredentials: true });
      toast.success(response.data.message);
      if (response.data.new_achievement) {
        toast.success('New achievement unlocked: Challenge Accepted!');
      }
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to claim reward');
    } finally {
      setClaiming(null);
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    return new Date(isoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <AppLayout user={user}>
      {() => (
        <div className="space-y-8 animate-fade-in" data-testid="leaderboard-page">
          {/* Header */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
                Leaderboard & Competitions
              </h1>
              <p className="text-muted-foreground mt-1">
                Compete with other dog parents and complete weekly challenges
              </p>
            </div>
            
            {/* My Rank Card */}
            {myRank && (
              <Card className="bg-gradient-to-r from-primary to-green-600 text-white rounded-2xl lg:w-72">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">Your Rank</p>
                      <p className="text-3xl font-bold">#{myRank.rank}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-white/80 text-sm">Score</p>
                      <p className="text-xl font-bold">{myRank.score}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Weekly Challenges */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Flame className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-xl">Weekly Challenges</h2>
                  <p className="text-sm text-muted-foreground">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatDate(weekInfo.start)} - {formatDate(weekInfo.end)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map((challenge, index) => {
                const Icon = CHALLENGE_ICONS[challenge.type] || Target;
                const progressPercent = (challenge.progress / challenge.target) * 100;
                
                return (
                  <Card 
                    key={challenge.id}
                    className={`rounded-2xl transition-all animate-fade-in ${
                      challenge.is_completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white shadow-card'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    data-testid={`challenge-${challenge.id}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-xl ${
                          challenge.is_completed ? 'bg-green-200' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            challenge.is_completed ? 'text-green-700' : 'text-gray-600'
                          }`} />
                        </div>
                        <Badge className={`rounded-full ${
                          challenge.is_claimed 
                            ? 'bg-gray-200 text-gray-600'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          <Coins className="w-3 h-3 mr-1" />
                          {challenge.reward_tokens} tokens
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold mb-1">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{challenge.progress}/{challenge.target}</span>
                        </div>
                        <Progress value={progressPercent} className="h-2 rounded-full" />
                      </div>

                      {challenge.can_claim && (
                        <Button
                          onClick={() => claimReward(challenge.id)}
                          disabled={claiming === challenge.id}
                          className="w-full mt-4 rounded-full bg-green-600 hover:bg-green-700"
                          data-testid={`claim-${challenge.id}`}
                        >
                          <Gift className="w-4 h-4 mr-2" />
                          {claiming === challenge.id ? 'Claiming...' : 'Claim Reward'}
                        </Button>
                      )}
                      
                      {challenge.is_claimed && (
                        <div className="flex items-center justify-center gap-2 mt-4 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Claimed!</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Leaderboard Tabs */}
          <div>
            <h2 className="font-heading font-semibold text-xl mb-4">Rankings</h2>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white rounded-full p-1 shadow-card w-full sm:w-auto mb-6">
                <TabsTrigger value="overall" className="rounded-full px-6">Overall</TabsTrigger>
                <TabsTrigger value="training" className="rounded-full px-6">Training</TabsTrigger>
                <TabsTrigger value="pet" className="rounded-full px-6">Pet XP</TabsTrigger>
                <TabsTrigger value="achievements" className="rounded-full px-6">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <Card className="bg-white rounded-2xl shadow-card p-8 text-center">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No Rankings Yet</h3>
                    <p className="text-muted-foreground">Be the first to climb the leaderboard!</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {/* Top 3 Podium */}
                    {leaderboard.length >= 3 && (
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        {[1, 0, 2].map((idx) => {
                          const player = leaderboard[idx];
                          if (!player) return null;
                          const rank = idx + 1;
                          const style = RANK_STYLES[rank === 2 ? 1 : rank === 1 ? 2 : 3];
                          
                          return (
                            <Card 
                              key={player.user_id}
                              className={`rounded-2xl overflow-hidden ${
                                rank === 1 ? 'transform sm:-translate-y-4' : ''
                              }`}
                            >
                              <div className={`${style.bg} p-4 text-white text-center`}>
                                <style.icon className="w-8 h-8 mx-auto mb-2" />
                                <span className="text-2xl font-bold">#{rank === 2 ? 1 : rank === 1 ? 2 : 3}</span>
                              </div>
                              <CardContent className="p-4 text-center">
                                <Avatar className="w-16 h-16 mx-auto mb-3 border-4 border-white shadow-lg">
                                  <AvatarImage src={player.picture} />
                                  <AvatarFallback className="bg-primary text-white text-xl">
                                    {player.name?.charAt(0) || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <h4 className="font-semibold truncate">{player.name}</h4>
                                <p className="text-2xl font-bold text-primary mt-1">
                                  {player.score}
                                </p>
                                <p className="text-xs text-muted-foreground">points</p>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}

                    {/* Rest of Leaderboard */}
                    {leaderboard.slice(3).map((player, index) => {
                      const rank = index + 4;
                      const isCurrentUser = player.user_id === user?.user_id;
                      
                      return (
                        <Card 
                          key={player.user_id}
                          className={`rounded-xl transition-all ${
                            isCurrentUser 
                              ? 'bg-primary/5 border-primary/30' 
                              : 'bg-white hover:shadow-md'
                          }`}
                          data-testid={`rank-${rank}`}
                        >
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              isCurrentUser ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {rank}
                            </div>
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={player.picture} />
                              <AvatarFallback className="bg-gray-200">
                                {player.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">
                                {player.name}
                                {isCurrentUser && (
                                  <Badge className="ml-2 bg-primary/20 text-primary rounded-full text-xs">
                                    You
                                  </Badge>
                                )}
                              </h4>
                              {activeTab === 'overall' && (
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                  <span>{player.training_completed || 0} lessons</span>
                                  <span>{player.achievements || 0} badges</span>
                                  <span>{player.pet_xp || 0} XP</span>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-primary">{player.score}</p>
                              <p className="text-xs text-muted-foreground">points</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Score Breakdown */}
          {myRank && (
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-0">
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
                  <ChevronUp className="w-5 h-5 text-primary" />
                  How to Climb the Ranks
                </h3>
                <div className="grid sm:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center">
                    <GraduationCap className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{myRank.breakdown?.training || 0}</p>
                    <p className="text-xs text-muted-foreground">Lessons (+10 pts each)</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{myRank.breakdown?.achievements || 0}</p>
                    <p className="text-xs text-muted-foreground">Badges (+5 pts each)</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <Sparkles className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{myRank.breakdown?.pet_xp || 0}</p>
                    <p className="text-xs text-muted-foreground">Pet XP (+1 pt each)</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{myRank.breakdown?.referrals || 0}</p>
                    <p className="text-xs text-muted-foreground">Referrals (+15 pts each)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default Leaderboard;
