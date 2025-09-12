import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScene.js';
import { SceneType } from './SceneManager.js';

export class MenuScene extends BaseScene {
  private title: PIXI.Text | null = null;
  private playButton: PIXI.Container | null = null;
  private settingsButton: PIXI.Container | null = null;

  protected async createUI(): Promise<void> {
    // Background with gradient effect
    const bg = new PIXI.Graphics();
    bg.beginFill(0x2c5234);
    bg.drawRect(0, 0, this.screenWidth, this.screenHeight);
    bg.endFill();
    this.container.addChild(bg);

    // Title
    this.title = this.createText('BELOTE', this.screenWidth / 2, this.screenHeight / 3, {
      fontSize: 72,
      fontWeight: 'bold',
      fill: 0xffd700,
      stroke: 0x000000,
      strokeThickness: 3
    });
    this.container.addChild(this.title);

    // Play button
    this.playButton = this.createButton(
      this.app.i18nManager.t('menu.play'),
      this.screenWidth / 2 - 100,
      this.screenHeight / 2,
      200,
      60
    );
    this.container.addChild(this.playButton);

    // Settings button
    this.settingsButton = this.createButton(
      this.app.i18nManager.t('menu.settings'),
      this.screenWidth / 2 - 100,
      this.screenHeight / 2 + 80,
      200,
      60
    );
    this.container.addChild(this.settingsButton);

    // Version info
    const version = this.createText('v1.0.0', this.screenWidth - 50, this.screenHeight - 30, {
      fontSize: 14,
      fill: 0x888888
    });
    version.anchor.set(1, 1);
    this.container.addChild(version);
  }

  protected override setupEventListeners(): void {
    if (this.playButton) {
      this.playButton.on('pointertap', () => {
        this.app.audioManager.playSound('click');
        this.app.sceneManager.switchTo(SceneType.TABLE);
      });
    }

    if (this.settingsButton) {
      this.settingsButton.on('pointertap', () => {
        this.app.audioManager.playSound('click');
        this.app.sceneManager.switchTo(SceneType.SETTINGS);
      });
    }
  }

  override handleResize(): void {
    if (!this.isInitialized) return;

    // Update background
    const bg = this.container.getChildAt(0) as PIXI.Graphics;
    bg.clear();
    bg.beginFill(0x2c5234);
    bg.drawRect(0, 0, this.screenWidth, this.screenHeight);
    bg.endFill();

    // Update title position
    if (this.title) {
      this.title.x = this.screenWidth / 2;
      this.title.y = this.screenHeight / 3;
    }

    // Update button positions
    if (this.playButton) {
      this.playButton.x = this.screenWidth / 2 - 100;
      this.playButton.y = this.screenHeight / 2;
    }

    if (this.settingsButton) {
      this.settingsButton.x = this.screenWidth / 2 - 100;
      this.settingsButton.y = this.screenHeight / 2 + 80;
    }

    // Update version position
    const version = this.container.getChildAt(4) as PIXI.Text;
    if (version) {
      version.x = this.screenWidth - 50;
      version.y = this.screenHeight - 30;
    }
  }
}