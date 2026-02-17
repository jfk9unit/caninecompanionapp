import { useEffect, useState, useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";

// Pages
import { LandingPage } from "@/pages/LandingPage";
import { AuthPage } from "@/pages/AuthPage";
import { Dashboard } from "@/pages/Dashboard";
import { TrainingCenter } from "@/pages/TrainingCenter";
import { HealthHub } from "@/pages/HealthHub";
import { BreedExplorer } from "@/pages/BreedExplorer";
import { DailyActivities } from "@/pages/DailyActivities";
import { BehaviorTracker } from "@/pages/BehaviorTracker";
import { TravelPlanner } from "@/pages/TravelPlanner";
import { TipsResources } from "@/pages/TipsResources";
import { DogProfile } from "@/pages/DogProfile";
import { TokenShop } from "@/pages/TokenShop";
import { VirtualPet } from "@/pages/VirtualPet";
import { Achievements } from "@/pages/Achievements";
import { VoiceLog } from "@/pages/VoiceLog";
import { Leaderboard } from "@/pages/Leaderboard";
import { K9Training } from "@/pages/K9Training";
import { K9Credentials } from "@/pages/K9Credentials";
import { NotificationSettings } from "@/pages/NotificationSettings";
import { AdminPromoCodes } from "@/pages/AdminPromoCodes";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { PrivacyPolicy } from "@/pages/PrivacyPolicy";
import { TermsOfService } from "@/pages/TermsOfService";
import { CreatorAnalytics } from "@/pages/CreatorAnalytics";
import { EliteNasduCourses } from "@/pages/EliteNasduCourses";
import { NasduPretest } from "@/pages/NasduPretest";
import { BookK9Trainer } from "@/pages/BookK9Trainer";
import { EquipmentShop } from "@/pages/EquipmentShop";
import { ComingSoon } from "@/pages/ComingSoon";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Auth Context
export const AuthContext = ({ children }) => {
  const location = useLocation();
  
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  // Check URL fragment for session_id synchronously during render
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return children;
};

// Auth Callback Component
const AuthCallback = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = window.location.hash;
      const sessionId = new URLSearchParams(hash.substring(1)).get('session_id');
      
      if (!sessionId) {
        navigate('/', { replace: true });
        return;
      }

      try {
        const response = await axios.post(`${API}/auth/session`, 
          { session_id: sessionId },
          { withCredentials: true }
        );
        
        // Clear the hash and navigate to dashboard with user data
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/dashboard', { replace: true, state: { user: response.data } });
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/', { replace: true });
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
};

// Protected Route Component
export const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip if user data was passed from AuthCallback
    if (location.state?.user) {
      setUser(location.state.user);
      setIsAuthenticated(true);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        navigate('/', { replace: true });
      }
    };

    checkAuth();
  }, [navigate, location.state]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Clone children and pass user prop
  return typeof children === 'function' ? children({ user }) : children;
};

function AppRouter() {
  return (
    <AuthContext>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {({ user }) => <Dashboard user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/training" element={
          <ProtectedRoute>
            {({ user }) => <TrainingCenter user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/health" element={
          <ProtectedRoute>
            {({ user }) => <HealthHub user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/breeds" element={
          <ProtectedRoute>
            {({ user }) => <BreedExplorer user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/activities" element={
          <ProtectedRoute>
            {({ user }) => <DailyActivities user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/behavior" element={
          <ProtectedRoute>
            {({ user }) => <BehaviorTracker user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/travel" element={
          <ProtectedRoute>
            {({ user }) => <TravelPlanner user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/tips" element={
          <ProtectedRoute>
            {({ user }) => <TipsResources user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/dog/:dogId" element={
          <ProtectedRoute>
            {({ user }) => <DogProfile user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/tokens" element={
          <ProtectedRoute>
            {({ user }) => <TokenShop user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/pet" element={
          <ProtectedRoute>
            {({ user }) => <VirtualPet user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/achievements" element={
          <ProtectedRoute>
            {({ user }) => <Achievements user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/voice-log" element={
          <ProtectedRoute>
            {({ user }) => <VoiceLog user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            {({ user }) => <Leaderboard user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/k9-training" element={
          <ProtectedRoute>
            {({ user }) => <K9Training user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/k9-credentials" element={
          <ProtectedRoute>
            {({ user }) => <K9Credentials user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            {({ user }) => <NotificationSettings user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/admin/promo-codes" element={
          <ProtectedRoute>
            {({ user }) => <AdminPromoCodes user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            {({ user }) => <AdminDashboard user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            {({ user }) => <CreatorAnalytics user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/redeem" element={
          <ProtectedRoute>
            {({ user }) => <TokenShop user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/elite-courses" element={
          <ProtectedRoute>
            {({ user }) => <EliteNasduCourses user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/nasdu-pretest" element={
          <ProtectedRoute>
            {({ user }) => <NasduPretest user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/book-trainer" element={
          <ProtectedRoute>
            {({ user }) => <BookK9Trainer user={user} />}
          </ProtectedRoute>
        } />
        <Route path="/coming-soon" element={
          <ProtectedRoute>
            {({ user }) => <ComingSoon user={user} />}
          </ProtectedRoute>
        } />
      </Routes>
    </AuthContext>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
