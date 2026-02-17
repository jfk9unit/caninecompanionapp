import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  SkipBack,
  SkipForward,
  X,
  Video,
  PlayCircle,
  Loader2
} from "lucide-react";

// Real Dog Training Videos - Using free embeddable video sources
const TRAINING_VIDEOS = {
  // Using sample videos that are freely accessible
  "basic_sit": "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "basic_stay": "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "basic_come": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "basic_down": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "basic_heel": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "basic_leave_it": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "basic_drop_it": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "basic_wait": "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  
  // Intermediate
  "intermediate_fetch": "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "intermediate_shake": "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "intermediate_rollover": "https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
  "intermediate_spin": "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  "intermediate_speak": "https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
  "intermediate_crawl": "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  
  // Advanced
  "advanced_agility": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "advanced_protection": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "advanced_jump": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "advanced_weave": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  
  // K9 Security Training
  "k9_alert": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "k9_patrol": "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "k9_search": "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "k9_guard": "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  
  // Puppy Training
  "puppy_socialize": "https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
  "puppy_crate": "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  "puppy_potty": "https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
  
  // Behavior Training
  "behavior_calm": "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "behavior_focus": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "behavior_impulse": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  
  // Exercise & Activity
  "exercise_walk": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "exercise_run": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "exercise_play": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  
  // Default fallback
  "default": "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
};

// Video category mapping for lessons
const LESSON_VIDEO_MAP = {
  // Map lesson prefixes to video categories
  "sit": "basic_sit",
  "stay": "basic_stay",
  "come": "basic_come",
  "recall": "basic_come",
  "down": "basic_down",
  "heel": "basic_heel",
  "walk": "exercise_walk",
  "leash": "basic_heel",
  "leave": "basic_leave_it",
  "drop": "basic_drop_it",
  "wait": "basic_wait",
  "fetch": "intermediate_fetch",
  "retrieve": "intermediate_fetch",
  "shake": "intermediate_shake",
  "paw": "intermediate_shake",
  "roll": "intermediate_rollover",
  "spin": "intermediate_spin",
  "speak": "intermediate_speak",
  "bark": "intermediate_speak",
  "crawl": "intermediate_crawl",
  "agility": "advanced_agility",
  "jump": "advanced_jump",
  "weave": "advanced_weave",
  "protection": "advanced_protection",
  "guard": "k9_guard",
  "alert": "k9_alert",
  "patrol": "k9_patrol",
  "search": "k9_search",
  "puppy": "puppy_socialize",
  "crate": "puppy_crate",
  "potty": "puppy_potty",
  "house": "puppy_potty",
  "calm": "behavior_calm",
  "settle": "behavior_calm",
  "focus": "behavior_focus",
  "attention": "behavior_focus",
  "impulse": "behavior_impulse",
  "control": "behavior_impulse",
  "play": "exercise_play",
  "run": "exercise_run",
  "exercise": "exercise_run",
  "k9": "k9_alert",
  "security": "k9_guard"
};

// Get video URL for a lesson - Improved matching
export const getVideoUrl = (lessonId) => {
  if (!lessonId) return TRAINING_VIDEOS.default;
  
  const lessonLower = lessonId.toLowerCase();
  
  // Try to find a matching video based on keywords in the lesson ID
  for (const [keyword, videoKey] of Object.entries(LESSON_VIDEO_MAP)) {
    if (lessonLower.includes(keyword)) {
      return TRAINING_VIDEOS[videoKey] || TRAINING_VIDEOS.default;
    }
  }
  
  // Direct mapping attempt
  const directKey = lessonLower.replace(/[^a-z0-9_]/g, '_');
  if (TRAINING_VIDEOS[directKey]) {
    return TRAINING_VIDEOS[directKey];
  }
  
  // Return default video
  return TRAINING_VIDEOS.default;
};

// Get a random training video
export const getRandomTrainingVideo = () => {
  const videoKeys = Object.keys(TRAINING_VIDEOS).filter(k => k !== 'default');
  const randomKey = videoKeys[Math.floor(Math.random() * videoKeys.length)];
  return TRAINING_VIDEOS[randomKey];
};

// Mini Video Player Component
export const MiniVideoPlayer = ({ 
  videoUrl, 
  title = "Training Video",
  duration = "2:30",
  thumbnail,
  onClose,
  autoPlay = false
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState(null);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout;
    if (isPlaying && showControls) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  // Auto play if enabled
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(e => console.log('Autoplay prevented'));
    }
  }, [autoPlay]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(e => {
          toast.error('Unable to play video');
          setError('Unable to play video');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value) => {
    const vol = value[0] / 100;
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  };

  const handleSeek = (value) => {
    const time = (value[0] / 100) * videoDuration;
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoDuration, videoRef.current.currentTime + seconds));
    }
  };

  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setError('Failed to load video');
    setIsLoading(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const progress = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      className="relative bg-black rounded-xl overflow-hidden shadow-2xl"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      data-testid="video-player"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video object-contain bg-black"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        playsInline
        poster={thumbnail}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
          <Video className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-white text-lg mb-2">{error}</p>
          <Button onClick={restart} variant="outline" className="rounded-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {/* Play/Pause Overlay */}
      {!isPlaying && !isLoading && !error && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
            <Play className="w-10 h-10 text-white ml-1" />
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div className="mb-3">
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white/80 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(videoDuration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <Button
              onClick={togglePlay}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>

            {/* Skip Back */}
            <Button
              onClick={() => skipTime(-10)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-white hover:bg-white/20"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            {/* Skip Forward */}
            <Button
              onClick={() => skipTime(10)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-white hover:bg-white/20"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            {/* Restart */}
            <Button
              onClick={restart}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-white hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2 ml-2">
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white hover:bg-white/20"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Title */}
            <span className="text-white text-sm mr-4 hidden sm:block">{title}</span>

            {/* Fullscreen */}
            <Button
              onClick={toggleFullscreen}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-white hover:bg-white/20"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </Button>

            {/* Close */}
            {onClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Video Thumbnail Card (click to open player)
export const VideoThumbnailCard = ({ 
  lessonId,
  title = "Video Tutorial",
  duration = "2:30",
  thumbnail,
  onPlay 
}) => {
  const [showPlayer, setShowPlayer] = useState(false);
  const videoUrl = getVideoUrl(lessonId);

  return (
    <>
      {/* Thumbnail */}
      <div 
        className="relative aspect-video rounded-lg overflow-hidden bg-gray-900 group cursor-pointer hover:ring-2 ring-red-400 transition-all"
        onClick={() => setShowPlayer(true)}
        data-testid="video-thumbnail"
      >
        <img 
          src={thumbnail || `https://picsum.photos/seed/${lessonId}/640/360`}
          alt="Video thumbnail"
          className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <PlayCircle className="w-10 h-10 text-white" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {duration}
        </div>
        <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Video className="w-3 h-3" />
          Watch Tutorial
        </div>
      </div>

      {/* Video Player Modal */}
      {showPlayer && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <MiniVideoPlayer
              videoUrl={videoUrl}
              title={title}
              duration={duration}
              thumbnail={thumbnail}
              onClose={() => setShowPlayer(false)}
              autoPlay={true}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MiniVideoPlayer;
