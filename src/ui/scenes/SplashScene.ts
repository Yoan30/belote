import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScene.js';
import { SceneType } from './SceneManager.js';

export class SplashScene extends BaseScene {
  private logo: PIXI.Text | null = null;
  private subtitle: PIXI.Text | null = null;
  private progressBar: PIXI.Graphics | null = null;

  protected async createUI(): Promise<void> {
    // Background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x1a3d2b);
    bg.drawRect(0, 0, this.screenWidth, this.screenHeight);
    bg.endFill();
    this.container.addChild(bg);

    // Logo
    this.logo = this.createText('BELOTE', this.screenWidth / 2, this.screenHeight / 2 - 50, {
      fontSize: 64,
      fontWeight: 'bold',
      fill: 0xffd700
    });
    this.container.addChild(this.logo);

    // Subtitle
    this.subtitle = this.createText(
      this.app.i18nManager.t('splash.tagline'),
      this.screenWidth / 2,
      this.screenHeight / 2 + 20,
      { fontSize: 18, fill: 0xcccccc }
    );
    this.container.addChild(this.subtitle);

    // Progress bar background
    const progressBg = new PIXI.Graphics();
    progressBg.beginFill(0x333333);
    progressBg.drawRect(this.screenWidth / 2 - 150, this.screenHeight / 2 + 80, 300, 8);
    progressBg.endFill();
    this.container.addChild(progressBg);

    // Progress bar
    this.progressBar = new PIXI.Graphics();
    this.container.addChild(this.progressBar);

    // Animate progress
    this.animateProgress();
  }

  private async animateProgress(): Promise<void> {
    return new Promise(resolve => {
      let progress = 0;
      const duration = 2000; // 2 seconds
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);

        // Update progress bar
        if (this.progressBar) {
          this.progressBar.clear();
          this.progressBar.beginFill(0xffd700);
          this.progressBar.drawRect(this.screenWidth / 2 - 150, this.screenHeight / 2 + 80, 300 * progress, 8);
          this.progressBar.endFill();
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Wait a bit then transition to menu
          setTimeout(() => {
            this.app.sceneManager.switchTo(SceneType.MENU);
            resolve();
          }, 500);
        }
      };

      requestAnimationFrame(animate);
    });
  }

  override handleResize(): void {
    if (!this.isInitialized) return;

    // Update background
    const bg = this.container.getChildAt(0) as PIXI.Graphics;
    bg.clear();
    bg.beginFill(0x1a3d2b);
    bg.drawRect(0, 0, this.screenWidth, this.screenHeight);
    bg.endFill();

    // Update positions
    if (this.logo) {
      this.logo.x = this.screenWidth / 2;
      this.logo.y = this.screenHeight / 2 - 50;
    }

    if (this.subtitle) {
      this.subtitle.x = this.screenWidth / 2;
      this.subtitle.y = this.screenHeight / 2 + 20;
    }

    // Update progress bar positions would need to be recalculated here
  }
}