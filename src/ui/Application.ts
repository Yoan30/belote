import * as PIXI from 'pixi.js';
import { SceneManager } from './scenes/SceneManager.js';
import { AudioManager } from './audio/AudioManager.js';
import { SettingsManager } from './settings/SettingsManager.js';
import { I18nManager } from './i18n/I18nManager.js';
import { DebugOverlay } from './debug/DebugOverlay.js';

export class GameApplication {
  public app: PIXI.Application;
  public sceneManager: SceneManager;
  public audioManager: AudioManager;
  public settingsManager: SettingsManager;
  public i18nManager: I18nManager;
  public debugOverlay: DebugOverlay;

  private resizeHandler = () => this.handleResize();
  private keyHandler = (event: KeyboardEvent) => this.handleKeyPress(event);

  constructor() {
    // Initialize managers first
    this.settingsManager = new SettingsManager();
    this.i18nManager = new I18nManager();
    this.audioManager = new AudioManager(this.settingsManager);
    
    // Initialize PIXI application with legacy constructor
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x2c5234,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });
    
    this.sceneManager = new SceneManager(this);
    this.debugOverlay = new DebugOverlay(this);
  }

  async initialize(): Promise<void> {
    // Add canvas to DOM
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) {
      throw new Error('Game container not found');
    }
    gameContainer.appendChild(this.app.view as HTMLCanvasElement);

    // Set up event listeners
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('keydown', this.keyHandler);

    // Initialize managers
    await this.settingsManager.load();
    await this.i18nManager.initialize();
    await this.audioManager.initialize();
    
    // Start the scene manager
    this.sceneManager.initialize();
    
    // Position debug overlay
    this.debugOverlay.handleResize();
    
    // Show debug overlay if enabled in settings
    const settings = this.settingsManager.getSettings();
    if (settings.ui.debugMode) {
      this.debugOverlay.toggle();
    }
    
    // Hide loading screen
    const loading = document.getElementById('loading');
    if (loading) {
      loading.classList.add('hidden');
    }
  }

  private handleResize(): void {
    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    this.sceneManager.handleResize();
    this.debugOverlay.handleResize();
  }

  private handleKeyPress(event: KeyboardEvent): void {
    // Debug overlay toggle (F3 or Ctrl+D)
    if (event.key === 'F3' || (event.ctrlKey && event.key === 'd')) {
      event.preventDefault();
      this.debugOverlay.toggle();
      
      // Update settings
      const settings = this.settingsManager.getSettings();
      this.settingsManager.updateUISettings({ debugMode: !settings.ui.debugMode });
    }
  }

  destroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('keydown', this.keyHandler);
    this.debugOverlay.destroy();
    this.sceneManager.destroy();
    this.audioManager.destroy();
    this.app.destroy(true);
  }
}