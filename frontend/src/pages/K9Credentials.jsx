import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  QrCode
} from "lucide-react";

const TIER_ICONS = {
  1: "🛡️",
  2: "⚔️",
  3: "🎯",
  4: "🦅",
  5: "👑"
};

export const K9Credentials = ({ user }) => {
  const [credentials, setCredentials] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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

  const generateCertificate = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`${API}/k9/generate-certificate`, {}, { withCredentials: true });
      toast.success('Certificate generated!');
      downloadCertificate(response.data);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  const downloadCertificate = (certData) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 800);
    
    // Gold border
    ctx.strokeStyle = certData.tier_color || '#eab308';
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, 1140, 740);
    
    // Inner border
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, 1100, 700);
    
    // Shield icon area
    ctx.fillStyle = certData.tier_color || '#eab308';
    ctx.beginPath();
    ctx.arc(600, 150, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // Shield symbol
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🛡️', 600, 165);
    
    // Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.letterSpacing = '4px';
    ctx.fillText('CANINECOMPASS K9 PROTECTION PROGRAM', 600, 230);
    
    // Title
    ctx.font = 'bold 42px Georgia';
    ctx.fillStyle = certData.tier_color || '#eab308';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', 600, 290);
    
    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px Georgia';
    ctx.fillText('This certifies that', 600, 350);
    
    // Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Georgia';
    ctx.fillText(certData.holder_name || 'K9 Handler', 600, 400);
    
    // Credential text
    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px Georgia';
    ctx.fillText('has successfully achieved the rank of', 600, 460);
    
    // Tier name
    ctx.fillStyle = certData.tier_color || '#eab308';
    ctx.font = 'bold 32px Georgia';
    ctx.fillText(certData.tier_name || 'K9 Handler', 600, 510);
    
    // Lessons completed
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Arial';
    ctx.fillText(`Having completed ${certData.lessons_completed} K9 Security Training Lessons`, 600, 560);
    
    // Credential ID
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`Credential ID: ${certData.credential_id}`, 600, 620);
    
    // Date
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Arial';
    ctx.fillText(`Issued: ${certData.issued_date}`, 600, 660);
    
    // Footer
    ctx.fillStyle = certData.tier_color || '#eab308';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('CANINECOMPASS', 600, 720);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Arial';
    ctx.fillText('K9 Protection Training Academy', 600, 740);
    
    // Download
    const link = document.createElement('a');
    link.download = `K9-Certificate-${certData.credential_id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const shareCredentials = async () => {
    if (!credentials) return;
    
    const shareText = `I've achieved ${credentials.tier_name} rank in K9 Protection Training on CanineCompass! 🛡️ Completed ${credentials.completed_count}/15 lessons. Credential ID: ${credentials.credential_id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My K9 Handler Credentials',
          text: shareText,
          url: window.location.origin + '/k9-credentials'
        });
      } catch (e) {
        if (e.name !== 'AbortError') {
          navigator.clipboard.writeText(shareText);
          toast.success('Copied to clipboard!');
        }
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard!');
    }
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
          {/* Credential Card */}
          <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 text-white">
            <CardContent className="p-0">
              {/* Header with tier color */}
              <div 
                className="h-2"
                style={{ backgroundColor: credentials?.tier_color || '#9ca3af' }}
              />
              
              <div className="p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                  {/* Credential Badge */}
                  <div className="relative">
                    <div 
                      className="w-32 h-32 rounded-2xl flex items-center justify-center text-6xl shadow-2xl"
                      style={{ 
                        backgroundColor: credentials?.tier_color || '#9ca3af',
                        boxShadow: `0 0 60px ${credentials?.tier_color || '#9ca3af'}40`
                      }}
                    >
                      {credentials?.current_tier > 0 ? TIER_ICONS[credentials.current_tier] : '🔒'}
                    </div>
                    {credentials?.current_tier > 0 && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Credential Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <p className="text-white/60 text-sm uppercase tracking-wider mb-1">K9 Handler Credential</p>
                    <h1 className="font-heading font-bold text-3xl sm:text-4xl mb-2">
                      {credentials?.tier_name || 'Recruit'}
                    </h1>
                    <p className="text-white/70 mb-4">{credentials?.user_name}</p>
                    
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                      <Badge className="bg-white/10 text-white rounded-full px-4 py-1">
                        <Shield className="w-3 h-3 mr-2" />
                        Tier {credentials?.current_tier || 0}
                      </Badge>
                      <Badge className="bg-white/10 text-white rounded-full px-4 py-1">
                        <Award className="w-3 h-3 mr-2" />
                        {credentials?.completed_count || 0}/15 Lessons
                      </Badge>
                      <Badge className="bg-white/10 text-white font-mono rounded-full px-4 py-1">
                        <QrCode className="w-3 h-3 mr-2" />
                        {credentials?.credential_id || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={generateCertificate}
                      disabled={generating || credentials?.current_tier === 0}
                      className="rounded-full bg-amber-500 hover:bg-amber-600 text-black font-semibold px-6"
                      data-testid="download-cert-btn"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {generating ? 'Generating...' : 'Download Certificate'}
                    </Button>
                    <Button
                      onClick={shareCredentials}
                      disabled={credentials?.current_tier === 0}
                      variant="outline"
                      className="rounded-full border-white/30 text-white hover:bg-white/10"
                      data-testid="share-cred-btn"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Credentials
                    </Button>
                  </div>
                </div>
                
                {/* Progress to next tier */}
                {credentials?.next_tier && (
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm">Progress to {credentials.next_tier.name}</span>
                      <span className="text-white/80 text-sm">
                        {credentials.lessons_to_next} lessons remaining
                      </span>
                    </div>
                    <Progress 
                      value={(credentials.completed_count / credentials.next_tier.min_lessons) * 100} 
                      className="h-2 rounded-full bg-white/10"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tier Progression */}
          <div>
            <h2 className="font-heading font-semibold text-xl mb-4">K9 Handler Ranks</h2>
            <div className="grid sm:grid-cols-5 gap-4">
              {Object.entries({
                1: { name: "Guardian Initiate", lessons: 1 },
                2: { name: "Shield Bearer", lessons: 3 },
                3: { name: "Threat Analyst", lessons: 6 },
                4: { name: "Elite Protector", lessons: 10 },
                5: { name: "K9 Master", lessons: 15 }
              }).map(([tier, info]) => {
                const isUnlocked = credentials?.current_tier >= parseInt(tier);
                const isCurrent = credentials?.current_tier === parseInt(tier);
                
                return (
                  <Card 
                    key={tier}
                    className={`rounded-xl transition-all ${
                      isCurrent 
                        ? 'ring-2 ring-amber-500 bg-amber-50' 
                        : isUnlocked 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 opacity-60'
                    }`}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{TIER_ICONS[tier]}</div>
                      <h4 className="font-medium text-sm mb-1">{info.name}</h4>
                      <p className="text-xs text-muted-foreground">{info.lessons} lessons</p>
                      {isUnlocked ? (
                        <Badge className="mt-2 bg-green-100 text-green-700 rounded-full text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Unlocked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mt-2 rounded-full text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Completed Lessons */}
          {credentials?.completed_lessons?.length > 0 && (
            <div>
              <h2 className="font-heading font-semibold text-xl mb-4">Completed Training</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {credentials.completed_lessons.map((lesson) => (
                  <Card key={lesson.lesson_id} className="bg-white rounded-xl shadow-card">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{lesson.title}</h4>
                        {lesson.badge_reward && (
                          <Badge variant="outline" className="text-xs rounded-full mt-1">
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

          {/* Previous Certificates */}
          {certificates.length > 0 && (
            <div>
              <h2 className="font-heading font-semibold text-xl mb-4">Certificate History</h2>
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <Card key={cert.certificate_id} className="bg-white rounded-xl">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <FileText className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">{cert.tier_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(cert.issued_at).toLocaleDateString()} • {cert.lessons_completed} lessons
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs rounded-full">
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
            <Card className="bg-slate-50 rounded-2xl border-dashed border-2 border-slate-200 p-8 text-center">
              <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">No Credentials Yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete your first K9 Security training lesson to earn your handler credentials!
              </p>
              <Button
                onClick={() => window.location.href = '/k9-training'}
                className="rounded-full bg-primary hover:bg-primary-hover"
              >
                <Shield className="w-4 h-4 mr-2" />
                Start K9 Training
              </Button>
            </Card>
          )}
        </div>
      )}
    </AppLayout>
  );
};

export default K9Credentials;
