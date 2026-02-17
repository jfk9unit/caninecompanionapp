// Real Dog Sound Audio Manager
// Uses actual audio files for realistic dog sounds

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.7;
    this.audioCache = {};
    
    // High-quality dog sound URLs from free sources
    this.soundUrls = {
      // Barks
      bark_happy: 'https://cdn.freesound.org/previews/615/615089_5674468-lq.mp3',
      bark_alert: 'https://cdn.freesound.org/previews/351/351823_4068345-lq.mp3',
      bark_playful: 'https://cdn.freesound.org/previews/321/321571_5260872-lq.mp3',
      bark_excited: 'https://cdn.freesound.org/previews/416/416711_2188-lq.mp3',
      
      // Howls
      howl_long: 'https://cdn.freesound.org/previews/380/380152_5260872-lq.mp3',
      howl_wolf: 'https://cdn.freesound.org/previews/523/523204_10057161-lq.mp3',
      howl_sad: 'https://cdn.freesound.org/previews/415/415209_5121236-lq.mp3',
      
      // Growls
      growl_deep: 'https://cdn.freesound.org/previews/351/351537_4068345-lq.mp3',
      growl_warning: 'https://cdn.freesound.org/previews/388/388700_3214421-lq.mp3',
      growl_fierce: 'https://cdn.freesound.org/previews/717/717869_2268589-lq.mp3',
      
      // Whimpers & Whines
      whimper: 'https://cdn.freesound.org/previews/398/398809_5121236-lq.mp3',
      whine: 'https://cdn.freesound.org/previews/416/416037_5674468-lq.mp3',
      
      // Other sounds
      pant: 'https://cdn.freesound.org/previews/201/201981_277-lq.mp3',
      snore: 'https://cdn.freesound.org/previews/415/415364_7714383-lq.mp3',
      eat: 'https://cdn.freesound.org/previews/413/413451_5121236-lq.mp3',
      yip: 'https://cdn.freesound.org/previews/388/388701_3214421-lq.mp3',
      
      // Activity sounds
      running: 'https://cdn.freesound.org/previews/456/456364_5121236-lq.mp3',
      drinking: 'https://cdn.freesound.org/previews/398/398811_5121236-lq.mp3',
      scratching: 'https://cdn.freesound.org/previews/413/413456_5121236-lq.mp3',
      
      // UI feedback sounds
      success: 'https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3',
      coin: 'https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3',
      levelup: 'https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3'
    };
    
    // Fallback synthesized sounds if audio files fail to load
    this.useFallback = {};
  }
  
  init() {
    if (this.audioContext) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }
  
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }
  
  // Preload a sound for better performance
  async preload(soundKey) {
    if (this.audioCache[soundKey]) return;
    
    const url = this.soundUrls[soundKey];
    if (!url) return;
    
    try {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = this.volume;
      this.audioCache[soundKey] = audio;
    } catch (e) {
      console.warn(`Failed to preload sound: ${soundKey}`);
      this.useFallback[soundKey] = true;
    }
  }
  
  // Play a sound by key
  async play(soundKey, options = {}) {
    if (!this.enabled) return;
    
    const { volume = this.volume, loop = false, onEnd = null } = options;
    
    // Try to play cached audio
    const url = this.soundUrls[soundKey];
    if (url && !this.useFallback[soundKey]) {
      try {
        const audio = new Audio(url);
        audio.volume = volume;
        audio.loop = loop;
        
        if (onEnd) {
          audio.onended = onEnd;
        }
        
        await audio.play();
        return audio;
      } catch (e) {
        console.warn(`Failed to play ${soundKey}, using fallback`);
        this.useFallback[soundKey] = true;
      }
    }
    
    // Fallback to synthesized sound
    this.playSynthesized(soundKey, volume);
    return null;
  }
  
  // Stop all sounds
  stopAll() {
    Object.values(this.audioCache).forEach(audio => {
      if (audio && typeof audio.pause === 'function') {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }
  
  // Synthesized fallback sounds using Web Audio API
  playSynthesized(soundKey, volume = 0.5) {
    this.init();
    if (!this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.audioContext.destination);
    gainNode.gain.setValueAtTime(volume * 0.3, now);
    
    switch(soundKey) {
      case 'bark_happy':
      case 'bark_alert':
      case 'bark_playful':
      case 'bark_excited':
        this.synthBark(gainNode, now);
        break;
      case 'howl_long':
      case 'howl_wolf':
      case 'howl_sad':
        this.synthHowl(gainNode, now);
        break;
      case 'growl_deep':
      case 'growl_warning':
      case 'growl_fierce':
        this.synthGrowl(gainNode, now);
        break;
      case 'whimper':
      case 'whine':
        this.synthWhimper(gainNode, now);
        break;
      case 'yip':
        this.synthYip(gainNode, now);
        break;
      default:
        this.synthBark(gainNode, now);
    }
  }
  
  synthBark(gainNode, now) {
    const osc = this.audioContext.createOscillator();
    osc.connect(gainNode);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.02);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  }
  
  synthHowl(gainNode, now) {
    const osc = this.audioContext.createOscillator();
    osc.connect(gainNode);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.5);
    osc.frequency.setValueAtTime(500, now + 1.2);
    osc.frequency.exponentialRampToValueAtTime(300, now + 2);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 2);
    osc.start(now);
    osc.stop(now + 2);
  }
  
  synthGrowl(gainNode, now) {
    const osc = this.audioContext.createOscillator();
    osc.connect(gainNode);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.5);
    osc.frequency.linearRampToValueAtTime(50, now + 1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1);
    osc.start(now);
    osc.stop(now + 1);
  }
  
  synthWhimper(gainNode, now) {
    const osc = this.audioContext.createOscillator();
    osc.connect(gainNode);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(350, now + 0.2);
    osc.frequency.linearRampToValueAtTime(380, now + 0.4);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  }
  
  synthYip(gainNode, now) {
    const osc = this.audioContext.createOscillator();
    osc.connect(gainNode);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.02);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.06);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  }
  
  // Convenience methods for specific sounds
  async barkHappy() { return this.play('bark_happy'); }
  async barkAlert() { return this.play('bark_alert'); }
  async barkPlayful() { return this.play('bark_playful'); }
  async barkExcited() { return this.play('bark_excited'); }
  
  async howlLong() { return this.play('howl_long'); }
  async howlWolf() { return this.play('howl_wolf'); }
  async howlSad() { return this.play('howl_sad'); }
  
  async growlDeep() { return this.play('growl_deep'); }
  async growlWarning() { return this.play('growl_warning'); }
  async growlFierce() { return this.play('growl_fierce'); }
  
  async whimper() { return this.play('whimper'); }
  async whine() { return this.play('whine'); }
  async yip() { return this.play('yip'); }
  async pant() { return this.play('pant'); }
  async snore() { return this.play('snore'); }
  async eat() { return this.play('eat'); }
  
  // Activity sounds
  async running() { return this.play('running'); }
  async drinking() { return this.play('drinking'); }
  
  // UI sounds
  async success() { return this.play('success'); }
  async coin() { return this.play('coin'); }
  async levelup() { return this.play('levelup'); }
}

// Create singleton instance
const audioManager = new AudioManager();

export default audioManager;
export { AudioManager };
