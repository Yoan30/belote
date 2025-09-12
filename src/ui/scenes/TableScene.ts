import { BaseScene } from './BaseScene.js';

export class TableScene extends BaseScene {
  protected async createUI(): Promise<void> {
    // Placeholder for table scene
    const text = this.createText('Game Table - Coming Soon', this.screenWidth / 2, this.screenHeight / 2);
    this.container.addChild(text);
  }
}

export class SettingsScene extends BaseScene {
  protected async createUI(): Promise<void> {
    // Placeholder for settings scene
    const text = this.createText('Settings - Coming Soon', this.screenWidth / 2, this.screenHeight / 2);
    this.container.addChild(text);
  }
}

export class ResultsScene extends BaseScene {
  protected async createUI(): Promise<void> {
    // Placeholder for results scene
    const text = this.createText('Results - Coming Soon', this.screenWidth / 2, this.screenHeight / 2);
    this.container.addChild(text);
  }
}