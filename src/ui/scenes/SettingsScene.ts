import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScene.js';
import { SceneType } from './SceneManager.js';

export class SettingsScene extends BaseScene {
  protected async createUI(): Promise<void> {
    // Background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x2c5234);
    bg.drawRect(0, 0, this.screenWidth, this.screenHeight);
    bg.endFill();
    this.container.addChild(bg);
    
    // Placeholder for settings scene
    const text = this.createText('Settings - Coming Soon', this.screenWidth / 2, this.screenHeight / 2);
    this.container.addChild(text);
    
    // Back button
    const backButton = this.createButton('Back', 50, this.screenHeight - 100);
    backButton.on('pointertap', () => {
      this.app.audioManager.playSound('click');
      this.app.sceneManager.switchTo(SceneType.MENU);
    });
    this.container.addChild(backButton);
  }
}