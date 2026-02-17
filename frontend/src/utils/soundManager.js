// Sound Manager for Virtual Pet
// Creates and plays various dog sounds and action effects

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.sounds = {};
  }

  init() {
    if (this.audioContext) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Generate a bark sound
  bark(type = 'normal') {
    if (!this.enabled) return;
    this.init();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;

    switch (type) {
      case 'happy':
        // Happy bark - higher pitch, multiple barks
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.05);
        oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        // Second bark
        setTimeout(() => this.bark('short'), 200);
        break;

      case 'excited':
        // Excited yapping
        oscillator.frequency.setValueAtTime(500, now);
        oscillator.frequency.exponentialRampToValueAtTime(700, now + 0.03);
        oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.06);
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        setTimeout(() => this.bark('short'), 120);
        setTimeout(() => this.bark('short'), 240);
        break;

      case 'sleepy':
        // Sleepy whine
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        oscillator.start(now);
        oscillator.stop(now + 0.4);
        break;

      case 'eating':
        // Chomping/eating sound
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(100, now);
        oscillator.frequency.setValueAtTime(150, now + 0.05);
        oscillator.frequency.setValueAtTime(100, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        break;

      case 'short':
        // Short bark
        oscillator.frequency.setValueAtTime(350, now);
        oscillator.frequency.exponentialRampToValueAtTime(250, now + 0.05);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        oscillator.start(now);
        oscillator.stop(now + 0.08);
        break;

      default:
        // Normal bark
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(450, now + 0.05);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }
  }

  // Panting sound
  pant() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioContext) return;

    const noise = this.audioContext.createBufferSource();
    const bufferSize = this.audioContext.sampleRate * 0.3;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin(i / 500);
    }

    noise.buffer = buffer;
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0.1;

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    noise.start();
    noise.stop(this.audioContext.currentTime + 0.3);
  }

  // Whimper/whine
  whimper() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, now);
    oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.3);
    oscillator.frequency.exponentialRampToValueAtTime(500, now + 0.5);
    
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }

  // Growl
  growl() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(80, now);
    oscillator.frequency.linearRampToValueAtTime(100, now + 0.2);
    oscillator.frequency.linearRampToValueAtTime(70, now + 0.4);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }

  // Reward/success sound
  reward() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;
    oscillator.type = 'sine';
    
    // Ascending chime
    oscillator.frequency.setValueAtTime(523, now); // C5
    oscillator.frequency.setValueAtTime(659, now + 0.1); // E5
    oscillator.frequency.setValueAtTime(784, now + 0.2); // G5
    oscillator.frequency.setValueAtTime(1047, now + 0.3); // C6
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    oscillator.start(now);
    oscillator.stop(now + 0.5);
  }

  // Ball bounce sound
  ballBounce() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }

  // Splash sound for swimming
  splash() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioContext) return;

    const noise = this.audioContext.createBufferSource();
    const bufferSize = this.audioContext.sampleRate * 0.5;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 5000);
    }

    noise.buffer = buffer;
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1500;
    
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0.3;

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    noise.start();
  }

  // Footsteps/running
  footsteps(count = 4) {
    if (!this.enabled) return;
    this.init();
    if (!this.audioContext) return;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150 + Math.random() * 50, now);
        oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.05);
        
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        oscillator.start(now);
        oscillator.stop(now + 0.08);
      }, i * 150);
    }
  }

  // Snoring
  snore() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;
    oscillator.type = 'sawtooth';
    
    // In-breath
    oscillator.frequency.setValueAtTime(50, now);
    oscillator.frequency.linearRampToValueAtTime(80, now + 0.5);
    // Out-breath
    oscillator.frequency.linearRampToValueAtTime(40, now + 1);
    
    gainNode.gain.setValueAtTime(0.05, now);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1);

    oscillator.start(now);
    oscillator.stop(now + 1);
  }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;
export { SoundManager };
