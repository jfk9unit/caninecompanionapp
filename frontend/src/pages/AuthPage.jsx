import { useState } from "react";
import axios from "axios";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Dog,
  Mail,
  Lock,
  User,
  ArrowRight,
  KeyRound,
  CheckCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";

export const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  
  // Password reset state
  const [resetStep, setResetStep] = useState("request"); // "request", "verify", "success"
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  // Google OAuth login
  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };
  
  // Email/Password Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, {
        email: loginEmail,
        password: loginPassword
      }, { withCredentials: true });
      
      toast.success("Login successful!");
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };
  
  // Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (registerPassword !== registerConfirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    if (registerPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register`, {
        email: registerEmail,
        password: registerPassword,
        name: registerName
      }, { withCredentials: true });
      
      toast.success("Registration successful!");
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error(error.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Request password reset
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email");
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API}/auth/password-reset/request`, {
        email: resetEmail
      });
      
      toast.success("Verification code sent to your email!");
      setResetStep("verify");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Verify code and set new password
  const handleVerifyReset = async (e) => {
    e.preventDefault();
    if (!resetCode || !newPassword || !confirmNewPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API}/auth/password-reset/verify`, {
        email: resetEmail,
        code: resetCode,
        new_password: newPassword
      }, { withCredentials: true });
      
      toast.success("Password reset successful!");
      setResetStep("success");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to reset password. Please check your code.");
    } finally {
      setLoading(false);
    }
  };
  
  const closeResetDialog = () => {
    setShowResetDialog(false);
    setResetStep("request");
    setResetEmail("");
    setResetCode("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <Dog className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-gray-900">CanineCompass</h1>
          <p className="text-gray-500 text-sm mt-1">Your K9 Training Companion</p>
        </div>
        
        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden" data-testid="auth-card">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white pb-6">
            <CardTitle className="text-center text-xl">Welcome!</CardTitle>
            <CardDescription className="text-center text-green-100">
              Sign in or create an account to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Google OAuth Button */}
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full rounded-xl h-12 mb-4 flex items-center justify-center gap-3 hover:bg-gray-50"
              data-testid="google-login-btn"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
            
            {/* Login/Register Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 w-full rounded-xl bg-gray-100 p-1">
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-white">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="pl-10 rounded-xl"
                        data-testid="login-email-input"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10 rounded-xl"
                        data-testid="login-password-input"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowResetDialog(true)}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                      data-testid="forgot-password-btn"
                    >
                      Forgot password?
                    </button>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    data-testid="login-submit-btn"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register" className="mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="register-name">Name</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="register-name"
                        type="text"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        placeholder="Your name"
                        className="pl-10 rounded-xl"
                        data-testid="register-name-input"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="pl-10 rounded-xl"
                        data-testid="register-email-input"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="pl-10 rounded-xl"
                        data-testid="register-password-input"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="register-confirm">Confirm Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="register-confirm"
                        type="password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="pl-10 rounded-xl"
                        data-testid="register-confirm-input"
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    data-testid="register-submit-btn"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Back to home */}
        <div className="text-center mt-6">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </a>
        </div>
      </div>
      
      {/* Password Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={closeResetDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-green-600" />
              {resetStep === "request" && "Reset Password"}
              {resetStep === "verify" && "Enter Verification Code"}
              {resetStep === "success" && "Password Reset!"}
            </DialogTitle>
            <DialogDescription>
              {resetStep === "request" && "Enter your email to receive a verification code."}
              {resetStep === "verify" && `We've sent a 6-digit code to ${resetEmail}`}
              {resetStep === "success" && "Your password has been updated successfully."}
            </DialogDescription>
          </DialogHeader>
          
          {resetStep === "request" && (
            <form onSubmit={handleRequestReset} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="reset-email">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10 rounded-xl"
                    data-testid="reset-email-input"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-green-600 hover:bg-green-700"
                data-testid="reset-request-btn"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}
          
          {resetStep === "verify" && (
            <form onSubmit={handleVerifyReset} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="reset-code">Verification Code</Label>
                <Input
                  id="reset-code"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-[0.5em] rounded-xl font-mono"
                  maxLength={6}
                  data-testid="reset-code-input"
                />
              </div>
              
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="pl-10 rounded-xl"
                    data-testid="new-password-input"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirm-new-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10 rounded-xl"
                    data-testid="confirm-new-password-input"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-green-600 hover:bg-green-700"
                data-testid="reset-verify-btn"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              
              <button
                type="button"
                onClick={() => setResetStep("request")}
                className="w-full text-sm text-gray-500 hover:text-gray-700 mt-2"
              >
                Didn't receive the code? Try again
              </button>
            </form>
          )}
          
          {resetStep === "success" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600">Redirecting to dashboard...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthPage;
