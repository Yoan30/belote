import { BaseScene } from './BaseScene.js';

export class ResultsScene extends BaseScene {
  protected async createUI(): Promise<void> {
    // Placeholder for results scene
    const text = this.createText('Results - Coming Soon', this.screenWidth / 2, this.screenHeight / 2);
    this.container.addChild(text);
  }
}