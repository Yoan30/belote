import * as PIXI from 'pixi.js';
import { GameApplication } from '../Application.js';

export abstract class BaseScene {
  protected app: GameApplication;
  public container: PIXI.Container;
  public isInitialized = false;

  constructor(app: GameApplication) {
    this.app = app;
    this.container = new PIXI.Container();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    await this.createUI();
    this.setupEventListeners();
    this.handleResize();
    
    this.isInitialized = true;
  }

  protected abstract createUI(): Promise<void>;
  
  protected setupEventListeners(): void {
    // Override in subclasses
  }

  show(data?: any): void {
    this.container.visible = true;
    this.onShow(data);
  }

  hide(): void {
    this.container.visible = false;
    this.onHide();
  }

  protected onShow(_data?: any): void {
    // Override in subclasses
  }

  protected onHide(): void {
    // Override in subclasses
  }

  handleResize(): void {
    // Override in subclasses for responsive behavior
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }

  protected get screenWidth(): number {
    return this.app.app.screen.width;
  }

  protected get screenHeight(): number {
    return this.app.app.screen.height;
  }

  protected createButton(text: string, x: number, y: number, width = 200, height = 50): PIXI.Container {
    const button = new PIXI.Container();
    button.x = x;
    button.y = y;
    button.eventMode = 'static';
    button.cursor = 'pointer';

    // Button background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x4a7c59);
    bg.lineStyle(2, 0x5a8c69);
    bg.drawRoundedRect(0, 0, width, height, 8);
    bg.endFill();
    button.addChild(bg);

    // Button text
    const buttonText = new PIXI.Text(text, {
      fontSize: 18,
      fontFamily: 'Arial',
      fill: 0xffffff,
      align: 'center'
    });
    buttonText.anchor.set(0.5);
    buttonText.x = width / 2;
    buttonText.y = height / 2;
    button.addChild(buttonText);

    // Hover effects
    button.on('pointerenter', () => {
      bg.clear();
      bg.beginFill(0x5a8c69);
      bg.lineStyle(2, 0x6a9c79);
      bg.drawRoundedRect(0, 0, width, height, 8);
      bg.endFill();
      this.app.audioManager.playSound('click');
    });

    button.on('pointerleave', () => {
      bg.clear();
      bg.beginFill(0x4a7c59);
      bg.lineStyle(2, 0x5a8c69);
      bg.drawRoundedRect(0, 0, width, height, 8);
      bg.endFill();
    });

    return button;
  }

  protected createText(text: string, x: number, y: number, style: Partial<PIXI.TextStyle> = {}): PIXI.Text {
    const textObj = new PIXI.Text(text, {
      fontSize: 24,
      fontFamily: 'Arial',
      fill: 0xffffff,
      align: 'center',
      ...style
    });
    textObj.anchor.set(0.5);
    textObj.x = x;
    textObj.y = y;
    return textObj;
  }
}