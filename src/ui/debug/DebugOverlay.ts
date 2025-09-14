import * as PIXI from 'pixi.js';
import { GameApplication } from '../Application.js';
import { Suit } from '../../game/models/Types.js';

export class DebugOverlay {
  private app: GameApplication;
  private container: PIXI.Container;
  private isVisible = false;
  private seedText: PIXI.Text | null = null;
  private trumpText: PIXI.Text | null = null;
  private turnText: PIXI.Text | null = null;
  private cardsLeftText: PIXI.Text | null = null;
  private fpsText: PIXI.Text | null = null;
  private lastFpsUpdate = 0;
  private frameCount = 0;
  private fps = 0;

  constructor(app: GameApplication) {
    this.app = app;
    this.container = new PIXI.Container();
    this.container.visible = false;
    this.container.zIndex = 1000; // Always on top
    
    this.createUI();
    this.app.app.stage.addChild(this.container);
    
    // Start FPS monitoring
    this.app.app.ticker.add(this.updateFPS, this);
  }

  private createUI(): void {
    // Semi-transparent background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.7);
    bg.drawRoundedRect(10, 10, 250, 200, 8);
    bg.endFill();
    this.container.addChild(bg);

    // Title
    const title = this.createText('DEBUG INFO', 20, 30, {
      fontSize: 16,
      fontWeight: 'bold',
      fill: 0xffd700
    });
    this.container.addChild(title);

    // Debug information
    let yPos = 55;
    const lineHeight = 20;

    this.seedText = this.createText('Seed: N/A', 20, yPos, { fontSize: 12, fill: 0xffffff });
    this.container.addChild(this.seedText);
    yPos += lineHeight;

    this.trumpText = this.createText('Trump: N/A', 20, yPos, { fontSize: 12, fill: 0xffffff });
    this.container.addChild(this.trumpText);
    yPos += lineHeight;

    this.turnText = this.createText('Turn: N/A', 20, yPos, { fontSize: 12, fill: 0xffffff });
    this.container.addChild(this.turnText);
    yPos += lineHeight;

    this.cardsLeftText = this.createText('Cards Left:', 20, yPos, { fontSize: 12, fill: 0xffffff });
    this.container.addChild(this.cardsLeftText);
    yPos += lineHeight;

    // Cards by suit
    const suits = [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS];
    const suitSymbols = { [Suit.SPADES]: '♠', [Suit.HEARTS]: '♥', [Suit.DIAMONDS]: '♦', [Suit.CLUBS]: '♣' };
    const suitColors = { [Suit.SPADES]: 0x000000, [Suit.HEARTS]: 0xff0000, [Suit.DIAMONDS]: 0xff0000, [Suit.CLUBS]: 0x000000 };

    suits.forEach(suit => {
      const suitText = this.createText(`${suitSymbols[suit]}: 8`, 30, yPos, { 
        fontSize: 11, 
        fill: suitColors[suit] 
      });
      this.container.addChild(suitText);
      yPos += 15;
    });

    this.fpsText = this.createText('FPS: 60', 20, yPos + 10, { fontSize: 12, fill: 0x00ff00 });
    this.container.addChild(this.fpsText);
  }

  private createText(text: string, x: number, y: number, style: Partial<PIXI.TextStyle>): PIXI.Text {
    const textObj = new PIXI.Text(text, {
      fontSize: 14,
      fontFamily: 'Arial, monospace',
      fill: 0xffffff,
      ...style
    });
    textObj.x = x;
    textObj.y = y;
    return textObj;
  }

  private updateFPS = (): void => {
    this.frameCount++;
    const now = Date.now();
    
    if (now - this.lastFpsUpdate >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
      
      if (this.fpsText && this.isVisible) {
        this.fpsText.text = `FPS: ${this.fps}`;
        
        // Color code FPS
        if (this.fps >= 55) {
          this.fpsText.style.fill = 0x00ff00; // Green
        } else if (this.fps >= 30) {
          this.fpsText.style.fill = 0xffff00; // Yellow
        } else {
          this.fpsText.style.fill = 0xff0000; // Red
        }
      }
    }
  };

  public toggle(): void {
    this.isVisible = !this.isVisible;
    this.container.visible = this.isVisible;
    
    if (this.isVisible) {
      this.updateDebugInfo();
    }
  }

  public updateDebugInfo(gameData?: {
    seed?: string;
    trump?: Suit;
    currentPlayer?: string;
    cardsRemaining?: Record<Suit, number>;
  }): void {
    if (!this.isVisible) return;

    if (gameData) {
      if (this.seedText) {
        this.seedText.text = `Seed: ${gameData.seed || 'N/A'}`;
      }

      if (this.trumpText) {
        const trumpSymbols = { [Suit.SPADES]: '♠', [Suit.HEARTS]: '♥', [Suit.DIAMONDS]: '♦', [Suit.CLUBS]: '♣' };
        this.trumpText.text = `Trump: ${gameData.trump ? trumpSymbols[gameData.trump] : 'N/A'}`;
      }

      if (this.turnText) {
        this.turnText.text = `Turn: ${gameData.currentPlayer || 'N/A'}`;
      }

      // Update cards remaining by suit
      if (gameData.cardsRemaining) {
        const suits = [Suit.SPADES, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS];
        const suitSymbols = { [Suit.SPADES]: '♠', [Suit.HEARTS]: '♥', [Suit.DIAMONDS]: '♦', [Suit.CLUBS]: '♣' };
        
        suits.forEach((suit, index) => {
          const suitText = this.container.children[7 + index] as PIXI.Text; // After the static texts
          if (suitText) {
            suitText.text = `${suitSymbols[suit]}: ${gameData.cardsRemaining![suit] || 0}`;
          }
        });
      }
    }
  }

  public destroy(): void {
    this.app.app.ticker.remove(this.updateFPS, this);
    this.app.app.stage.removeChild(this.container);
    this.container.destroy({ children: true });
  }

  public handleResize(): void {
    // Position overlay in top-right corner
    this.container.x = this.app.app.screen.width - 270;
    this.container.y = 0;
  }
}