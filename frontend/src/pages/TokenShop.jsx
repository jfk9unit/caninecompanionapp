import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
// PayPal removed - Stripe only
import { QRCodeSVG } from "qrcode.react";
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
  CreditCard,
  Percent,
  QrCode,
  Download,
  Wallet,
  Ticket
} from "lucide-react";
import { RedeemCodeCard } from "@/components/RedeemCode";

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
  const [paymentMethod] = useState("stripe");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isFirstPurchase, setIsFirstPurchase] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [showQrDialog, setShowQrDialog] = useState(false);

  useEffect(() => {
    fetchData();
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      checkPaymentStatus(sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [packagesRes, balanceRes, firstPurchaseRes, qrRes] = await Promise.all([
        axios.get(`${API}/tokens/packages`, { withCredentials: true }),
        axios.get(`${API}/tokens/balance`, { withCredentials: true }),
        axios.get(`${API}/payments/first-purchase-eligible`, { withCredentials: true }),
        axios.get(`${API}/referral/qr-code`, { withCredentials: true })
      ]);
      setPackages(packagesRes.data);
      setBalance(balanceRes.data);
      setIsFirstPurchase(firstPurchaseRes.data.eligible);
      setQrCodeData(qrRes.data);
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

  const handleStripePurchase = async (packageId) => {
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
    const text = `Join CanineCompass with my referral code ${balance.referral_code} and get 5 free tokens! 🐕`;
    if (navigator.share) {
      navigator.share({ title: 'CanineCompass Referral', text, url: qrCodeData?.referral_url });
    } else {
      navigator.clipboard.writeText(text + ' ' + qrCodeData?.referral_url);
      toast.success('Share text copied!');
    }
  };

  const downloadQrCode = () => {
    const svg = document.getElementById('referral-qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = 'caninecompass-referral.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const getDiscountedPrice = (price) => {
    if (isFirstPurchase) {
      return (price * 0.9).toFixed(2);
    }
    return price.toFixed(2);
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

          {/* First Purchase Banner */}
          {isFirstPurchase && (
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white border-0">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Percent className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">First Purchase Bonus!</h3>
                  <p className="text-white/80">Get 10% OFF your first token purchase. Limited time offer!</p>
                </div>
                <Badge className="bg-white text-green-600 rounded-full px-4 py-2 text-lg font-bold">
                  10% OFF
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Promo Code Redemption Section */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RedeemCodeCard onRedeem={fetchData} />
            </div>
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-0">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Ticket className="w-6 h-6 text-purple-500" />
                  <h3 className="font-semibold">Got a Code?</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter promo codes from our partners or developers to get free tokens or discounts on your purchases.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Method Tabs */}
          <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
            <TabsList className="bg-white rounded-full p-1 shadow-card w-full sm:w-auto">
              <TabsTrigger value="stripe" className="rounded-full px-6 gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                <CreditCard className="w-4 h-4" />
                Cards & Banks
              </TabsTrigger>
              <TabsTrigger value="paypal" className="rounded-full px-6 gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Wallet className="w-4 h-4" />
                PayPal
              </TabsTrigger>
            </TabsList>

            <TabsContent value={paymentMethod} className="mt-6">
              {/* Token Packages */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(packages).map(([id, pkg], index) => {
                  const Icon = TOKEN_ICONS[id] || Coins;
                  const gradient = TOKEN_COLORS[id] || "from-gray-400 to-gray-500";
                  const isPopular = id === 'value';
                  const originalPrice = pkg.price;
                  const finalPrice = getDiscountedPrice(pkg.price);
                  
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
                      {isFirstPurchase && (
                        <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded-br-xl font-medium">
                          -10%
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
                          {isFirstPurchase ? (
                            <div>
                              <p className="text-sm text-muted-foreground line-through">£{originalPrice.toFixed(2)}</p>
                              <p className="text-2xl font-bold text-green-600">£{finalPrice}</p>
                            </div>
                          ) : (
                            <p className="text-2xl font-bold text-primary">£{finalPrice}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            £{(parseFloat(finalPrice) / pkg.tokens).toFixed(2)} per token
                          </p>
                        </div>
                        <Button 
                          onClick={() => paymentMethod === 'stripe' ? handleStripePurchase(id) : handlePayPalPurchase(id)}
                          disabled={loading === id}
                          className={`w-full rounded-full ${
                            paymentMethod === 'paypal' 
                              ? 'bg-blue-500 hover:bg-blue-600' 
                              : 'bg-primary hover:bg-primary-hover'
                          }`}
                          data-testid={`buy-${id}-btn`}
                        >
                          {loading === id ? (
                            <span className="animate-pulse">Processing...</span>
                          ) : (
                            <>
                              {paymentMethod === 'paypal' ? <Wallet className="w-4 h-4 mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                              Buy Now
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          {/* Payment Methods Info */}
          <Card className="bg-gray-50 rounded-2xl border-0">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Accepted Payment Methods</h3>
              <div className="flex flex-wrap gap-4">
                {['Visa', 'Mastercard', 'Amex', 'PayPal', 'Apple Pay', 'Google Pay', 'Bank Transfer'].map((method) => (
                  <Badge key={method} variant="outline" className="rounded-full px-4 py-2">
                    {method}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                All payments are processed securely. Your card details are never stored on our servers.
              </p>
            </CardContent>
          </Card>

          {/* Referral Section with QR Code */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-0">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Gift className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-xl">Refer Friends & Earn Tokens</h3>
                      <p className="text-muted-foreground text-sm">
                        Share your code with friends. You both get <strong>5 free tokens</strong>!
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
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

                  <div className="flex items-center gap-4 mt-6">
                    <div className="text-center p-4 bg-white rounded-2xl">
                      <div className="flex items-center justify-center gap-2 text-purple-600">
                        <Users className="w-5 h-5" />
                        <span className="text-3xl font-bold">{balance.total_referrals}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Friends Referred</p>
                    </div>
                    
                    <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="rounded-full">
                          <QrCode className="w-4 h-4 mr-2" />
                          Show QR Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm text-center">
                        <DialogHeader>
                          <DialogTitle>Scan to Join CanineCompass</DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-center py-6">
                          {qrCodeData && (
                            <QRCodeSVG
                              id="referral-qr-code"
                              value={qrCodeData.referral_url}
                              size={200}
                              fgColor="#22c55e"
                              level="H"
                              includeMargin
                            />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Code: <code className="bg-gray-100 px-2 py-1 rounded">{balance.referral_code}</code>
                        </p>
                        <Button onClick={downloadQrCode} className="w-full rounded-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download QR Code
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* QR Code Preview */}
                {qrCodeData && (
                  <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                    <QRCodeSVG
                      value={qrCodeData.referral_url}
                      size={150}
                      fgColor="#22c55e"
                      level="H"
                    />
                    <p className="text-xs text-muted-foreground mt-3">Scan to join</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <div>
            <h2 className="font-heading font-semibold text-xl mb-4">How Tokens Work</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: CreditCard, title: "Purchase Tokens", desc: "Buy token packages with Stripe, PayPal, or bank cards" },
                { icon: Sparkles, title: "Unlock Training", desc: "Use tokens to access premium training lessons (6-25 tokens each)" },
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
