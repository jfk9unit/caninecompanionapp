import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Trophy,
  Medal,
  Star,
  Share2,
  Download,
  Award,
  GraduationCap,
  Heart,
  Users,
  Sparkles,
  CheckCircle,
  Eye,
  ExternalLink,
  Copy
} from "lucide-react";
import { generateAchievementCertificate, downloadCertificate, shareCertificate } from "@/utils/certificateGenerator";

const BADGE_STYLES = {
  bronze: "from-amber-600 to-amber-800",
  silver: "from-gray-400 to-gray-600",
  gold: "from-yellow-400 to-amber-500"
};

const BADGE_ICONS = {
  training: GraduationCap,
  health: Heart,
  social: Users,
  milestone: Star
};

const CATEGORY_LABELS = {
  training: "Training",
  health: "Health",
  social: "Social",
  milestone: "Milestones"
};

export const Achievements = ({ user }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await axios.get(`${API}/achievements`, { withCredentials: true });
      setAchievements(response.data);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const shareAchievement = async (achievement) => {
    setSharing(achievement.achievement_id);
    try {
      await axios.post(`${API}/achievements/${achievement.achievement_id}/share`, {}, { withCredentials: true });
      
      const shareText = `I earned the "${achievement.title}" badge on CanineCompass! 🏆`;
      
      if (navigator.share) {
        await navigator.share({
          title: achievement.title,
          text: shareText,
          url: window.location.origin
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Share text copied to clipboard!');
      }
      
      fetchAchievements();
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Failed to share');
      }
    } finally {
      setSharing(null);
    }
  };

  const downloadCertificate = (achievement) => {
    // Generate a simple certificate
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, 800, 600);
    
    // Border
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 760, 560);
    
    // Inner border
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, 720, 520);
    
    // Title
    ctx.fillStyle = '#166534';
    ctx.font = 'bold 36px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Achievement', 400, 100);
    
    // Subtitle
    ctx.fillStyle = '#374151';
    ctx.font = '20px Georgia';
    ctx.fillText('This certifies that', 400, 180);
    
    // User name
    ctx.fillStyle = '#166534';
    ctx.font = 'bold 32px Georgia';
    ctx.fillText(user?.name || 'Dog Parent', 400, 230);
    
    // Achievement
    ctx.fillStyle = '#374151';
    ctx.font = '20px Georgia';
    ctx.fillText('has successfully earned the badge', 400, 300);
    
    // Badge name
    ctx.fillStyle = '#166534';
    ctx.font = 'bold 28px Georgia';
    ctx.fillText(`"${achievement.title}"`, 400, 350);
    
    // Description
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Georgia';
    ctx.fillText(achievement.description, 400, 400);
    
    // Date
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px Georgia';
    const date = new Date(achievement.earned_at).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    ctx.fillText(`Awarded on ${date}`, 400, 480);
    
    // Logo text
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('CanineCompass', 400, 540);
    
    // Download
    const link = document.createElement('a');
    link.download = `certificate-${achievement.achievement_id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    toast.success('Certificate downloaded!');
  };

  const filteredAchievements = activeTab === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === activeTab);

  const stats = {
    total: achievements.length,
    bronze: achievements.filter(a => a.badge_type === 'bronze').length,
    silver: achievements.filter(a => a.badge_type === 'silver').length,
    gold: achievements.filter(a => a.badge_type === 'gold').length,
    shared: achievements.filter(a => a.shared).length
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
      {() => (
        <div className="space-y-8 animate-fade-in" data-testid="achievements-page">
          {/* Header */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
                Achievements & Awards
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your progress and share your accomplishments
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <Card className="bg-white rounded-2xl shadow-card">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-600 to-amber-800 text-white rounded-2xl">
              <CardContent className="p-4 text-center">
                <Medal className="w-8 h-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.bronze}</p>
                <p className="text-xs text-white/80">Bronze</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-gray-400 to-gray-600 text-white rounded-2xl">
              <CardContent className="p-4 text-center">
                <Medal className="w-8 h-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.silver}</p>
                <p className="text-xs text-white/80">Silver</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-2xl">
              <CardContent className="p-4 text-center">
                <Medal className="w-8 h-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.gold}</p>
                <p className="text-xs text-white/80">Gold</p>
              </CardContent>
            </Card>
            <Card className="bg-white rounded-2xl shadow-card">
              <CardContent className="p-4 text-center">
                <Share2 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.shared}</p>
                <p className="text-xs text-muted-foreground">Shared</p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements List */}
          {achievements.length === 0 ? (
            <Card className="bg-white rounded-2xl shadow-card p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-amber-100 rounded-full">
                  <Trophy className="w-8 h-8 text-amber-600" />
                </div>
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">No Achievements Yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete training lessons and activities to earn badges and achievements!
              </p>
              <Button 
                onClick={() => window.location.href = '/training'}
                className="rounded-full bg-primary hover:bg-primary-hover"
              >
                Start Training
              </Button>
            </Card>
          ) : (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white rounded-full p-1 shadow-card w-full sm:w-auto">
                  <TabsTrigger value="all" className="rounded-full px-6">All</TabsTrigger>
                  <TabsTrigger value="training" className="rounded-full px-6">Training</TabsTrigger>
                  <TabsTrigger value="social" className="rounded-full px-6">Social</TabsTrigger>
                  <TabsTrigger value="milestone" className="rounded-full px-6">Milestones</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAchievements.map((achievement, index) => {
                      const Icon = BADGE_ICONS[achievement.category] || Award;
                      const gradient = BADGE_STYLES[achievement.badge_type] || BADGE_STYLES.bronze;
                      
                      return (
                        <Card 
                          key={achievement.achievement_id}
                          className="bg-white rounded-2xl shadow-card overflow-hidden animate-fade-in card-hover"
                          style={{ animationDelay: `${index * 0.05}s` }}
                          data-testid={`achievement-${achievement.achievement_id}`}
                        >
                          {/* Badge Header */}
                          <div className={`bg-gradient-to-r ${gradient} p-6 text-white text-center`}>
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                              <Icon className="w-8 h-8" />
                            </div>
                            <Badge className="bg-white/20 text-white rounded-full capitalize">
                              {achievement.badge_type}
                            </Badge>
                          </div>
                          
                          <CardContent className="p-5">
                            <h3 className="font-heading font-semibold text-lg mb-1">
                              {achievement.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {achievement.description}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {new Date(achievement.earned_at).toLocaleDateString()}
                              </span>
                              <Badge variant="outline" className="rounded-full capitalize">
                                {CATEGORY_LABELS[achievement.category] || achievement.category}
                              </Badge>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                onClick={() => shareAchievement(achievement)}
                                disabled={sharing === achievement.achievement_id}
                                variant="outline"
                                size="sm"
                                className="flex-1 rounded-full"
                                data-testid={`share-${achievement.achievement_id}`}
                              >
                                <Share2 className="w-3 h-3 mr-1" />
                                {achievement.shared ? 'Shared' : 'Share'}
                              </Button>
                              <Button
                                onClick={() => downloadCertificate(achievement)}
                                variant="outline"
                                size="sm"
                                className="flex-1 rounded-full"
                                data-testid={`download-${achievement.achievement_id}`}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Certificate
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}

          {/* Upcoming Achievements */}
          <div>
            <h2 className="font-heading font-semibold text-xl mb-4">Achievements to Unlock</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Training Pro", desc: "Complete 10 training lessons", icon: GraduationCap, progress: 30 },
                { title: "Health Champion", desc: "Log 5 vet visits", icon: Heart, progress: 60 },
                { title: "Social Butterfly", desc: "Share 3 achievements", icon: Users, progress: 0 },
                { title: "Dedicated Parent", desc: "Use app for 30 days", icon: Star, progress: 45 }
              ].map((item, index) => (
                <Card key={index} className="bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                  <CardContent className="p-4 text-center opacity-60">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                      <item.icon className="w-6 h-6 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.progress}%</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Achievements;
