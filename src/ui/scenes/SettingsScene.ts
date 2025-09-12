import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScene.js';
import { SceneType } from './SceneManager.js';

export class SettingsScene extends BaseScene {
  private title: PIXI.Text | null = null;
  private volumeSlider: PIXI.Container | null = null;
  private muteButton: PIXI.Container | null = null;
  private trumpModeButton: PIXI.Container | null = null;
  private aiLevelText: PIXI.Text | null = null;
  private animSpeedText: PIXI.Text | null = null;
  private backButton: PIXI.Container | null = null;

  protected async createUI(): Promise<void> {
    // Background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x2c5234);
    bg.drawRect(0, 0, this.screenWidth, this.screenHeight);
    bg.endFill();
    this.container.addChild(bg);

    // Title
    this.title = this.createText(
      this.app.i18nManager.t('settings.title'),
      this.screenWidth / 2,
      80,
      { fontSize: 48, fontWeight: 'bold', fill: 0xffd700 }
    );
    this.container.addChild(this.title);

    const settings = this.app.settingsManager.getSettings();
    let yPos = 180;

    // Volume section
    const volumeLabel = this.createText(
      this.app.i18nManager.t('settings.volume'),
      this.screenWidth / 2 - 200,
      yPos,
      { fontSize: 20, fill: 0xffffff }
    );
    volumeLabel.anchor.set(0, 0.5);
    this.container.addChild(volumeLabel);

    // Volume slider (simplified)
    this.volumeSlider = this.createVolumeSlider(this.screenWidth / 2 - 50, yPos, settings.audio.volume);
    this.container.addChild(this.volumeSlider);

    // Mute button
    this.muteButton = this.createButton(
      settings.audio.muted ? 'ON' : 'OFF',
      this.screenWidth / 2 + 150,
      yPos - 25,
      80,
      50
    );
    this.container.addChild(this.muteButton);

    yPos += 80;

    // Trump mode
    const trumpLabel = this.createText(
      this.app.i18nManager.t('settings.trumpMode'),
      this.screenWidth / 2 - 200,
      yPos,
      { fontSize: 20, fill: 0xffffff }
    );
    trumpLabel.anchor.set(0, 0.5);
    this.container.addChild(trumpLabel);

    this.trumpModeButton = this.createButton(
      this.app.i18nManager.t(`settings.${settings.gameplay.trumpMode}`),
      this.screenWidth / 2 - 50,
      yPos - 25,
      200,
      50
    );
    this.container.addChild(this.trumpModeButton);

    yPos += 80;

    // AI Level
    const aiLabel = this.createText(
      this.app.i18nManager.t('settings.aiLevel'),
      this.screenWidth / 2 - 200,
      yPos,
      { fontSize: 20, fill: 0xffffff }
    );
    aiLabel.anchor.set(0, 0.5);
    this.container.addChild(aiLabel);

    this.aiLevelText = this.createText(
      `${settings.gameplay.allyAILevel} / ${settings.gameplay.opponentAILevel}`,
      this.screenWidth / 2 + 50,
      yPos,
      { fontSize: 18, fill: 0xcccccc }
    );
    this.container.addChild(this.aiLevelText);

    yPos += 80;

    // Animation speed
    const animLabel = this.createText(
      this.app.i18nManager.t('settings.animationSpeed'),
      this.screenWidth / 2 - 200,
      yPos,
      { fontSize: 20, fill: 0xffffff }
    );
    animLabel.anchor.set(0, 0.5);
    this.container.addChild(animLabel);

    this.animSpeedText = this.createText(
      `x${settings.gameplay.animationSpeed}`,
      this.screenWidth / 2 + 50,
      yPos,
      { fontSize: 18, fill: 0xcccccc }
    );
    this.container.addChild(this.animSpeedText);

    // Back button
    this.backButton = this.createButton(
      this.app.i18nManager.t('settings.back'),
      50,
      this.screenHeight - 100,
      120,
      50
    );
    this.container.addChild(this.backButton);
  }

  private createVolumeSlider(x: number, y: number, value: number): PIXI.Container {
    const container = new PIXI.Container();
    container.x = x;
    container.y = y;

    // Slider track
    const track = new PIXI.Graphics();
    track.beginFill(0x666666);
    track.drawRect(-75, -4, 150, 8);
    track.endFill();
    container.addChild(track);

    // Slider fill
    const fill = new PIXI.Graphics();
    fill.beginFill(0xffd700);
    fill.drawRect(-75, -4, 150 * value, 8);
    fill.endFill();
    container.addChild(fill);

    // Slider handle
    const handle = new PIXI.Graphics();
    handle.beginFill(0xffffff);
    handle.drawCircle(0, 0, 8);
    handle.endFill();
    handle.x = -75 + 150 * value;
    container.addChild(handle);

    return container;
  }

  protected override setupEventListeners(): void {
    if (this.backButton) {
      this.backButton.on('pointertap', () => {
        this.app.audioManager.playSound('click');
        this.app.sceneManager.switchTo(SceneType.MENU);
      });
    }

    if (this.muteButton) {
      this.muteButton.on('pointertap', () => {
        const settings = this.app.settingsManager.getSettings();
        const newMuted = !settings.audio.muted;
        this.app.audioManager.setMuted(newMuted);
        
        // Update button text
        const buttonText = this.muteButton!.getChildAt(1) as PIXI.Text;
        buttonText.text = newMuted ? 'ON' : 'OFF';
        
        this.app.audioManager.playSound('click');
      });
    }

    if (this.trumpModeButton) {
      this.trumpModeButton.on('pointertap', () => {
        const settings = this.app.settingsManager.getSettings();
        const newMode = settings.gameplay.trumpMode === 'auto' ? 'manual' : 'auto';
        this.app.settingsManager.updateGameplaySettings({ trumpMode: newMode });
        
        // Update button text
        const buttonText = this.trumpModeButton!.getChildAt(1) as PIXI.Text;
        buttonText.text = this.app.i18nManager.t(`settings.${newMode}`);
        
        this.app.audioManager.playSound('click');
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
    }

    // Update back button position
    if (this.backButton) {
      this.backButton.y = this.screenHeight - 100;
    }
  }
}