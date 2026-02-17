import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Gift,
  Ticket,
  Sparkles,
  Check,
  Percent,
  Coins,
  X,
  Loader2
} from "lucide-react";

export const RedeemCodeCard = ({ onRedeem, compact = false }) => {
  const [code, setCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [validatedCode, setValidatedCode] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redeemResult, setRedeemResult] = useState(null);

  // Check URL for code parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get("code");
    if (urlCode) {
      setCode(urlCode.toUpperCase());
      setDialogOpen(true);
      // Auto-validate the code
      setTimeout(() => validateCode(urlCode), 500);
    }
  }, []);

  const validateCode = async (codeToValidate = code) => {
    if (!codeToValidate.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    setValidating(true);
    setValidatedCode(null);

    try {
      const response = await axios.get(
        `${API}/promo-codes/validate/${codeToValidate.trim().toUpperCase()}`,
        { withCredentials: true }
      );
      setValidatedCode(response.data);
    } catch (error) {
      const message = error.response?.data?.detail || "Invalid promo code";
      toast.error(message);
      setValidatedCode(null);
    } finally {
      setValidating(false);
    }
  };

  const redeemCode = async () => {
    if (!validatedCode) return;

    setRedeeming(true);
    try {
      const response = await axios.post(
        `${API}/promo-codes/redeem`,
        { code: code.trim().toUpperCase() },
        { withCredentials: true }
      );

      setRedeemResult(response.data);
      setShowSuccess(true);
      
      // Clear URL parameter if present
      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      window.history.replaceState({}, "", url.pathname);

      if (onRedeem) {
        onRedeem(response.data);
      }

      // Reset after showing success
      setTimeout(() => {
        setShowSuccess(false);
        setDialogOpen(false);
        setCode("");
        setValidatedCode(null);
        setRedeemResult(null);
      }, 3000);

    } catch (error) {
      const message = error.response?.data?.detail || "Failed to redeem code";
      toast.error(message);
    } finally {
      setRedeeming(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && code.trim()) {
      validateCode();
    }
  };

  // Compact version for Dashboard
  if (compact) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="rounded-full border-dashed border-amber-400 text-amber-600 hover:bg-amber-50"
            data-testid="redeem-code-btn-compact"
          >
            <Ticket className="w-4 h-4 mr-2" />
            Redeem Code
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" />
              Redeem Promo Code
            </DialogTitle>
          </DialogHeader>
          <RedeemContent
            code={code}
            setCode={setCode}
            validating={validating}
            redeeming={redeeming}
            validatedCode={validatedCode}
            showSuccess={showSuccess}
            redeemResult={redeemResult}
            validateCode={validateCode}
            redeemCode={redeemCode}
            handleKeyPress={handleKeyPress}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Full card version for Token Shop
  return (
    <Card className="rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-200 overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold">Have a Promo Code?</h3>
              <p className="text-xs text-white/80">
                Redeem for free tokens or discounts
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {showSuccess ? (
            <SuccessDisplay result={redeemResult} />
          ) : (
            <RedeemContent
              code={code}
              setCode={setCode}
              validating={validating}
              redeeming={redeeming}
              validatedCode={validatedCode}
              showSuccess={showSuccess}
              redeemResult={redeemResult}
              validateCode={validateCode}
              redeemCode={redeemCode}
              handleKeyPress={handleKeyPress}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Shared redeem content component
const RedeemContent = ({
  code,
  setCode,
  validating,
  redeeming,
  validatedCode,
  showSuccess,
  redeemResult,
  validateCode,
  redeemCode,
  handleKeyPress
}) => {
  if (showSuccess && redeemResult) {
    return <SuccessDisplay result={redeemResult} />;
  }

  return (
    <div className="space-y-4">
      {/* Code Input */}
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
          }}
          onKeyPress={handleKeyPress}
          placeholder="Enter promo code"
          className="font-mono text-lg tracking-wider uppercase"
          data-testid="promo-code-input"
        />
        <Button
          onClick={() => validateCode()}
          disabled={validating || !code.trim()}
          variant="outline"
          className="shrink-0"
        >
          {validating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Check"
          )}
        </Button>
      </div>

      {/* Validated Code Preview */}
      {validatedCode && (
        <div className="bg-white rounded-xl p-4 border border-green-200 animate-fade-in">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${
                validatedCode.code_type === "tokens" 
                  ? "bg-amber-100" 
                  : "bg-purple-100"
              }`}>
                {validatedCode.code_type === "tokens" ? (
                  <Coins className="w-5 h-5 text-amber-600" />
                ) : (
                  <Percent className="w-5 h-5 text-purple-600" />
                )}
              </div>
              <div>
                <Badge className="bg-green-100 text-green-700 rounded-full">
                  <Check className="w-3 h-3 mr-1" />
                  Valid Code
                </Badge>
                <p className="font-mono font-bold text-lg mt-1">
                  {validatedCode.code}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg p-3 ${
            validatedCode.code_type === "tokens"
              ? "bg-amber-50 border border-amber-200"
              : "bg-purple-50 border border-purple-200"
          }`}>
            <p className={`font-bold text-xl ${
              validatedCode.code_type === "tokens"
                ? "text-amber-600"
                : "text-purple-600"
            }`}>
              {validatedCode.code_type === "tokens" ? (
                <>+{validatedCode.value} Free Tokens</>
              ) : (
                <>{validatedCode.value}% Off Next Purchase</>
              )}
            </p>
            {validatedCode.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {validatedCode.description}
              </p>
            )}
          </div>

          <Button
            onClick={redeemCode}
            disabled={redeeming}
            className="w-full mt-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            data-testid="redeem-btn"
          >
            {redeeming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redeeming...
              </>
            ) : (
              <>
                <Gift className="w-4 h-4 mr-2" />
                Redeem Now
              </>
            )}
          </Button>
        </div>
      )}

      {/* Help text */}
      {!validatedCode && (
        <p className="text-xs text-muted-foreground text-center">
          Enter the code you received from a developer or promotion
        </p>
      )}
    </div>
  );
};

// Success display component
const SuccessDisplay = ({ result }) => {
  if (!result) return null;

  return (
    <div className="text-center py-4 animate-fade-in">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25" />
        <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
      </div>

      <h3 className="font-bold text-xl text-green-600 mb-2">
        Code Redeemed!
      </h3>

      <p className="text-lg">{result.message}</p>

      {result.tokens_awarded > 0 && (
        <div className="mt-4 bg-amber-50 rounded-xl p-4 inline-block">
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-500" />
            <span className="text-2xl font-bold text-amber-600">
              +{result.tokens_awarded}
            </span>
          </div>
          <p className="text-xs text-amber-600">Tokens Added</p>
        </div>
      )}

      {result.discount_awarded > 0 && (
        <div className="mt-4 bg-purple-50 rounded-xl p-4 inline-block">
          <div className="flex items-center gap-2">
            <Percent className="w-6 h-6 text-purple-500" />
            <span className="text-2xl font-bold text-purple-600">
              {result.discount_awarded}% OFF
            </span>
          </div>
          <p className="text-xs text-purple-600">Your Next Purchase</p>
        </div>
      )}
    </div>
  );
};

export default RedeemCodeCard;
