// Audio Training Guide Component
// Provides text-to-speech and text descriptions for training exercises

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Lightbulb,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

// Training exercise descriptions and scenarios
const TRAINING_GUIDES = {
  // Basic Commands
  "basic_sit": {
    title: "Teaching Your Dog to Sit",
    duration: "5-10 minutes",
    difficulty: "Beginner",
    description: "The 'Sit' command is one of the most fundamental and useful commands your dog can learn. It's the foundation for many other commands and helps establish you as the leader.",
    steps: [
      "Hold a treat close to your dog's nose",
      "Move your hand up, allowing their head to follow the treat",
      "As their head moves up, their bottom will naturally lower",
      "Once they're in sitting position, say 'Sit' clearly",
      "Give them the treat and affection immediately",
      "Repeat this sequence several times daily"
    ],
    tips: [
      "Keep training sessions short - 5 to 10 minutes",
      "Always use positive reinforcement",
      "Be patient - some dogs learn faster than others",
      "Practice in different locations once mastered"
    ],
    warnings: [
      "Never push your dog's bottom down forcefully",
      "Don't repeat the command multiple times - say it once clearly"
    ]
  },
  "basic_stay": {
    title: "Teaching Your Dog to Stay",
    duration: "10-15 minutes",
    difficulty: "Beginner",
    description: "The 'Stay' command teaches your dog impulse control and patience. It's essential for safety situations and building trust between you and your pet.",
    steps: [
      "Ask your dog to 'Sit' first",
      "Open your palm toward them and say 'Stay'",
      "Take a few steps back",
      "If they stay, return and reward them",
      "Gradually increase the distance and duration",
      "Release them with a word like 'Okay' or 'Free'"
    ],
    tips: [
      "Start with just a few seconds",
      "Don't move too far too quickly",
      "Always return to reward - don't call them to you initially",
      "Practice with increasing distractions"
    ],
    warnings: [
      "Don't set your dog up for failure - build up slowly",
      "Never punish them for breaking the stay"
    ]
  },
  "basic_come": {
    title: "Teaching Your Dog to Come (Recall)",
    duration: "10-15 minutes",
    difficulty: "Beginner",
    description: "A reliable recall can save your dog's life. This command ensures your dog returns to you immediately when called, regardless of distractions.",
    steps: [
      "Start in a low-distraction environment",
      "Get down to their level and say 'Come' enthusiastically",
      "When they come, reward with treats and praise",
      "Use a long leash for outdoor practice initially",
      "Gradually add distractions as they improve",
      "Never call them for something negative"
    ],
    tips: [
      "Make coming to you the best thing ever",
      "Use high-value treats for recall training",
      "Practice randomly throughout the day",
      "Never chase your dog if they don't come"
    ],
    warnings: [
      "Never punish your dog when they finally come",
      "Don't use 'Come' if you can't enforce it"
    ]
  },
  "basic_down": {
    title: "Teaching Your Dog to Lie Down",
    duration: "10-15 minutes",
    difficulty: "Beginner",
    description: "The 'Down' command is a submissive position that helps calm your dog. It's useful in many situations and is a stepping stone to more advanced commands.",
    steps: [
      "Start with your dog in a sitting position",
      "Hold a treat to their nose, then move it to the floor",
      "Slide the treat along the floor away from them",
      "Their body should follow into a down position",
      "Say 'Down' as they lie down, then reward",
      "Practice until they respond to the verbal cue alone"
    ],
    tips: [
      "Use a carpet or comfortable surface initially",
      "Be patient - this can take longer than 'Sit'",
      "Don't push them into position",
      "Reward small progress initially"
    ],
    warnings: [
      "Some dogs find this position vulnerable - be gentle",
      "Don't hover over them intimidatingly"
    ]
  },
  "basic_heel": {
    title: "Teaching Your Dog to Heel",
    duration: "15-20 minutes",
    difficulty: "Intermediate",
    description: "Heeling teaches your dog to walk calmly at your side without pulling. This makes walks enjoyable and demonstrates good leash manners.",
    steps: [
      "Start with your dog on your left side",
      "Hold treats in your left hand at their nose level",
      "Say 'Heel' and begin walking",
      "Reward them for staying at your side",
      "If they pull ahead, stop and wait",
      "Resume when they return to position"
    ],
    tips: [
      "Start indoors where there are fewer distractions",
      "Keep sessions short to maintain focus",
      "Be consistent with which side they walk on",
      "Use a short leash for better control"
    ],
    warnings: [
      "Don't jerk the leash harshly",
      "Avoid walking when your dog is overly excited"
    ]
  },
  // Default guide for any lesson
  "default": {
    title: "Dog Training Exercise",
    duration: "10-15 minutes",
    difficulty: "Varies",
    description: "This training exercise will help build a stronger bond with your dog while teaching important skills. Remember to always use positive reinforcement and patience.",
    steps: [
      "Prepare high-value treats your dog loves",
      "Choose a quiet, distraction-free environment",
      "Get your dog's attention before starting",
      "Break the exercise into small, achievable steps",
      "Reward progress immediately",
      "End on a positive note"
    ],
    tips: [
      "Keep training sessions short and fun",
      "Practice consistency in your commands",
      "Train when your dog is alert but not overly excited",
      "Always end before your dog gets frustrated"
    ],
    warnings: [
      "Never use physical punishment",
      "Don't train when you're frustrated or impatient"
    ]
  }
};

// Get guide for a lesson
export const getTrainingGuide = (lessonId) => {
  if (!lessonId) return TRAINING_GUIDES.default;
  
  const key = lessonId.toLowerCase();
  
  // Try exact match
  if (TRAINING_GUIDES[key]) {
    return TRAINING_GUIDES[key];
  }
  
  // Try to match by keyword
  for (const [guideKey, guide] of Object.entries(TRAINING_GUIDES)) {
    if (key.includes(guideKey.replace('basic_', '').replace('_', ''))) {
      return guide;
    }
  }
  
  return TRAINING_GUIDES.default;
};

// Text-to-Speech Audio Guide Component
export const AudioTrainingGuide = ({ lessonId, lessonTitle }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const synthRef = useRef(null);
  
  const guide = getTrainingGuide(lessonId);
  
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);
  
  const speak = (text, onEnd) => {
    if (!audioEnabled || !synthRef.current) {
      onEnd?.();
      return;
    }
    
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    
    setIsSpeaking(true);
    synthRef.current.speak(utterance);
  };
  
  const playGuide = () => {
    if (isPlaying) {
      synthRef.current?.cancel();
      setIsPlaying(false);
      setIsSpeaking(false);
      return;
    }
    
    setIsPlaying(true);
    setCurrentStep(0);
    
    // Narrate description first
    speak(guide.description, () => {
      // Then narrate steps
      narrateSteps(0);
    });
  };
  
  const narrateSteps = (stepIndex) => {
    if (stepIndex >= guide.steps.length) {
      setIsPlaying(false);
      setCurrentStep(0);
      return;
    }
    
    setCurrentStep(stepIndex + 1);
    speak(`Step ${stepIndex + 1}: ${guide.steps[stepIndex]}`, () => {
      setTimeout(() => narrateSteps(stepIndex + 1), 500);
    });
  };
  
  const restart = () => {
    synthRef.current?.cancel();
    setIsPlaying(false);
    setIsSpeaking(false);
    setCurrentStep(0);
  };
  
  const toggleAudio = () => {
    if (audioEnabled) {
      synthRef.current?.cancel();
      setIsPlaying(false);
      setIsSpeaking(false);
    }
    setAudioEnabled(!audioEnabled);
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-xl overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-800">Training Guide</h4>
              <p className="text-xs text-blue-600">{guide.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-white">
              {guide.duration}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAudio}
              className="h-8 w-8"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            </Button>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          {guide.description}
        </p>
        
        {/* Audio Controls */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            onClick={playGuide}
            size="sm"
            className={`rounded-full ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
            data-testid="audio-play-btn"
          >
            {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
            {isPlaying ? 'Pause' : 'Listen to Guide'}
          </Button>
          <Button
            onClick={restart}
            size="sm"
            variant="outline"
            className="rounded-full"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Restart
          </Button>
          {isSpeaking && (
            <Badge className="bg-green-100 text-green-700 animate-pulse">
              Speaking...
            </Badge>
          )}
        </div>
        
        {/* Steps */}
        <div className="space-y-2 mb-4">
          <h5 className="font-medium text-sm text-gray-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Step-by-Step Instructions
          </h5>
          <ol className="space-y-2">
            {guide.steps.map((step, index) => (
              <li 
                key={index} 
                className={`text-sm flex items-start gap-2 p-2 rounded-lg transition-colors ${
                  currentStep === index + 1 ? 'bg-blue-100 text-blue-800' : 'text-gray-600'
                }`}
              >
                <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        
        {/* Tips */}
        <div className="bg-green-50 rounded-lg p-3 mb-3">
          <h5 className="font-medium text-sm text-green-800 flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4" />
            Pro Tips
          </h5>
          <ul className="space-y-1">
            {guide.tips.map((tip, index) => (
              <li key={index} className="text-xs text-green-700 flex items-start gap-2">
                <span className="text-green-500">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Warnings */}
        {guide.warnings.length > 0 && (
          <div className="bg-amber-50 rounded-lg p-3">
            <h5 className="font-medium text-sm text-amber-800 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" />
              Important Reminders
            </h5>
            <ul className="space-y-1">
              {guide.warnings.map((warning, index) => (
                <li key={index} className="text-xs text-amber-700 flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioTrainingGuide;
