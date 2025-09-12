import * as PIXI from 'pixi.js';
import { GameApplication } from '../Application.js';
import { BaseScene } from './BaseScene.js';
import { SplashScene } from './SplashScene.js';
import { MenuScene } from './MenuScene.js';
import { TableScene } from './TableScene.js';
import { SettingsScene } from './SettingsScene.js';
import { ResultsScene } from './ResultsScene.js';

export enum SceneType {
  SPLASH = 'splash',
  MENU = 'menu',
  TABLE = 'table',
  SETTINGS = 'settings',
  RESULTS = 'results'
}

export class SceneManager {
  private app: GameApplication;
  private container: PIXI.Container;
  private scenes: Map<SceneType, BaseScene> = new Map();
  private currentScene: BaseScene | null = null;
  private isTransitioning = false;

  constructor(app: GameApplication) {
    this.app = app;
    this.container = new PIXI.Container();
    this.app.app.stage.addChild(this.container);
  }

  initialize(): void {
    // Register all scenes
    this.scenes.set(SceneType.SPLASH, new SplashScene(this.app));
    this.scenes.set(SceneType.MENU, new MenuScene(this.app));
    this.scenes.set(SceneType.TABLE, new TableScene(this.app));
    this.scenes.set(SceneType.SETTINGS, new SettingsScene(this.app));
    this.scenes.set(SceneType.RESULTS, new ResultsScene(this.app));

    // Start with splash scene
    this.switchTo(SceneType.SPLASH);
  }

  async switchTo(sceneType: SceneType, data?: any): Promise<void> {
    if (this.isTransitioning) return;
    
    const newScene = this.scenes.get(sceneType);
    if (!newScene) {
      console.error(`Scene ${sceneType} not found`);
      return;
    }

    this.isTransitioning = true;

    try {
      // Fade out current scene
      if (this.currentScene) {
        await this.fadeOut(this.currentScene);
        this.currentScene.hide();
        this.container.removeChild(this.currentScene.container);
      }

      // Switch to new scene
      this.currentScene = newScene;
      this.container.addChild(this.currentScene.container);
      
      // Initialize scene if needed
      if (!this.currentScene.isInitialized) {
        await this.currentScene.initialize();
      }
      
      // Show and fade in new scene
      this.currentScene.show(data);
      await this.fadeIn(this.currentScene);
      
    } finally {
      this.isTransitioning = false;
    }
  }

  private async fadeOut(scene: BaseScene): Promise<void> {
    return new Promise(resolve => {
      const tween = {
        alpha: scene.container.alpha,
        update: (progress: number) => {
          scene.container.alpha = 1 - progress;
        },
        complete: () => resolve()
      };
      
      this.animateTween(tween, 300);
    });
  }

  private async fadeIn(scene: BaseScene): Promise<void> {
    return new Promise(resolve => {
      scene.container.alpha = 0;
      const tween = {
        alpha: 0,
        update: (progress: number) => {
          scene.container.alpha = progress;
        },
        complete: () => resolve()
      };
      
      this.animateTween(tween, 300);
    });
  }

  private animateTween(tween: any, duration: number): void {
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      tween.update(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        tween.complete();
      }
    };
    
    requestAnimationFrame(animate);
  }

  handleResize(): void {
    this.scenes.forEach(scene => {
      if (scene.isInitialized) {
        scene.handleResize();
      }
    });
  }

  destroy(): void {
    this.scenes.forEach(scene => scene.destroy());
    this.scenes.clear();
    this.app.app.stage.removeChild(this.container);
    this.container.destroy();
  }
}