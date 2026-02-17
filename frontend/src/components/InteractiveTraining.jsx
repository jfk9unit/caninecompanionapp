import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  CheckCircle,
  Share2,
  Trophy,
  Star,
  Sparkles,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Lightbulb,
  Gift
} from "lucide-react";
import confetti from 'canvas-confetti';

// Celebration confetti effect
const celebrate = () => {
  const count = 200;
  const defaults = { origin: { y: 0.7 } };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      scalar: 1.2
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
};

// Interactive Step Component
export const InteractiveStep = ({ 
  step, 
  stepIndex, 
  isCompleted, 
  isActive, 
  onComplete, 
  totalSteps 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const startTimer = () => {
    setIsTimerRunning(true);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    setTimer(interval);
  };

  const pauseTimer = () => {
    if (timer) clearInterval(timer);
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    if (timer) clearInterval(timer);
    setTimeLeft(30);
    setIsTimerRunning(false);
  };

  const handleComplete = () => {
    if (timer) clearInterval(timer);
    onComplete(stepIndex);
  };

  return (
    <Card 
      className={`rounded-xl transition-all ${
        isCompleted 
          ? 'bg-green-50 border-green-200' 
          : isActive 
          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
          : 'bg-gray-50 opacity-60'
      }`}
    >
      <CardContent className="p-4">
        <div 
          className="flex items-start gap-3 cursor-pointer"
          onClick={() => isActive && setExpanded(!expanded)}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
            isCompleted 
              ? 'bg-green-500 text-white' 
              : isActive 
              ? 'bg-blue-500 text-white animate-pulse' 
              : 'bg-gray-300 text-gray-600'
          }`}>
            {isCompleted ? <CheckCircle className="w-5 h-5" /> : stepIndex + 1}
          </div>
          <div className="flex-1">
            <p className={`font-medium ${isCompleted ? 'text-green-700 line-through' : ''}`}>
              {step}
            </p>
            {isActive && !isCompleted && (
              <p className="text-xs text-blue-600 mt-1">Tap to expand</p>
            )}
          </div>
          {isActive && !isCompleted && (
            <ChevronRight className={`w-5 h-5 text-blue-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          )}
        </div>

        {/* Expanded Interactive Area */}
        {expanded && isActive && !isCompleted && (
          <div className="mt-4 pt-4 border-t border-blue-200 space-y-4 animate-fade-in">
            {/* Practice Timer */}
            <div className="bg-white rounded-xl p-4">
              <p className="text-sm font-medium mb-3">Practice Timer</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-center">{timeLeft}s</div>
                  <Progress value={(timeLeft / 30) * 100} className="h-2 mt-2" />
                </div>
                <div className="flex gap-2">
                  {isTimerRunning ? (
                    <Button size="icon" variant="outline" onClick={pauseTimer}>
                      <Pause className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button size="icon" className="bg-blue-500" onClick={startTimer}>
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="outline" onClick={resetTimer}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Tip */}
            <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Practice this step 5-10 times with treats before moving on. Consistency is key!
              </p>
            </div>

            {/* Complete Button */}
            <Button 
              onClick={handleComplete}
              className="w-full rounded-full bg-green-500 hover:bg-green-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Lesson Completion Celebration Modal
export const LessonCompletionModal = ({ 
  isOpen, 
  onClose, 
  lessonTitle, 
  tokensEarned, 
  xpEarned,
  badgeEarned,
  onShare 
}) => {
  const shareCompletion = () => {
    const text = `🎉 Just completed "${lessonTitle}" on CanineCompass!\n\n🏆 Earned ${xpEarned} XP\n${badgeEarned ? `🥇 New badge: ${badgeEarned}` : ''}\n\nTrain your dog too: ${window.location.origin}`;
    
    if (navigator.share) {
      navigator.share({ title: 'I completed a training lesson!', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    }
    onShare?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center p-8">
        <div className="space-y-6">
          {/* Trophy Animation */}
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center animate-bounce">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-32 h-32 text-amber-300 animate-pulse opacity-50" />
            </div>
          </div>

          <div>
            <h2 className="font-heading font-bold text-2xl text-primary">
              Lesson Complete! 🎉
            </h2>
            <p className="text-muted-foreground mt-2">{lessonTitle}</p>
          </div>

          {/* Rewards */}
          <div className="flex justify-center gap-4">
            <Card className="bg-purple-50 border-purple-200 rounded-xl">
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-purple-700">+{xpEarned}</p>
                <p className="text-xs text-purple-600">XP Earned</p>
              </CardContent>
            </Card>
            {badgeEarned && (
              <Card className="bg-amber-50 border-amber-200 rounded-xl">
                <CardContent className="p-4 text-center">
                  <Gift className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-amber-700">{badgeEarned}</p>
                  <p className="text-xs text-amber-600">New Badge!</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Share CTA */}
          <div className="space-y-3">
            <Button 
              onClick={shareCompletion}
              className="w-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
              data-testid="share-completion-btn"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Achievement
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="w-full rounded-full"
            >
              Continue Training
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Progress Share Card
export const ProgressShareCard = ({ 
  completed, 
  total, 
  lessonTitle,
  onShare 
}) => {
  const percentage = Math.round((completed / total) * 100);

  const handleShare = () => {
    const text = `📚 Making progress on "${lessonTitle}"!\n\n✅ ${completed}/${total} steps completed (${percentage}%)\n\nTraining with @CanineCompass 🐕`;
    
    if (navigator.share) {
      navigator.share({ title: 'My Training Progress', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Progress copied!');
    }
    onShare?.();
  };

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Your Progress</span>
          <Badge className="bg-white/20 text-white rounded-full">
            {percentage}%
          </Badge>
        </div>
        <Progress value={percentage} className="h-2 bg-white/20 mb-3" />
        <Button 
          onClick={handleShare}
          size="sm"
          className="w-full bg-white/20 hover:bg-white/30 rounded-full"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Progress
        </Button>
      </CardContent>
    </Card>
  );
};

// Export celebrate function for use elsewhere
export { celebrate };
