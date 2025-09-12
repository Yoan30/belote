import { Howl } from 'howler';
import { SettingsManager } from '../settings/SettingsManager.js';

export interface SoundConfig {
  url: string;
  volume?: number;
  loop?: boolean;
}

export class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private settingsManager: SettingsManager;
  private masterVolume = 1.0;
  private isMuted = false;

  constructor(settingsManager: SettingsManager) {
    this.settingsManager = settingsManager;
  }

  async initialize(): Promise<void> {
    // Load settings
    const settings = this.settingsManager.getSettings();
    this.masterVolume = settings.audio.volume;
    this.isMuted = settings.audio.muted;

    // Define sounds
    const soundConfigs: Record<string, SoundConfig> = {
      click: { url: '/sounds/click.mp3', volume: 0.5 },
      shuffle: { url: '/sounds/shuffle.mp3', volume: 0.7 },
      deal: { url: '/sounds/deal.mp3', volume: 0.6 },
      flip: { url: '/sounds/flip.mp3', volume: 0.5 },
      trick: { url: '/sounds/trick.mp3', volume: 0.8 },
      belote: { url: '/sounds/belote.mp3', volume: 0.9 },
      win: { url: '/sounds/win.mp3', volume: 1.0 }
    };

    // Load all sounds
    for (const [name, config] of Object.entries(soundConfigs)) {
      await this.loadSound(name, config);
    }
  }

  private async loadSound(name: string, config: SoundConfig): Promise<void> {
    return new Promise((resolve) => {
      const sound = new Howl({
        src: [config.url],
        volume: (config.volume || 1.0) * this.masterVolume,
        loop: config.loop || false,
        onload: () => resolve(),
        onloaderror: (_id, error) => {
          console.warn(`Failed to load sound ${name}:`, error);
          resolve(); // Don't fail initialization for missing sounds
        }
      });

      this.sounds.set(name, sound);
    });
  }

  playSound(name: string, volume?: number): void {
    if (this.isMuted) return;

    const sound = this.sounds.get(name);
    if (!sound) {
      console.warn(`Sound ${name} not found`);
      return;
    }

    const playVolume = volume !== undefined ? volume : sound.volume();
    sound.volume(playVolume * this.masterVolume);
    sound.play();
  }

  stopSound(name: string): void {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.stop();
    }
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    
    // Update all sound volumes
    this.sounds.forEach(sound => {
      const baseVolume = sound.volume() / this.masterVolume; // Get original volume
      sound.volume(baseVolume * this.masterVolume);
    });

    // Save to settings
    this.settingsManager.updateAudioSettings({ volume: this.masterVolume });
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    
    if (muted) {
      this.sounds.forEach(sound => sound.mute(true));
    } else {
      this.sounds.forEach(sound => sound.mute(false));
    }

    // Save to settings
    this.settingsManager.updateAudioSettings({ muted });
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  isMutedState(): boolean {
    return this.isMuted;
  }

  destroy(): void {
    this.sounds.forEach(sound => sound.unload());
    this.sounds.clear();
  }
}