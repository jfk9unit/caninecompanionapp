import { useState, useEffect, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import audioManager from "@/utils/audioManager";
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
  Plus,
  Dumbbell,
  UtensilsCrossed,
  Music,
  Moon,
  Sun,
  Gamepad2,
  TreePine,
  Home,
  Volume2,
  VolumeX,
  Droplets,
  Wind,
  Cookie,
  Hand,
  Dog,
  Siren
} from "lucide-react";

// Enhanced Animated K9 Pet Component with better graphics
const AnimatedK9Pet = ({ mood, isPlaying, isEating, isExercising, isSleeping, isResting, name, action, soundEnabled }) => {
  const [frame, setFrame] = useState(0);
  const [bounce, setBounce] = useState(false);
  const [wagTail, setWagTail] = useState(false);
  const [tongueOut, setTongueOut] = useState(false);
  const [earPerk, setEarPerk] = useState(false);
  const [eyeBlink, setEyeBlink] = useState(false);
  const [pawRaise, setPawRaise] = useState(false);
  const [particles, setParticles] = useState([]);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 60);
      
      // Tail wagging based on happiness
      if (isPlaying || mood >= 70 || isEating) {
        setWagTail(w => !w);
      }
      
      // Tongue out when playing or hot
      if (isPlaying || isExercising) {
        setTongueOut(true);
      } else {
        setTongueOut(false);
      }
      
      // Random ear perk
      if (Math.random() > 0.9) {
        setEarPerk(true);
        setTimeout(() => setEarPerk(false), 500);
      }
      
      // Random eye blink
      if (Math.random() > 0.95) {
        setEyeBlink(true);
        setTimeout(() => setEyeBlink(false), 150);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [isPlaying, mood, isExercising, isEating]);

  // Bounce effect
  useEffect(() => {
    if (isPlaying || isEating || isExercising) {
      setBounce(true);
      const timeout = setTimeout(() => setBounce(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [isPlaying, isEating, isExercising]);

  // Paw raise when resting
  useEffect(() => {
    if (isResting) {
      const interval = setInterval(() => {
        setPawRaise(p => !p);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isResting]);

  // Add particles for actions
  useEffect(() => {
    if (action) {
      const newParticles = [];
      const particleTypes = {
        feed: ['🍖', '🦴', '❤️'],
        play: ['🎾', '⭐', '✨'],
        exercise: ['💪', '🔥', '⚡'],
        treat: ['🍪', '❤️', '✨'],
        rest: ['💤', '😴', '☁️']
      };
      
      const types = particleTypes[action] || ['✨'];
      for (let i = 0; i < 5; i++) {
        newParticles.push({
          id: Date.now() + i,
          emoji: types[Math.floor(Math.random() * types.length)],
          x: 50 + (Math.random() - 0.5) * 60,
          y: 30 + Math.random() * 20,
          delay: i * 0.1
        });
      }
      setParticles(newParticles);
      
      setTimeout(() => setParticles([]), 2000);
    }
  }, [action]);

  // Get expression based on state
  const getExpression = () => {
    if (isSleeping) return "😴";
    if (isEating) return "😋";
    if (isPlaying) return "🤩";
    if (isExercising) return "💪";
    if (isResting) return "😌";
    if (mood >= 90) return "🥰";
    if (mood >= 70) return "😊";
    if (mood >= 50) return "🙂";
    if (mood >= 30) return "😐";
    return "😢";
  };

  // Dog color gradient based on mood
  const getDogColor = () => {
    if (mood >= 80) return { body: "#B8860B", head: "#DAA520", dark: "#8B6914" };
    if (mood >= 50) return { body: "#8B5A2B", head: "#A0522D", dark: "#5D3A1A" };
    return { body: "#6B4423", head: "#8B6347", dark: "#4A2C17" };
  };

  const colors = getDogColor();

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Background Scene */}
      <div className={`relative rounded-3xl overflow-hidden transition-all duration-700 h-72 ${
        isSleeping ? 'bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950' :
        isExercising ? 'bg-gradient-to-b from-emerald-400 via-green-500 to-emerald-600' :
        'bg-gradient-to-b from-sky-400 via-sky-300 to-cyan-200'
      }`}>
        
        {/* Stars for night */}
        {isSleeping && (
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-twinkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 50}%`,
                  width: `${2 + Math.random() * 3}px`,
                  height: `${2 + Math.random() * 3}px`,
                  backgroundColor: i % 3 === 0 ? '#FEF08A' : 'white',
                  animationDelay: `${Math.random() * 3}s`,
                  boxShadow: `0 0 ${4 + Math.random() * 6}px ${i % 3 === 0 ? '#FEF08A' : 'white'}`
                }}
              />
            ))}
            <div className="absolute top-6 right-8">
              <Moon className="w-12 h-12 text-yellow-200 drop-shadow-[0_0_15px_rgba(254,240,138,0.8)]" />
            </div>
          </div>
        )}
        
        {/* Sun for day with rays */}
        {!isSleeping && (
          <div className="absolute top-4 right-6">
            <div className="relative">
              <Sun className="w-14 h-14 text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.8)] animate-spin-slow" />
              {/* Sun rays */}
              <div className="absolute inset-0 animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-6 bg-gradient-to-b from-yellow-300 to-transparent rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                      transformOrigin: '50% 0',
                      transform: `translate(-50%, -100%) rotate(${i * 45}deg) translateY(-20px)`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clouds */}
        {!isSleeping && !isExercising && (
          <>
            <div className="absolute top-8 left-4 w-16 h-8 bg-white/70 rounded-full blur-sm animate-float" />
            <div className="absolute top-12 left-16 w-12 h-6 bg-white/60 rounded-full blur-sm animate-float-delayed" />
            <div className="absolute top-6 left-1/3 w-20 h-10 bg-white/50 rounded-full blur-sm animate-float" style={{animationDelay: '1s'}} />
          </>
        )}
        
        {/* Trees for outdoor scenes */}
        {(isExercising || isPlaying) && (
          <>
            <TreePine className="absolute bottom-16 left-2 w-16 h-16 text-green-800 drop-shadow-lg" />
            <TreePine className="absolute bottom-16 right-4 w-12 h-12 text-green-700 drop-shadow-lg" />
            <TreePine className="absolute bottom-14 left-1/4 w-10 h-10 text-green-600 drop-shadow-lg" />
          </>
        )}
        
        {/* Ground with grass */}
        <div className={`absolute bottom-0 left-0 right-0 h-24 ${
          isSleeping ? 'bg-gradient-to-t from-indigo-950 to-indigo-900' :
          isExercising ? 'bg-gradient-to-t from-green-700 to-green-600' :
          'bg-gradient-to-t from-green-600 to-green-500'
        }`}>
          {/* Grass blades */}
          {!isSleeping && (
            <div className="absolute top-0 left-0 right-0 h-6 flex justify-around items-end overflow-hidden">
              {[...Array(25)].map((_, i) => (
                <div
                  key={i}
                  className={`rounded-t-full ${isExercising ? 'bg-green-500' : 'bg-green-400'}`}
                  style={{ 
                    width: '4px',
                    height: `${10 + Math.random() * 12}px`,
                    transform: `rotate(${(Math.random() - 0.5) * 20}deg)`,
                    animation: 'sway 2s ease-in-out infinite',
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Flowers */}
          {!isSleeping && !isExercising && (
            <>
              <div className="absolute bottom-6 left-8 text-xl animate-bounce-slow">🌸</div>
              <div className="absolute bottom-8 right-12 text-lg animate-bounce-slow" style={{animationDelay: '0.5s'}}>🌼</div>
              <div className="absolute bottom-5 left-1/3 text-sm animate-bounce-slow" style={{animationDelay: '1s'}}>🌺</div>
            </>
          )}
        </div>
        
        {/* Dog house for sleeping */}
        {isSleeping && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
            <div className="relative">
              {/* House body */}
              <div className="w-24 h-16 bg-amber-700 rounded-b-lg relative">
                <div className="absolute inset-x-6 bottom-0 w-12 h-12 bg-amber-900 rounded-t-full" />
              </div>
              {/* Roof */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[45px] border-r-[45px] border-b-[32px] border-l-transparent border-r-transparent border-b-red-700" />
              <Home className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 text-amber-200" />
            </div>
          </div>
        )}

        {/* Animated K9 Dog */}
        <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 z-10 ${bounce ? 'animate-bounce' : ''}`}>
          <div className={`relative w-48 h-48 transition-transform duration-300 ${
            isPlaying ? 'animate-wiggle' : 
            isExercising ? 'animate-pulse' : ''
          }`}>
            {/* Enhanced SVG Dog */}
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
              {/* Shadow under dog */}
              <ellipse cx="100" cy="185" rx="45" ry="10" fill="rgba(0,0,0,0.2)" />
              
              {/* Back legs */}
              <rect x="60" y={isExercising ? "150" : "155"} width="18" height="35" rx="6" fill={colors.body} />
              <rect x="122" y={isExercising ? "150" : "155"} width="18" height="35" rx="6" fill={colors.body} />
              
              {/* Paws */}
              <ellipse cx="69" cy="188" rx="12" ry="6" fill={colors.dark} />
              <ellipse cx="131" cy="188" rx="12" ry="6" fill={colors.dark} />
              
              {/* Tail with wag animation */}
              <g transform={`rotate(${wagTail ? 35 : -15}, 155, 115)`}>
                <path 
                  d="M150,115 Q175,90 180,70 Q185,50 170,60 Q160,70 155,100 Z" 
                  fill={colors.body}
                />
                <ellipse cx="175" cy="62" rx="8" ry="6" fill={colors.dark} />
              </g>
              
              {/* Body */}
              <ellipse cx="100" cy="130" rx="55" ry="40" fill={colors.body} />
              
              {/* Body highlights */}
              <ellipse cx="85" cy="120" rx="20" ry="15" fill={colors.head} opacity="0.5" />
              
              {/* Front legs */}
              <rect x="70" y="155" width="16" height="32" rx="5" fill={colors.body} />
              <rect x="114" y="155" width="16" height="32" rx="5" fill={colors.body} />
              
              {/* Front paws */}
              <ellipse cx="78" cy="186" rx="11" ry="5" fill={colors.dark} />
              <ellipse cx="122" cy="186" rx="11" ry="5" fill={colors.dark} />
              
              {/* Raised paw for resting */}
              {pawRaise && (
                <g>
                  <rect x="114" y="140" width="16" height="25" rx="5" fill={colors.body} transform="rotate(-30, 122, 152)" />
                  <ellipse cx="110" cy="145" rx="11" ry="5" fill={colors.dark} transform="rotate(-30, 110, 145)" />
                </g>
              )}
              
              {/* Neck */}
              <ellipse cx="100" cy="95" rx="30" ry="25" fill={colors.body} />
              
              {/* Head */}
              <circle cx="100" cy="65" r="42" fill={colors.head} />
              
              {/* Head highlight */}
              <circle cx="85" cy="50" r="15" fill="white" opacity="0.15" />
              
              {/* Ears */}
              <ellipse 
                cx="55" cy="45" rx="18" ry="30" 
                fill={colors.dark}
                transform={`rotate(${earPerk ? -20 : (wagTail ? -12 : -8)}, 55, 45)`}
              />
              <ellipse 
                cx="145" cy="45" rx="18" ry="30" 
                fill={colors.dark}
                transform={`rotate(${earPerk ? 20 : (wagTail ? 12 : 8)}, 145, 45)`}
              />
              
              {/* Inner ears */}
              <ellipse 
                cx="55" cy="48" rx="10" ry="18" 
                fill="#FFB6C1"
                transform={`rotate(${earPerk ? -20 : (wagTail ? -12 : -8)}, 55, 48)`}
                opacity="0.6"
              />
              <ellipse 
                cx="145" cy="48" rx="10" ry="18" 
                fill="#FFB6C1"
                transform={`rotate(${earPerk ? 20 : (wagTail ? 12 : 8)}, 145, 48)`}
                opacity="0.6"
              />
              
              {/* Snout */}
              <ellipse cx="100" cy="80" rx="22" ry="18" fill="#E8D4B8" />
              <ellipse cx="100" cy="85" rx="18" ry="12" fill="#F5E6D3" />
              
              {/* Nose */}
              <ellipse cx="100" cy="75" rx="10" ry="7" fill="#1A1A1A" />
              <ellipse cx="97" cy="73" rx="3" ry="2" fill="#4A4A4A" />
              
              {/* Mouth line */}
              <path d="M90,88 Q100,95 110,88" stroke={colors.dark} strokeWidth="2" fill="none" />
              
              {/* Tongue when panting */}
              {tongueOut && (
                <g>
                  <ellipse cx="100" cy="98" rx="8" ry="12" fill="#FF6B9D" />
                  <ellipse cx="100" cy="95" rx="6" ry="4" fill="#FF8DB3" />
                </g>
              )}
              
              {/* Eyes */}
              {!eyeBlink && !isSleeping ? (
                <>
                  <ellipse cx="78" cy="58" rx="12" ry="14" fill="white" />
                  <ellipse cx="122" cy="58" rx="12" ry="14" fill="white" />
                  <circle cx={78 + (isPlaying ? 2 : 0)} cy="60" r="7" fill="#3D2314" />
                  <circle cx={122 + (isPlaying ? 2 : 0)} cy="60" r="7" fill="#3D2314" />
                  {/* Eye shine */}
                  <circle cx="81" cy="56" r="3" fill="white" />
                  <circle cx="125" cy="56" r="3" fill="white" />
                  {/* Small shine */}
                  <circle cx="76" cy="62" r="1.5" fill="white" />
                  <circle cx="120" cy="62" r="1.5" fill="white" />
                </>
              ) : (
                <>
                  {/* Closed eyes */}
                  <path d="M68,58 Q78,65 88,58" stroke={colors.dark} strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M112,58 Q122,65 132,58" stroke={colors.dark} strokeWidth="3" fill="none" strokeLinecap="round" />
                </>
              )}
              
              {/* Eyebrows */}
              <path d={`M65,45 Q78,${mood >= 70 ? '40' : '48'} 90,45`} stroke={colors.dark} strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d={`M110,45 Q122,${mood >= 70 ? '40' : '48'} 135,45`} stroke={colors.dark} strokeWidth="3" fill="none" strokeLinecap="round" />
              
              {/* Whisker dots */}
              <circle cx="70" cy="82" r="2" fill={colors.dark} />
              <circle cx="65" cy="78" r="2" fill={colors.dark} />
              <circle cx="130" cy="82" r="2" fill={colors.dark} />
              <circle cx="135" cy="78" r="2" fill={colors.dark} />
              
              {/* Collar */}
              <rect x="70" y="98" width="60" height="10" rx="3" fill="#DC2626" />
              <rect x="72" y="100" width="56" height="2" fill="#EF4444" />
              
              {/* Collar tag */}
              <circle cx="100" cy="112" r="6" fill="#FCD34D" />
              <circle cx="100" cy="112" r="4" fill="#F59E0B" />
              <text x="100" y="114" fontSize="5" fill="white" textAnchor="middle" fontWeight="bold">★</text>
            </svg>
          </div>
          
          {/* ZZZ when sleeping */}
          {isSleeping && (
            <div className="absolute top-0 right-0 text-2xl animate-float">
              <span className="text-white font-bold opacity-80" style={{animationDelay: '0.2s'}}>Z</span>
              <span className="text-white/70 text-xl" style={{animationDelay: '0.4s'}}>z</span>
              <span className="text-white/50 text-lg" style={{animationDelay: '0.6s'}}>z</span>
            </div>
          )}
          
          {/* Action items */}
          {isEating && (
            <div className="absolute -bottom-2 right-0 animate-bounce">
              <span className="text-4xl drop-shadow-lg">🍖</span>
            </div>
          )}
          
          {isPlaying && (
            <div className="absolute -bottom-2 left-0 animate-bounce">
              <span className="text-4xl drop-shadow-lg">🎾</span>
            </div>
          )}
          
          {isExercising && (
            <div className="absolute top-0 right-0 animate-pulse">
              <span className="text-3xl">💪</span>
            </div>
          )}
        </div>

        {/* Floating particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute text-2xl animate-float-up"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.delay}s`
            }}
          >
            {p.emoji}
          </div>
        ))}
        
        {/* Pet Name Badge */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
          <Badge className="bg-white/95 text-gray-800 rounded-full px-5 py-2 text-lg font-bold shadow-xl border-2 border-amber-300">
            <PawPrint className="w-4 h-4 mr-2 text-amber-500" />
            {name}
          </Badge>
        </div>
        
        {/* Expression indicator */}
        <div className="absolute bottom-2 right-4 z-20">
          <span className="text-3xl drop-shadow-lg">{getExpression()}</span>
        </div>
      </div>
    </div>
  );
};

// Interactive Progress Bar Component
const InteractiveProgressBar = ({ value, max, icon: Icon, color, label, onIncrease }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="relative group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          {label}
        </span>
        <span className="text-sm font-bold">{Math.round(percentage)}%</span>
      </div>
      
      <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
        {/* Animated fill */}
        <div 
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
            percentage >= 70 ? 'bg-gradient-to-r from-green-400 to-green-500' :
            percentage >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
            'bg-gradient-to-r from-red-400 to-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
        
        {/* Markers */}
        <div className="absolute inset-0 flex justify-around items-center px-2">
          {[25, 50, 75].map((mark) => (
            <div 
              key={mark}
              className={`w-0.5 h-3 rounded ${percentage >= mark ? 'bg-white/50' : 'bg-gray-400/30'}`}
            />
          ))}
        </div>
      </div>
      
      {/* Low warning */}
      {percentage < 30 && (
        <p className="text-xs text-red-500 mt-1 animate-pulse">Low! Time to {label.toLowerCase()}!</p>
      )}
    </div>
  );
};

// Activity Button Component
const ActivityButton = ({ icon: Icon, label, sublabel, color, onClick, disabled, loading }) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative w-full h-20 rounded-2xl ${color} hover:scale-[1.02] transition-all duration-200 overflow-hidden group`}
      data-testid={`${label.toLowerCase().replace(' ', '-')}-btn`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,white,transparent_70%)]" />
      </div>
      
      <div className="relative flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-white/20 group-hover:scale-110 transition-transform ${loading ? 'animate-spin' : ''}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <p className="font-bold text-white">{label}</p>
          <p className="text-xs text-white/80">{sublabel}</p>
        </div>
      </div>
      
      {/* Sparkle effect on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Sparkles className="w-5 h-5 text-white/60 animate-pulse" />
      </div>
    </Button>
  );
};

const SKILLS = [
  { id: "sit", name: "Sit", icon: "🐕", description: "Basic obedience command" },
  { id: "stay", name: "Stay", icon: "🦮", description: "Hold position until released" },
  { id: "fetch", name: "Fetch", icon: "🎾", description: "Retrieve thrown objects" },
  { id: "roll", name: "Roll Over", icon: "🔄", description: "Fun trick to impress" },
  { id: "shake", name: "Shake Hands", icon: "🤝", description: "Polite greeting" },
  { id: "speak", name: "Speak", icon: "🗣️", description: "Bark on command" },
  { id: "heel", name: "Heel", icon: "👟", description: "Walk beside handler" },
  { id: "down", name: "Down", icon: "⬇️", description: "Lie down on command" },
  { id: "jump", name: "Jump", icon: "🦘", description: "Athletic agility skill" },
  { id: "crawl", name: "Crawl", icon: "🐛", description: "Army crawl trick" },
  { id: "spin", name: "Spin", icon: "🌀", description: "Spin in a circle" },
  { id: "highfive", name: "High Five", icon: "✋", description: "Elevated paw touch" },
];

const EXERCISES = [
  { id: "walk", name: "Go for Walk", icon: TreePine, xp: 10, energy: -15, happiness: 20, duration: "15 min", color: "bg-green-500" },
  { id: "run", name: "Run & Play", icon: Zap, xp: 20, energy: -25, happiness: 30, duration: "20 min", color: "bg-orange-500" },
  { id: "swim", name: "Swimming", icon: Sparkles, xp: 25, energy: -20, happiness: 35, duration: "25 min", color: "bg-blue-500" },
  { id: "agility", name: "Agility Course", icon: Dumbbell, xp: 30, energy: -30, happiness: 40, duration: "30 min", color: "bg-purple-500" },
];

export const VirtualPet = ({ user }) => {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newPetName, setNewPetName] = useState("");
  const [tokens, setTokens] = useState(user?.tokens || 0);
  const [activeTab, setActiveTab] = useState("care");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEating, setIsEating] = useState(false);
  const [isExercising, setIsExercising] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentAction, setCurrentAction] = useState(null);

  useEffect(() => {
    fetchPet();
    fetchTokens();
  }, []);

  // Simulate natural stat decay over time
  useEffect(() => {
    if (!pet) return;
    
    const decayInterval = setInterval(() => {
      // Stats naturally decrease over time (for demo purposes)
      // In real app, this would be calculated server-side
    }, 60000); // Every minute
    
    return () => clearInterval(decayInterval);
  }, [pet]);

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
      toast.success(`${newPetName} is ready to play! 🎉`);
    } catch (error) {
      toast.error('Failed to create pet');
    }
  };

  const feedPet = async () => {
    setActionLoading('feed');
    setIsEating(true);
    setCurrentAction('feed');
    
    // Play realistic eating sounds
    if (soundEnabled) {
      audioManager.barkHappy();
      setTimeout(() => audioManager.play('eat'), 300);
      setTimeout(() => audioManager.play('eat'), 600);
    }
    
    try {
      const response = await axios.post(`${API}/virtual-pet/feed`, {}, { withCredentials: true });
      toast.success(`${pet.name} loved the meal! 🍖`);
      
      // Happy bark after eating
      if (soundEnabled) {
        setTimeout(() => audioManager.barkHappy(), 800);
      }
      
      await fetchPet();
      setTimeout(() => {
        setIsEating(false);
        setCurrentAction(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to feed pet');
      if (soundEnabled) audioManager.whimper();
      setIsEating(false);
      setCurrentAction(null);
    } finally {
      setActionLoading(null);
    }
  };

  const playWithPet = async (playType = 'fetch') => {
    setActionLoading('play');
    setIsPlaying(true);
    setCurrentAction('play');
    
    // Play realistic sounds based on play type
    if (soundEnabled) {
      audioManager.barkExcited();
      if (playType === 'fetch') {
        setTimeout(() => audioManager.barkPlayful(), 300);
      }
    }
    
    try {
      const response = await axios.post(`${API}/virtual-pet/play`, {}, { withCredentials: true });
      toast.success(`${pet.name} had a blast! +${response.data.xp_gained} XP 🎾`);
      
      // Happy bark after playing
      if (soundEnabled) {
        setTimeout(() => audioManager.barkHappy(), 500);
      }
      
      await fetchPet();
      setTimeout(() => {
        setIsPlaying(false);
        setCurrentAction(null);
      }, 3000);
    } catch (error) {
      toast.error('Failed to play with pet');
      setIsPlaying(false);
      setCurrentAction(null);
    } finally {
      setActionLoading(null);
    }
  };

  const exercisePet = async (exercise) => {
    setActionLoading(exercise.id);
    setIsExercising(true);
    setCurrentAction('exercise');
    
    // Play realistic sounds based on exercise type
    if (soundEnabled) {
      if (exercise.id === 'walk' || exercise.id === 'run') {
        audioManager.play('running');
        audioManager.barkHappy();
      } else if (exercise.id === 'swim') {
        audioManager.play('drinking');
        setTimeout(() => audioManager.pant(), 500);
      } else if (exercise.id === 'agility') {
        audioManager.barkExcited();
        audioManager.play('running');
      }
    }
    
    try {
      const response = await axios.post(`${API}/virtual-pet/play`, {}, { withCredentials: true });
      toast.success(`${pet.name} completed ${exercise.name}! +${response.data.xp_gained} XP 💪`);
      
      // Panting after exercise
      if (soundEnabled) {
        setTimeout(() => audioManager.pant(), 800);
      }
      
      await fetchPet();
      setTimeout(() => {
        setIsExercising(false);
        setCurrentAction(null);
      }, 2000);
    } catch (error) {
      toast.error('Exercise failed - pet needs more energy!');
      if (soundEnabled) audioManager.whimper();
      setIsExercising(false);
      setCurrentAction(null);
    } finally {
      setActionLoading(null);
    }
  };

  const putPetToSleep = () => {
    setIsSleeping(true);
    setCurrentAction('rest');
    
    if (soundEnabled) {
      audioManager.whine();
      setTimeout(() => audioManager.snore(), 1000);
    }
    
    toast.success(`${pet.name} is taking a nap... 💤`);
    setTimeout(() => {
      setIsSleeping(false);
      setCurrentAction(null);
      if (soundEnabled) audioManager.barkHappy();
      toast.success(`${pet.name} woke up refreshed! ☀️`);
    }, 5000);
  };

  const restPet = () => {
    setIsResting(true);
    setCurrentAction('rest');
    
    if (soundEnabled) {
      audioManager.whine();
    }
    
    toast.success(`${pet.name} is relaxing... 😌`);
    setTimeout(() => {
      setIsResting(false);
      setCurrentAction(null);
      if (soundEnabled) audioManager.barkHappy();
    }, 3000);
  };

  const giveTreat = () => {
    setCurrentAction('treat');
    
    if (soundEnabled) {
      audioManager.barkHappy();
      setTimeout(() => audioManager.play('eat'), 200);
    }
    
    toast.success(`${pet.name} loves the treat! 🍪`);
    setTimeout(() => setCurrentAction(null), 2000);
  };

  const playMusic = () => {
    if (soundEnabled) {
      audioManager.whine();
    }
    toast.success(`${pet.name} is enjoying calm music... 🎵`);
  };

  // Realistic sound actions with actual audio files
  const doHowl = () => {
    if (soundEnabled) {
      audioManager.howlLong();
    }
    toast.success(`${pet.name} lets out a beautiful howl! 🐺🎶`);
  };

  const doWolfHowl = () => {
    if (soundEnabled) {
      audioManager.howlWolf();
    }
    toast.success(`${pet.name} howls like a wild wolf! 🐺🌙`);
  };

  const doGrowl = () => {
    if (soundEnabled) {
      audioManager.growlDeep();
    }
    toast.success(`${pet.name} shows their fierce side! 😤`);
  };

  const doAlertBark = () => {
    if (soundEnabled) {
      audioManager.barkAlert();
    }
    toast.success(`${pet.name} is on alert! 🚨`);
  };

  const doPlayfulYip = () => {
    if (soundEnabled) {
      audioManager.yip();
    }
    toast.success(`${pet.name} is feeling playful! 🎉`);
  };

  const trainSkill = async (skillId) => {
    setActionLoading(skillId);
    
    // Bark when starting training
    if (soundEnabled) {
      audioManager.barkAlert();
    }
    
    try {
      const response = await axios.post(`${API}/virtual-pet/train`, {
        skill: skillId
      }, { withCredentials: true });
      
      // Success sound and bark
      if (soundEnabled) {
        audioManager.success();
        setTimeout(() => audioManager.barkHappy(), 300);
      }
      
      toast.success(`${pet.name} learned a new skill! 🎓`);
      fetchPet();
      fetchTokens();
    } catch (error) {
      if (soundEnabled) audioManager.whimper();
      if (error.response?.data?.detail?.includes('tokens')) {
        toast.error('Not enough tokens! Visit the Token Shop.');
      } else {
        toast.error('Training failed');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    audioManager.setEnabled(newState);
    setSoundEnabled(newState);
    toast.info(newState ? 'Sounds enabled 🔊' : 'Sounds muted 🔇');
  };

  if (loading) {
    return (
      <AppLayout user={user}>
        {() => (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user}>
      {({ dogs }) => (
        <div className="space-y-6 animate-fade-in" data-testid="virtual-pet">
          {!pet ? (
            /* Create Pet */
            <div className="max-w-lg mx-auto text-center py-12">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center mx-auto mb-6 animate-bounce-slow shadow-xl">
                <PawPrint className="w-16 h-16 text-amber-700" />
              </div>
              <h1 className="font-heading font-bold text-3xl mb-3">Create Your Virtual K9</h1>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Adopt your own virtual German Shepherd! Train skills, exercise together, and watch your bond grow. It's completely FREE to play!
              </p>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-8 py-6 text-lg" data-testid="create-pet-btn">
                    <Plus className="w-5 h-5 mr-2" />
                    Adopt Your K9
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <PawPrint className="w-5 h-5 text-amber-500" />
                      Name Your K9 Companion
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Pet Name</Label>
                      <Input
                        value={newPetName}
                        onChange={(e) => setNewPetName(e.target.value)}
                        placeholder="e.g., Rex, Max, Luna"
                        className="mt-1"
                        data-testid="pet-name-input"
                      />
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-sm text-green-700 font-medium">🎮 100% Free to Play!</p>
                      <p className="text-xs text-green-600 mt-1">All activities are free. Only skill training uses tokens.</p>
                    </div>
                    <Button onClick={createPet} className="w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-600" data-testid="confirm-create-pet">
                      <PawPrint className="w-4 h-4 mr-2" />
                      Create My K9
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            /* Pet Dashboard */
            <>
              {/* Animated Pet Display */}
              <div className="relative">
                <Card className="overflow-hidden rounded-3xl border-0 shadow-xl">
                  <div className="h-80 sm:h-96">
                    <AnimatedK9Pet 
                      mood={pet.happiness}
                      isPlaying={isPlaying}
                      isEating={isEating}
                      isExercising={isExercising}
                      isSleeping={isSleeping}
                      isResting={isResting}
                      name={pet.name}
                      action={currentAction}
                      soundEnabled={soundEnabled}
                    />
                    
                    {/* Sound Toggle Button */}
                    <Button
                      onClick={toggleSound}
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 z-20 bg-white/80 rounded-full shadow-md hover:bg-white"
                      data-testid="sound-toggle-btn"
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </Card>
                
                {/* Quick Stats Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-around">
                  <Badge className="bg-white/90 backdrop-blur-sm text-gray-800 rounded-full px-4 py-2 shadow-lg">
                    <Star className="w-4 h-4 mr-1 text-purple-500" />
                    Level {pet.training_level}
                  </Badge>
                  <Badge className="bg-white/90 backdrop-blur-sm text-gray-800 rounded-full px-4 py-2 shadow-lg">
                    <Trophy className="w-4 h-4 mr-1 text-amber-500" />
                    {pet.experience_points} XP
                  </Badge>
                  <Badge className="bg-white/90 backdrop-blur-sm text-gray-800 rounded-full px-4 py-2 shadow-lg">
                    <GraduationCap className="w-4 h-4 mr-1 text-blue-500" />
                    {pet.skills_unlocked?.length || 0} Skills
                  </Badge>
                </div>
              </div>

              {/* Interactive Stats */}
              <Card className="rounded-2xl">
                <CardContent className="p-6 space-y-4">
                  <InteractiveProgressBar 
                    value={pet.happiness} 
                    max={100} 
                    icon={Heart}
                    color="text-pink-500"
                    label="Happiness"
                  />
                  <InteractiveProgressBar 
                    value={pet.energy} 
                    max={100} 
                    icon={Zap}
                    color="text-yellow-500"
                    label="Energy"
                  />
                  
                  {/* XP Progress */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        Level {pet.training_level} Progress
                      </span>
                      <span className="text-sm">{pet.experience_points % 100}/100 XP</span>
                    </div>
                    <Progress value={pet.experience_points % 100} className="h-4 rounded-full bg-purple-100" />
                  </div>
                </CardContent>
              </Card>

              {/* Activity Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 bg-white rounded-2xl p-1 shadow-md">
                  <TabsTrigger value="care" className="rounded-xl data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                    <Heart className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Care</span>
                  </TabsTrigger>
                  <TabsTrigger value="play" className="rounded-xl data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    <Gamepad2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Play</span>
                  </TabsTrigger>
                  <TabsTrigger value="exercise" className="rounded-xl data-[state=active]:bg-green-500 data-[state=active]:text-white">
                    <Dumbbell className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Exercise</span>
                  </TabsTrigger>
                  <TabsTrigger value="train" className="rounded-xl data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                    <GraduationCap className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Train</span>
                  </TabsTrigger>
                </TabsList>

                {/* Care Tab */}
                <TabsContent value="care" className="mt-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <ActivityButton
                      icon={Bone}
                      label="Feed"
                      sublabel="+20 Happiness (FREE)"
                      color="bg-gradient-to-r from-pink-500 to-rose-500"
                      onClick={feedPet}
                      disabled={isEating || isSleeping}
                      loading={actionLoading === 'feed'}
                    />
                    <ActivityButton
                      icon={Moon}
                      label="Rest"
                      sublabel="Recover Energy (FREE)"
                      color="bg-gradient-to-r from-indigo-500 to-purple-500"
                      onClick={putPetToSleep}
                      disabled={isSleeping}
                      loading={false}
                    />
                    <ActivityButton
                      icon={Cookie}
                      label="Give Treat"
                      sublabel="+10 Happiness (FREE)"
                      color="bg-gradient-to-r from-amber-500 to-orange-500"
                      onClick={giveTreat}
                      disabled={isEating || isSleeping}
                      loading={false}
                    />
                    <ActivityButton
                      icon={Music}
                      label="Calm Music"
                      sublabel="+5 Happiness (FREE)"
                      color="bg-gradient-to-r from-cyan-500 to-teal-500"
                      onClick={playMusic}
                      disabled={isSleeping}
                      loading={false}
                    />
                  </div>
                </TabsContent>

                {/* Play Tab */}
                <TabsContent value="play" className="mt-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <ActivityButton
                      icon={Play}
                      label="Play Fetch"
                      sublabel="+15 XP, +25 Happiness (FREE)"
                      color="bg-gradient-to-r from-blue-500 to-cyan-500"
                      onClick={() => playWithPet('fetch')}
                      disabled={isPlaying || isSleeping || pet.energy < 10}
                      loading={actionLoading === 'play'}
                    />
                    <ActivityButton
                      icon={Gamepad2}
                      label="Tug of War"
                      sublabel="+20 XP, +30 Happiness (FREE)"
                      color="bg-gradient-to-r from-purple-500 to-pink-500"
                      onClick={() => playWithPet('tug')}
                      disabled={isPlaying || isSleeping || pet.energy < 15}
                      loading={false}
                    />
                    <ActivityButton
                      icon={PawPrint}
                      label="Chase"
                      sublabel="+25 XP, +35 Happiness (FREE)"
                      color="bg-gradient-to-r from-orange-500 to-red-500"
                      onClick={playWithPet}
                      disabled={isPlaying || isSleeping || pet.energy < 20}
                      loading={false}
                    />
                    <ActivityButton
                      icon={Sparkles}
                      label="Belly Rubs"
                      sublabel="+5 XP, +15 Happiness (FREE)"
                      color="bg-gradient-to-r from-rose-400 to-pink-400"
                      onClick={() => {
                        toast.success(`${pet.name} loves belly rubs! 🥰`);
                        fetchPet();
                      }}
                      disabled={isSleeping}
                      loading={false}
                    />
                  </div>
                </TabsContent>

                {/* Sounds Tab - NEW */}
                <TabsContent value="sounds" className="mt-4">
                  <div className="mb-4">
                    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Volume2 className="w-5 h-5 text-amber-600" />
                          <div>
                            <h4 className="font-medium text-amber-800">K9 Sound Library</h4>
                            <p className="text-xs text-amber-600">Tap to hear {pet.name} make different sounds!</p>
                          </div>
                          <Button
                            onClick={toggleSound}
                            variant="outline"
                            size="sm"
                            className="ml-auto rounded-full"
                          >
                            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <ActivityButton
                      icon={Volume2}
                      label="Howl"
                      sublabel="Beautiful long howl 🎶"
                      color="bg-gradient-to-r from-indigo-500 to-blue-600"
                      onClick={doHowl}
                      disabled={isSleeping || !soundEnabled}
                      loading={false}
                    />
                    <ActivityButton
                      icon={Moon}
                      label="Wolf Howl"
                      sublabel="Wild wolf-like howl 🌙"
                      color="bg-gradient-to-r from-purple-600 to-indigo-700"
                      onClick={doWolfHowl}
                      disabled={isSleeping || !soundEnabled}
                      loading={false}
                    />
                    <ActivityButton
                      icon={Zap}
                      label="Deep Growl"
                      sublabel="Fierce protective growl 😤"
                      color="bg-gradient-to-r from-red-500 to-orange-600"
                      onClick={doGrowl}
                      disabled={isSleeping || !soundEnabled}
                      loading={false}
                    />
                    <ActivityButton
                      icon={Star}
                      label="Alert Bark"
                      sublabel="Sharp warning bark 🚨"
                      color="bg-gradient-to-r from-yellow-500 to-amber-600"
                      onClick={doAlertBark}
                      disabled={isSleeping || !soundEnabled}
                      loading={false}
                    />
                    <ActivityButton
                      icon={Sparkles}
                      label="Playful Yip"
                      sublabel="Happy playful sound 🎉"
                      color="bg-gradient-to-r from-pink-500 to-rose-500"
                      onClick={doPlayfulYip}
                      disabled={isSleeping || !soundEnabled}
                      loading={false}
                    />
                    <ActivityButton
                      icon={Heart}
                      label="Happy Bark"
                      sublabel="Cheerful bark! 🐕"
                      color="bg-gradient-to-r from-green-500 to-emerald-600"
                      onClick={() => { if (soundEnabled) audioManager.barkHappy(); toast.success(`${pet.name} is happy!`); }}
                      disabled={isSleeping || !soundEnabled}
                      loading={false}
                    />
                  </div>
                  {!soundEnabled && (
                    <Card className="mt-4 bg-gray-50 border-gray-200">
                      <CardContent className="p-4 flex items-center gap-3">
                        <VolumeX className="w-5 h-5 text-gray-500" />
                        <p className="text-sm text-gray-600">
                          Sounds are muted. Enable sounds to hear {pet.name}!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Exercise Tab */}
                <TabsContent value="exercise" className="mt-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {EXERCISES.map((exercise) => (
                      <ActivityButton
                        key={exercise.id}
                        icon={exercise.icon}
                        label={exercise.name}
                        sublabel={`+${exercise.xp} XP, ${exercise.duration} (FREE)`}
                        color={exercise.color}
                        onClick={() => exercisePet(exercise)}
                        disabled={isExercising || isSleeping || pet.energy < Math.abs(exercise.energy)}
                        loading={actionLoading === exercise.id}
                      />
                    ))}
                  </div>
                  {pet.energy < 30 && (
                    <Card className="mt-4 bg-amber-50 border-amber-200">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <p className="text-sm text-amber-700">
                          Low energy! Let {pet.name} rest before more exercise.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Train Tab */}
                <TabsContent value="train" className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-semibold">Learn New Skills</h3>
                    <Badge variant="outline" className="rounded-full">
                      <Coins className="w-3 h-3 mr-1 text-amber-500" />
                      {tokens} Tokens | 1 per skill
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {SKILLS.map((skill) => {
                      const isUnlocked = pet.skills_unlocked?.includes(skill.id);
                      return (
                        <Card 
                          key={skill.id}
                          className={`rounded-xl transition-all ${
                            isUnlocked 
                              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                              : 'bg-white hover:shadow-md hover:scale-[1.02] cursor-pointer'
                          }`}
                          data-testid={`skill-${skill.id}`}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="text-3xl mb-2">{skill.icon}</div>
                            <h4 className="font-medium text-sm">{skill.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
                            {isUnlocked ? (
                              <Badge className="mt-2 bg-green-100 text-green-700 rounded-full text-xs">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                Mastered!
                              </Badge>
                            ) : (
                              <Button
                                onClick={() => trainSkill(skill.id)}
                                disabled={actionLoading === skill.id || tokens < 1 || isSleeping}
                                variant="outline"
                                size="sm"
                                className="mt-2 rounded-full text-xs w-full"
                                data-testid={`train-${skill.id}-btn`}
                              >
                                <Coins className="w-3 h-3 mr-1 text-amber-500" />
                                Train (1 Token)
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Level Progress Card */}
              <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white rounded-2xl overflow-hidden">
                <CardContent className="p-6 relative">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                          <Trophy className="w-6 h-6" />
                        </div>
                        <span className="font-semibold">Level {pet.training_level} Progress</span>
                      </div>
                      <span className="text-white/80">
                        {pet.experience_points % 100}/100 XP
                      </span>
                    </div>
                    <Progress value={pet.experience_points % 100} className="h-4 rounded-full bg-white/20" />
                    <p className="text-sm text-white/80 mt-2">
                      🎯 {100 - (pet.experience_points % 100)} XP until Level {pet.training_level + 1}!
                    </p>
                  </div>
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
