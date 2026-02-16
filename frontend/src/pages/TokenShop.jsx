import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import {
  Coins,
  Zap,
  Crown,
  Sparkles,
  Gift,
  Check,
  Users,
  Copy,
  Share2,
  CreditCard
} from "lucide-react";

const TOKEN_ICONS = {
  starter: Coins,
  value: Zap,
  premium: Crown,
  ultimate: Sparkles
};

const TOKEN_COLORS = {
  starter: "from-amber-400 to-orange-500",
  value: "from-blue-400 to-indigo-500",
  premium: "from-purple-400 to-pink-500",
  ultimate: "from-yellow-400 to-amber-500"
};

export const TokenShop = ({ user }) => {
  const [packages, setPackages] = useState({});
  const [balance, setBalance] = useState({ tokens: 0, referral_code: "", total_referrals: 0 });
  const [loading, setLoading] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchData();
    // Check for payment success
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      checkPaymentStatus(sessionId);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [packagesRes, balanceRes] = await Promise.all([
        axios.get(`${API}/tokens/packages`, { withCredentials: true }),
        axios.get(`${API}/tokens/balance`, { withCredentials: true })
      ]);
      setPackages(packagesRes.data);
      setBalance(balanceRes.data);
    } catch (error) {
      console.error('Failed to fetch token data:', error);
    }
  };

  const checkPaymentStatus = async (sessionId) => {
    try {
      const response = await axios.get(`${API}/payments/status/${sessionId}`, { withCredentials: true });
      if (response.data.status === 'complete' || response.data.payment_status === 'paid') {
        toast.success('Payment successful! Tokens added to your account.');
        fetchData();
      }
    } catch (error) {
      console.error('Payment check failed:', error);
    }
  };

  const handlePurchase = async (packageId) => {
    setLoading(packageId);
    try {
      const response = await axios.post(
        `${API}/payments/stripe/checkout?package_id=${packageId}`,
        { origin_url: window.location.origin },
        { withCredentials: true }
      );
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to start checkout');
      setLoading(null);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(balance.referral_code);
    toast.success('Referral code copied!');
  };

  const shareReferral = () => {
    const text = `Join CanineCompass with my referral code ${balance.referral_code} and get 5 free tokens!`;
    if (navigator.share) {
      navigator.share({ title: 'CanineCompass Referral', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Share text copied!');
    }
  };

  return (
    <AppLayout user={user}>
      {() => (
        <div className="space-y-8 animate-fade-in" data-testid="token-shop">
          {/* Header with Balance */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
                Token Shop
              </h1>
              <p className="text-muted-foreground mt-1">
                Purchase tokens to unlock premium training lessons
              </p>
            </div>
            
            {/* Balance Card */}
            <Card className="bg-gradient-to-r from-primary to-green-600 text-white rounded-2xl">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Your Balance</p>
                  <p className="text-3xl font-bold">{balance.tokens} tokens</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Token Packages */}
          <div>
            <h2 className="font-heading font-semibold text-xl mb-4">Purchase Tokens</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(packages).map(([id, pkg], index) => {
                const Icon = TOKEN_ICONS[id] || Coins;
                const gradient = TOKEN_COLORS[id] || "from-gray-400 to-gray-500";
                const isPopular = id === 'value';
                
                return (
                  <Card 
                    key={id}
                    className={`rounded-2xl shadow-card card-hover relative overflow-hidden animate-fade-in ${
                      isPopular ? 'border-2 border-primary ring-2 ring-primary/20' : 'bg-white'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    data-testid={`token-package-${id}`}
                  >
                    {isPopular && (
                      <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-xl font-medium">
                        Best Value
                      </div>
                    )}
                    <CardContent className="p-6 space-y-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-lg capitalize">{id}</h3>
                        <p className="text-3xl font-bold mt-1">
                          {pkg.tokens} <span className="text-sm font-normal text-muted-foreground">tokens</span>
                        </p>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-2xl font-bold text-primary">
                          £{pkg.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          £{(pkg.price / pkg.tokens).toFixed(2)} per token
                        </p>
                      </div>
                      <Button 
                        onClick={() => handlePurchase(id)}
                        disabled={loading === id}
                        className="w-full rounded-full bg-primary hover:bg-primary-hover"
                        data-testid={`buy-${id}-btn`}
                      >
                        {loading === id ? (
                          <span className="animate-pulse">Processing...</span>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Buy Now
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Referral Section */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-0">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="p-4 bg-purple-100 rounded-2xl self-start">
                  <Gift className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-xl">Refer Friends & Earn Tokens</h3>
                  <p className="text-muted-foreground mt-1">
                    Share your code with friends. You both get <strong>5 free tokens</strong> when they sign up!
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 bg-white rounded-xl p-3 border-2 border-dashed border-purple-200">
                        <code className="flex-1 font-mono text-lg font-bold text-purple-600">
                          {balance.referral_code || 'Loading...'}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={copyReferralCode}
                          data-testid="copy-referral-btn"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Button 
                      onClick={shareReferral}
                      className="rounded-full bg-purple-600 hover:bg-purple-700"
                      data-testid="share-referral-btn"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-white rounded-2xl">
                  <div className="flex items-center justify-center gap-2 text-purple-600">
                    <Users className="w-5 h-5" />
                    <span className="text-3xl font-bold">{balance.total_referrals}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Friends Referred</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <div>
            <h2 className="font-heading font-semibold text-xl mb-4">How Tokens Work</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: CreditCard, title: "Purchase Tokens", desc: "Buy token packages with secure Stripe checkout" },
                { icon: Sparkles, title: "Unlock Training", desc: "Use tokens to access premium training lessons (6-15 tokens each)" },
                { icon: Gift, title: "Earn Rewards", desc: "Refer friends and complete training to earn bonus tokens" }
              ].map((item, index) => (
                <Card key={index} className="bg-white rounded-2xl shadow-card">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
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

export default TokenShop;
