import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Shield,
  Award,
  Download,
  Share2,
  CheckCircle,
  Star,
  Lock,
  FileText,
  QrCode,
  Eye,
  Sparkles,
  Trophy,
  Crown,
  Medal,
  ExternalLink,
  Copy
} from "lucide-react";
import { generateK9Certificate, downloadCertificate, shareCertificate } from "@/utils/certificateGenerator";

const TIER_ICONS = {
  1: "🛡️",
  2: "⚔️",
  3: "🎯",
  4: "🦅",
  5: "👑"
};

const TIER_COLORS = {
  1: '#6b7280',
  2: '#3b82f6',
  3: '#8b5cf6',
  4: '#f59e0b',
  5: '#ffd700'
};

const TIER_INFO = {
  1: { name: "Guardian Initiate", lessons: 1, description: "First steps into K9 protection" },
  2: { name: "Shield Bearer", lessons: 3, description: "Developing core defensive skills" },
  3: { name: "Threat Analyst", lessons: 6, description: "Advanced threat assessment abilities" },
  4: { name: "Elite Protector", lessons: 10, description: "High-level security operations" },
  5: { name: "K9 Master", lessons: 15, description: "Complete mastery of K9 protection" }
};

export const K9Credentials = ({ user }) => {
  const [credentials, setCredentials] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewCanvas, setPreviewCanvas] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [credRes, certRes] = await Promise.all([
        axios.get(`${API}/k9/credentials`, { withCredentials: true }),
        axios.get(`${API}/k9/certificates`, { withCredentials: true })
      ]);
      setCredentials(credRes.data);
      setCertificates(certRes.data.certificates || []);
    } catch (error) {
      console.error('Failed to fetch credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const previewCertificate = () => {
    if (!credentials || credentials.current_tier === 0) return;
    
    const certData = {
      holder_name: credentials.user_name || user?.name || 'K9 Handler',
      tier_name: credentials.tier_name,
      tier_color: TIER_COLORS[credentials.current_tier],
      lessons_completed: credentials.completed_count,
      credential_id: credentials.credential_id,
      issued_date: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    };
    
    const canvas = generateK9Certificate(certData, user?.name);
    setPreviewCanvas(canvas);
    setPreviewOpen(true);
  };

  const handleDownload = async () => {
    setGenerating(true);
    try {
      // Generate certificate on server for record keeping
      await axios.post(`${API}/k9/generate-certificate`, {}, { withCredentials: true });
      
      // Generate and download locally
      const certData = {
        holder_name: credentials.user_name || user?.name || 'K9 Handler',
        tier_name: credentials.tier_name,
        tier_color: TIER_COLORS[credentials.current_tier],
        lessons_completed: credentials.completed_count,
        credential_id: credentials.credential_id,
        issued_date: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      };
      
      const canvas = generateK9Certificate(certData, user?.name);
      downloadCertificate(canvas, `K9-Certificate-${credentials.credential_id}.png`);
      
      toast.success('Certificate downloaded! Share your achievement! 🏆');
      fetchData();
      setPreviewOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!previewCanvas) return;
    
    const shareText = `🛡️ I've achieved ${credentials.tier_name} rank in K9 Protection Training on CanineCompass!\n\n✅ Completed ${credentials.completed_count}/15 lessons\n🎖️ Credential ID: ${credentials.credential_id}\n\nJoin me at CanineCompass!`;
    
    const shared = await shareCertificate(previewCanvas, 'My K9 Handler Credentials', shareText);
    
    if (!shared) {
      await navigator.clipboard.writeText(shareText);
      toast.success('Share text copied to clipboard!');
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/k9-credentials?id=${credentials.credential_id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied!');
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
        <div className="space-y-8 animate-fade-in" data-testid="k9-credentials-page">
          {/* Premium Credential Card */}
          <Card className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 text-white relative">
            {/* Gold shimmer effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-3xl" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-amber-400/10 to-transparent rounded-full blur-3xl" />
            </div>
            
            <CardContent className="p-0 relative">
              {/* Tier color header */}
              <div 
                className="h-2"
                style={{ 
                  background: `linear-gradient(90deg, ${TIER_COLORS[credentials?.current_tier] || '#9ca3af'}, #ffd700, ${TIER_COLORS[credentials?.current_tier] || '#9ca3af'})`
                }}
              />
              
              <div className="p-6 sm:p-10">
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                  {/* Credential Badge with Glow */}
                  <div className="relative group">
                    <div 
                      className="absolute inset-0 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"
                      style={{ backgroundColor: TIER_COLORS[credentials?.current_tier] || '#9ca3af' }}
                    />
                    <div 
                      className="relative w-36 h-36 rounded-3xl flex items-center justify-center text-7xl shadow-2xl border-2 border-white/20"
                      style={{ 
                        background: `linear-gradient(135deg, ${TIER_COLORS[credentials?.current_tier] || '#9ca3af'}, #ffd700)`
                      }}
                    >
                      {credentials?.current_tier > 0 ? TIER_ICONS[credentials.current_tier] : '🔒'}
                    </div>
                    {credentials?.current_tier > 0 && (
                      <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-green-400 to-green-600 rounded-full p-2 shadow-lg">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Credential Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                      <Crown className="w-5 h-5 text-amber-400" />
                      <span className="text-amber-400/80 text-sm uppercase tracking-wider font-semibold">
                        Official K9 Handler Credential
                      </span>
                    </div>
                    <h1 className="font-heading font-bold text-4xl sm:text-5xl mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-amber-200">
                      {credentials?.tier_name || 'Recruit'}
                    </h1>
                    <p className="text-white/70 text-lg mb-5">{credentials?.user_name}</p>
                    
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                      <Badge className="bg-white/10 backdrop-blur-sm text-white rounded-full px-5 py-2 border border-white/20">
                        <Shield className="w-4 h-4 mr-2 text-amber-400" />
                        Tier {credentials?.current_tier || 0}
                      </Badge>
                      <Badge className="bg-white/10 backdrop-blur-sm text-white rounded-full px-5 py-2 border border-white/20">
                        <Medal className="w-4 h-4 mr-2 text-amber-400" />
                        {credentials?.completed_count || 0}/15 Lessons
                      </Badge>
                      <Badge className="bg-amber-500/20 backdrop-blur-sm text-amber-300 font-mono rounded-full px-5 py-2 border border-amber-500/30">
                        <QrCode className="w-4 h-4 mr-2" />
                        {credentials?.credential_id || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={previewCertificate}
                      disabled={credentials?.current_tier === 0}
                      className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold px-8 py-6 shadow-lg shadow-amber-500/30 transition-all hover:shadow-amber-500/50"
                      data-testid="preview-cert-btn"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Preview Certificate
                    </Button>
                    <Button
                      onClick={copyShareLink}
                      disabled={credentials?.current_tier === 0}
                      variant="outline"
                      className="rounded-full border-white/30 text-white hover:bg-white/10 px-8"
                      data-testid="share-link-btn"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Share Link
                    </Button>
                  </div>
                </div>
                
                {/* Progress to next tier */}
                {credentials?.next_tier && (
                  <div className="mt-10 pt-8 border-t border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <span className="text-white/80 font-medium">Progress to {credentials.next_tier.name}</span>
                      </div>
                      <span className="text-amber-400 font-semibold">
                        {credentials.lessons_to_next} lessons remaining
                      </span>
                    </div>
                    <Progress 
                      value={(credentials.completed_count / credentials.next_tier.min_lessons) * 100} 
                      className="h-3 rounded-full bg-white/10"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tier Progression - Enhanced */}
          <div>
            <h2 className="font-heading font-semibold text-xl mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              K9 Handler Ranks
            </h2>
            <div className="grid sm:grid-cols-5 gap-4">
              {Object.entries(TIER_INFO).map(([tier, info]) => {
                const tierNum = parseInt(tier);
                const isUnlocked = credentials?.current_tier >= tierNum;
                const isCurrent = credentials?.current_tier === tierNum;
                
                return (
                  <Card 
                    key={tier}
                    className={`rounded-2xl transition-all overflow-hidden ${
                      isCurrent 
                        ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-500/20' 
                        : isUnlocked 
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                        : 'bg-gray-50/50 opacity-60'
                    }`}
                  >
                    {isCurrent && (
                      <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400" />
                    )}
                    <CardContent className="p-5 text-center">
                      <div 
                        className={`w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-4xl ${
                          isUnlocked 
                            ? 'bg-gradient-to-br shadow-lg' 
                            : 'bg-gray-200'
                        }`}
                        style={isUnlocked ? { 
                          background: `linear-gradient(135deg, ${TIER_COLORS[tierNum]}, #ffd700)`,
                          boxShadow: `0 4px 20px ${TIER_COLORS[tierNum]}40`
                        } : {}}
                      >
                        {TIER_ICONS[tier]}
                      </div>
                      <h4 className="font-bold text-sm mb-1">{info.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{info.description}</p>
                      <Badge variant="outline" className="rounded-full text-xs">
                        {info.lessons} lessons
                      </Badge>
                      <div className="mt-3">
                        {isUnlocked ? (
                          <Badge className="bg-green-100 text-green-700 rounded-full text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Achieved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-full text-xs text-gray-400">
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Completed Training - Enhanced */}
          {credentials?.completed_lessons?.length > 0 && (
            <div>
              <h2 className="font-heading font-semibold text-xl mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-green-500" />
                Completed Training Modules
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {credentials.completed_lessons.map((lesson) => (
                  <Card key={lesson.lesson_id} className="bg-white rounded-xl shadow-card hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{lesson.title}</h4>
                        {lesson.badge_reward && (
                          <Badge className="bg-amber-100 text-amber-700 rounded-full text-xs mt-1">
                            <Star className="w-3 h-3 mr-1" />
                            {lesson.badge_reward}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Certificate History - Enhanced */}
          {certificates.length > 0 && (
            <div>
              <h2 className="font-heading font-semibold text-xl mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-500" />
                Certificate History
              </h2>
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <Card key={cert.certificate_id} className="bg-white rounded-xl hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">{cert.tier_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(cert.issued_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })} • {cert.lessons_completed} lessons completed
                          </p>
                        </div>
                      </div>
                      <Badge className="font-mono text-xs rounded-full bg-slate-100">
                        {cert.credential_id}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No credentials yet */}
          {credentials?.current_tier === 0 && (
            <Card className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-3xl border-dashed border-2 border-slate-300 p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="font-heading font-bold text-2xl mb-3">Become a Certified K9 Handler</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Complete your first K9 Security training lesson to earn your official handler credentials and certificate!
              </p>
              <Button
                onClick={() => window.location.href = '/k9-training'}
                className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold px-8 py-6"
              >
                <Shield className="w-5 h-5 mr-2" />
                Start K9 Training
              </Button>
            </Card>
          )}

          {/* Certificate Preview Dialog */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Award className="w-6 h-6 text-amber-500" />
                  Your K9 Handler Certificate
                </DialogTitle>
              </DialogHeader>
              
              <div className="mt-4">
                {/* Certificate Preview */}
                <div className="bg-slate-900 rounded-xl p-4 overflow-hidden">
                  {previewCanvas && (
                    <img 
                      src={previewCanvas.toDataURL('image/png')}
                      alt="Certificate Preview"
                      className="w-full rounded-lg shadow-2xl"
                    />
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex flex-wrap gap-3 mt-6 justify-center">
                  <Button
                    onClick={handleDownload}
                    disabled={generating}
                    className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold px-8"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {generating ? 'Generating...' : 'Download Certificate'}
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="rounded-full px-8"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share on Social
                  </Button>
                  <Button
                    onClick={copyShareLink}
                    variant="outline"
                    className="rounded-full px-8"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Copy Link
                  </Button>
                </div>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Share your achievement with friends and on social media! 🎉
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </AppLayout>
  );
};

export default K9Credentials;
