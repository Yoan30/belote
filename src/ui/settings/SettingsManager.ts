export interface AudioSettings {
  volume: number;
  muted: boolean;
}

export interface GameplaySettings {
  trumpMode: 'auto' | 'manual';
  allyAILevel: 1 | 2 | 3 | 4;
  opponentAILevel: 1 | 2 | 3 | 4;
  animationSpeed: 1 | 1.5 | 2;
}

export interface UISettings {
  theme: 'default' | 'dark' | 'classic';
  language: 'fr' | 'en';
  debugMode: boolean;
}

export interface GameSettings {
  audio: AudioSettings;
  gameplay: GameplaySettings;
  ui: UISettings;
}

const DEFAULT_SETTINGS: GameSettings = {
  audio: {
    volume: 0.8,
    muted: false
  },
  gameplay: {
    trumpMode: 'auto',
    allyAILevel: 2,
    opponentAILevel: 2,
    animationSpeed: 1
  },
  ui: {
    theme: 'default',
    language: 'fr',
    debugMode: false
  }
};

export class SettingsManager {
  private settings: GameSettings;
  private readonly STORAGE_KEY = 'belote-settings';

  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
  }

  async load(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = this.mergeSettings(DEFAULT_SETTINGS, parsed);
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  private mergeSettings(defaults: GameSettings, stored: any): GameSettings {
    return {
      audio: { ...defaults.audio, ...stored.audio },
      gameplay: { ...defaults.gameplay, ...stored.gameplay },
      ui: { ...defaults.ui, ...stored.ui }
    };
  }

  async save(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  }

  getSettings(): GameSettings {
    return { ...this.settings };
  }

  updateAudioSettings(updates: Partial<AudioSettings>): void {
    this.settings.audio = { ...this.settings.audio, ...updates };
    this.save();
  }

  updateGameplaySettings(updates: Partial<GameplaySettings>): void {
    this.settings.gameplay = { ...this.settings.gameplay, ...updates };
    this.save();
  }

  updateUISettings(updates: Partial<UISettings>): void {
    this.settings.ui = { ...this.settings.ui, ...updates };
    this.save();
  }

  reset(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.save();
  }
}