import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Heart,
  Zap,
  Star,
  Trophy,
  Bone,
  Play,
  GraduationCap,
  Sparkles,
  PawPrint,
  Coins,
  Plus
} from "lucide-react";

const SKILLS = [
  { id: "sit", name: "Sit", icon: "🐕" },
  { id: "stay", name: "Stay", icon: "🦮" },
  { id: "fetch", name: "Fetch", icon: "🎾" },
  { id: "roll", name: "Roll Over", icon: "🔄" },
  { id: "shake", name: "Shake Hands", icon: "🤝" },
  { id: "speak", name: "Speak", icon: "🗣️" },
  { id: "heel", name: "Heel", icon: "👟" },
  { id: "down", name: "Down", icon: "⬇️" },
];

export const VirtualPet = ({ user }) => {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newPetName, setNewPetName] = useState("");
  const [tokens, setTokens] = useState(user?.tokens || 0);

  useEffect(() => {
    fetchPet();
    fetchTokens();
  }, []);

  const fetchPet = async () => {
    try {
      const response = await axios.get(`${API}/virtual-pet`, { withCredentials: true });
      setPet(response.data);
    } catch (error) {
      console.error('Failed to fetch pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTokens = async () => {
    try {
      const response = await axios.get(`${API}/tokens/balance`, { withCredentials: true });
      setTokens(response.data.tokens);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
    }
  };

  const createPet = async () => {
    if (!newPetName.trim()) {
      toast.error('Please enter a name for your pet');
      return;
    }
    try {
      const response = await axios.post(`${API}/virtual-pet`, {
        name: newPetName
      }, { withCredentials: true });
      setPet(response.data);
      setCreateOpen(false);
      toast.success(`${newPetName} is ready to play!`);
    } catch (error) {
      toast.error('Failed to create pet');
    }
  };

  const feedPet = async () => {
    setActionLoading('feed');
    try {
      const response = await axios.post(`${API}/virtual-pet/feed`, {}, { withCredentials: true });
      toast.success(response.data.message);
      fetchPet();
    } catch (error) {
      toast.error('Failed to feed pet');
    } finally {
      setActionLoading(null);
    }
  };

  const playWithPet = async () => {
    setActionLoading('play');
    try {
      const response = await axios.post(`${API}/virtual-pet/play`, {}, { withCredentials: true });
      toast.success(`${response.data.message} +${response.data.xp_gained} XP!`);
      fetchPet();
    } catch (error) {
      toast.error('Failed to play with pet');
    } finally {
      setActionLoading(null);
    }
  };

  const trainSkill = async (skillId) => {
    setActionLoading(skillId);
    try {
      const response = await axios.post(`${API}/virtual-pet/train`, {
        skill: skillId
      }, { withCredentials: true });
      toast.success(response.data.message);
      fetchPet();
      fetchTokens();
    } catch (error) {
      if (error.response?.data?.detail?.includes('tokens')) {
        toast.error('Not enough tokens! Visit the Token Shop to buy more.');
      } else {
        toast.error('Training failed');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const getMoodEmoji = (happiness) => {
    if (happiness >= 80) return "😊";
    if (happiness >= 60) return "🙂";
    if (happiness >= 40) return "😐";
    if (happiness >= 20) return "😟";
    return "😢";
  };

  const getEnergyColor = (energy) => {
    if (energy >= 70) return "bg-green-500";
    if (energy >= 40) return "bg-yellow-500";
    return "bg-red-500";
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

  return (
    <AppLayout user={user}>
      {({ dogs }) => (
        <div className="space-y-8 animate-fade-in" data-testid="virtual-pet">
          {!pet ? (
            /* Create Pet */
            <div className="max-w-lg mx-auto text-center py-12">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                <PawPrint className="w-12 h-12 text-amber-700" />
              </div>
              <h1 className="font-heading font-bold text-3xl mb-3">Create Your Virtual Pet</h1>
              <p className="text-muted-foreground mb-6">
                Train and care for your virtual companion. Watch them grow, learn new skills, and earn achievements!
              </p>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full bg-primary hover:bg-primary-hover px-8" data-testid="create-pet-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Virtual Pet
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Name Your Virtual Pet</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Pet Name</Label>
                      <Input
                        value={newPetName}
                        onChange={(e) => setNewPetName(e.target.value)}
                        placeholder="e.g., Buddy"
                        data-testid="pet-name-input"
                      />
                    </div>
                    <Button onClick={createPet} className="w-full rounded-full bg-primary" data-testid="confirm-create-pet">
                      Create Pet
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            /* Pet Dashboard */
            <>
              {/* Header */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Pet Card */}
                <Card className="flex-1 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-0 overflow-hidden">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Pet Avatar */}
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center shadow-lg">
                          <span className="text-6xl">{getMoodEmoji(pet.happiness)}</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md">
                          <span className="text-xl">🐕</span>
                        </div>
                      </div>
                      
                      {/* Pet Info */}
                      <div className="flex-1 text-center sm:text-left">
                        <h1 className="font-heading font-bold text-2xl sm:text-3xl">{pet.name}</h1>
                        <p className="text-muted-foreground">{pet.breed || 'Virtual Companion'}</p>
                        
                        <div className="flex items-center gap-4 mt-4 justify-center sm:justify-start">
                          <Badge className="bg-purple-100 text-purple-700 rounded-full px-4 py-1">
                            <Star className="w-3 h-3 mr-1" />
                            Level {pet.training_level}
                          </Badge>
                          <Badge className="bg-amber-100 text-amber-700 rounded-full px-4 py-1">
                            <Trophy className="w-3 h-3 mr-1" />
                            {pet.experience_points} XP
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats Bars */}
                    <div className="grid grid-cols-2 gap-6 mt-8">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium flex items-center gap-2">
                            <Heart className="w-4 h-4 text-pink-500" />
                            Happiness
                          </span>
                          <span className="text-sm font-bold">{pet.happiness}%</span>
                        </div>
                        <Progress value={pet.happiness} className="h-3 rounded-full bg-pink-100" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            Energy
                          </span>
                          <span className="text-sm font-bold">{pet.energy}%</span>
                        </div>
                        <Progress value={pet.energy} className={`h-3 rounded-full ${getEnergyColor(pet.energy)}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions Card */}
                <Card className="lg:w-72 bg-white rounded-2xl shadow-card">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-heading font-semibold">Quick Actions</h3>
                    
                    <Button
                      onClick={feedPet}
                      disabled={actionLoading === 'feed'}
                      className="w-full rounded-xl bg-pink-500 hover:bg-pink-600 h-14"
                      data-testid="feed-pet-btn"
                    >
                      <Bone className="w-5 h-5 mr-2" />
                      Feed (+10 Happiness)
                    </Button>
                    
                    <Button
                      onClick={playWithPet}
                      disabled={actionLoading === 'play'}
                      className="w-full rounded-xl bg-blue-500 hover:bg-blue-600 h-14"
                      data-testid="play-pet-btn"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Play (+15 XP)
                    </Button>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Your Tokens</span>
                        <span className="font-bold flex items-center gap-1">
                          <Coins className="w-4 h-4 text-amber-500" />
                          {tokens}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Skills Training */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-semibold text-xl">Train Skills</h2>
                  <Badge variant="outline" className="rounded-full">
                    <Coins className="w-3 h-3 mr-1" />
                    1 token per skill
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {SKILLS.map((skill) => {
                    const isUnlocked = pet.skills_unlocked?.includes(skill.id);
                    return (
                      <Card 
                        key={skill.id}
                        className={`rounded-2xl transition-all ${
                          isUnlocked 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-white hover:shadow-md cursor-pointer'
                        }`}
                        data-testid={`skill-${skill.id}`}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl mb-2">{skill.icon}</div>
                          <h4 className="font-medium text-sm">{skill.name}</h4>
                          {isUnlocked ? (
                            <Badge className="mt-2 bg-green-100 text-green-700 rounded-full text-xs">
                              Learned!
                            </Badge>
                          ) : (
                            <Button
                              onClick={() => trainSkill(skill.id)}
                              disabled={actionLoading === skill.id || tokens < 1}
                              variant="outline"
                              size="sm"
                              className="mt-2 rounded-full text-xs"
                              data-testid={`train-${skill.id}-btn`}
                            >
                              <GraduationCap className="w-3 h-3 mr-1" />
                              Train
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Progress to Next Level */}
              <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6" />
                      <span className="font-semibold">Progress to Level {pet.training_level + 1}</span>
                    </div>
                    <span className="text-white/80">
                      {pet.experience_points % 100}/100 XP
                    </span>
                  </div>
                  <Progress value={pet.experience_points % 100} className="h-3 rounded-full bg-white/20" />
                  <p className="text-sm text-white/80 mt-2">
                    {100 - (pet.experience_points % 100)} XP until next level!
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default VirtualPet;
