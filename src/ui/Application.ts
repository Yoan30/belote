import * as PIXI from 'pixi.js';
import { SceneManager } from './scenes/SceneManager.js';
import { AudioManager } from './audio/AudioManager.js';
import { SettingsManager } from './settings/SettingsManager.js';
import { I18nManager } from './i18n/I18nManager.js';

export class GameApplication {
  public app: PIXI.Application;
  public sceneManager: SceneManager;
  public audioManager: AudioManager;
  public settingsManager: SettingsManager;
  public i18nManager: I18nManager;

  private resizeHandler = () => this.handleResize();

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

    // Initialize managers
    await this.settingsManager.load();
    await this.i18nManager.initialize();
    await this.audioManager.initialize();
    
    // Start the scene manager
    this.sceneManager.initialize();
    
    // Hide loading screen
    const loading = document.getElementById('loading');
    if (loading) {
      loading.classList.add('hidden');
    }
  }

  private handleResize(): void {
    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    this.sceneManager.handleResize();
  }

  destroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    this.sceneManager.destroy();
    this.audioManager.destroy();
    this.app.destroy(true);
  }
}