import * as PIXI from 'pixi.js';
import { BaseScene } from './BaseScene.js';
import { SceneType } from './SceneManager.js';
import { Position } from '../../game/models/Types.js';

export class TableScene extends BaseScene {
  private table: PIXI.Graphics | null = null;
  private playerPositions: Map<Position, PIXI.Container> = new Map();
  private cardPositions: Map<Position, PIXI.Container[]> = new Map();
  private trumpIndicator: PIXI.Container | null = null;
  private scoreDisplay: PIXI.Container | null = null;
  private trickArea: PIXI.Container | null = null;
  private menuButton: PIXI.Container | null = null;

  protected async createUI(): Promise<void> {
    // Background gradient
    const bg = new PIXI.Graphics();
    bg.beginFill(0x0a2f1a);
    bg.drawRect(0, 0, this.screenWidth, this.screenHeight);
    bg.endFill();
    this.container.addChild(bg);

    // Create oval table
    this.createTable();
    
    // Create player positions
    this.createPlayerPositions();
    
    // Create trick area (center of table)
    this.createTrickArea();
    
    // Create trump indicator
    this.createTrumpIndicator();
    
    // Create score display
    this.createScoreDisplay();
    
    // Create menu button
    this.createMenuButton();
    
    // Initialize with sample data
    this.setupSampleGame();
  }

  private createTable(): void {
    this.table = new PIXI.Graphics();
    
    // Table surface (oval)
    this.table.beginFill(0x2d6e3f);
    this.table.lineStyle(4, 0x4a8c5a);
    this.table.drawEllipse(this.screenWidth / 2, this.screenHeight / 2, 300, 200);
    this.table.endFill();
    
    // Table edge
    this.table.lineStyle(8, 0x1a4a2a);
    this.table.drawEllipse(this.screenWidth / 2, this.screenHeight / 2, 320, 220);
    
    this.container.addChild(this.table);
  }

  private createPlayerPositions(): void {
    const positions = [
      { pos: Position.SOUTH, x: this.screenWidth / 2, y: this.screenHeight - 80, name: 'Vous' },
      { pos: Position.WEST, x: 80, y: this.screenHeight / 2, name: 'IA Ouest' },
      { pos: Position.NORTH, x: this.screenWidth / 2, y: 80, name: 'IA Nord' },
      { pos: Position.EAST, x: this.screenWidth - 80, y: this.screenHeight / 2, name: 'IA Est' },
    ];

    positions.forEach(({ pos, x, y, name }) => {
      const container = new PIXI.Container();
      container.x = x;
      container.y = y;

      // Player name
      const nameText = this.createText(name, 0, 0, {
        fontSize: 16,
        fill: 0xffffff
      });
      container.addChild(nameText);

      // Cards area for this player
      const cardsContainer = new PIXI.Container();
      this.cardPositions.set(pos, []);
      container.addChild(cardsContainer);

      this.playerPositions.set(pos, container);
      this.container.addChild(container);
    });
  }

  private createTrickArea(): void {
    this.trickArea = new PIXI.Container();
    this.trickArea.x = this.screenWidth / 2;
    this.trickArea.y = this.screenHeight / 2;

    // Trick area background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x1a3d2b, 0.5);
    bg.drawCircle(0, 0, 80);
    bg.endFill();
    this.trickArea.addChild(bg);

    this.container.addChild(this.trickArea);
  }

  private createTrumpIndicator(): void {
    this.trumpIndicator = new PIXI.Container();
    this.trumpIndicator.x = this.screenWidth - 120;
    this.trumpIndicator.y = 60;

    // Background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x4a7c59);
    bg.lineStyle(2, 0xffd700);
    bg.drawRoundedRect(-50, -30, 100, 60, 8);
    bg.endFill();
    this.trumpIndicator.addChild(bg);

    // Trump label
    const label = this.createText(this.app.i18nManager.t('game.trump'), 0, -10, {
      fontSize: 14,
      fill: 0xffffff
    });
    this.trumpIndicator.addChild(label);

    // Trump suit (placeholder)
    const trumpSuit = this.createText('♠', 0, 10, {
      fontSize: 24,
      fill: 0x000000
    });
    this.trumpIndicator.addChild(trumpSuit);

    this.container.addChild(this.trumpIndicator);
  }

  private createScoreDisplay(): void {
    this.scoreDisplay = new PIXI.Container();
    this.scoreDisplay.x = 120;
    this.scoreDisplay.y = 60;

    // Background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x4a7c59);
    bg.lineStyle(2, 0xffd700);
    bg.drawRoundedRect(-50, -30, 100, 60, 8);
    bg.endFill();
    this.scoreDisplay.addChild(bg);

    // Score label
    const label = this.createText(this.app.i18nManager.t('game.score'), 0, -10, {
      fontSize: 14,
      fill: 0xffffff
    });
    this.scoreDisplay.addChild(label);

    // Score values
    const score = this.createText('0 - 0', 0, 10, {
      fontSize: 16,
      fill: 0xffd700
    });
    this.scoreDisplay.addChild(score);

    this.container.addChild(this.scoreDisplay);
  }

  private createMenuButton(): void {
    this.menuButton = this.createButton('Menu', 20, 20, 80, 40);
    this.container.addChild(this.menuButton);
  }

  private setupSampleGame(): void {
    // Add sample cards for player positions
    this.addSampleCards(Position.SOUTH, 8); // Player hand
    this.addSampleCards(Position.WEST, 8);
    this.addSampleCards(Position.NORTH, 8);
    this.addSampleCards(Position.EAST, 8);
    
    // Add current turn indicator
    this.showCurrentPlayer(Position.SOUTH);
  }

  private addSampleCards(position: Position, count: number): void {
    const playerContainer = this.playerPositions.get(position);
    if (!playerContainer) return;

    const cards: PIXI.Container[] = [];

    for (let i = 0; i < count; i++) {
      const card = this.createCardBack();
      
      // Position cards based on player position
      switch (position) {
        case Position.SOUTH:
          card.x = (i - count / 2) * 25;
          card.y = 40;
          break;
        case Position.WEST:
          card.x = 60;
          card.y = (i - count / 2) * 15;
          card.rotation = Math.PI / 2;
          break;
        case Position.NORTH:
          card.x = (i - count / 2) * 25;
          card.y = -40;
          break;
        case Position.EAST:
          card.x = -60;
          card.y = (i - count / 2) * 15;
          card.rotation = -Math.PI / 2;
          break;
      }

      cards.push(card);
      playerContainer.addChild(card);
    }

    this.cardPositions.set(position, cards);
  }

  private createCardBack(): PIXI.Container {
    const card = new PIXI.Container();

    // Card background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x003d7a);
    bg.lineStyle(1, 0x000000);
    bg.drawRoundedRect(-15, -20, 30, 40, 3);
    bg.endFill();

    // Card pattern
    const pattern = new PIXI.Graphics();
    pattern.lineStyle(1, 0x0066cc);
    pattern.moveTo(-10, -15);
    pattern.lineTo(10, 15);
    pattern.moveTo(10, -15);
    pattern.lineTo(-10, 15);
    bg.addChild(pattern);

    card.addChild(bg);
    return card;
  }

  private showCurrentPlayer(position: Position): void {
    // Clear previous indicators
    this.playerPositions.forEach(container => {
      // Remove any existing turn indicator
      const existing = container.children.find(child => child.name === 'turnIndicator');
      if (existing) container.removeChild(existing);
    });

    // Add turn indicator to current player
    const playerContainer = this.playerPositions.get(position);
    if (!playerContainer) return;

    const indicator = new PIXI.Graphics();
    indicator.name = 'turnIndicator';
    indicator.beginFill(0xffd700, 0.7);
    indicator.drawCircle(0, 0, 50);
    indicator.endFill();
    indicator.zIndex = -1;
    
    playerContainer.addChildAt(indicator, 0);
  }

  protected override setupEventListeners(): void {
    if (this.menuButton) {
      this.menuButton.on('pointertap', () => {
        this.app.audioManager.playSound('click');
        this.app.sceneManager.switchTo(SceneType.MENU);
      });
    }
  }

  override handleResize(): void {
    if (!this.isInitialized) return;

    // Update background
    const bg = this.container.getChildAt(0) as PIXI.Graphics;
    bg.clear();
    bg.beginFill(0x0a2f1a);
    bg.drawRect(0, 0, this.screenWidth, this.screenHeight);
    bg.endFill();

    // Update table position
    if (this.table) {
      this.table.clear();
      this.table.beginFill(0x2d6e3f);
      this.table.lineStyle(4, 0x4a8c5a);
      this.table.drawEllipse(this.screenWidth / 2, this.screenHeight / 2, 300, 200);
      this.table.endFill();
      this.table.lineStyle(8, 0x1a4a2a);
      this.table.drawEllipse(this.screenWidth / 2, this.screenHeight / 2, 320, 220);
    }

    // Update UI element positions
    if (this.trumpIndicator) {
      this.trumpIndicator.x = this.screenWidth - 120;
    }

    if (this.trickArea) {
      this.trickArea.x = this.screenWidth / 2;
      this.trickArea.y = this.screenHeight / 2;
    }

    // Update player positions
    const positions = [
      { pos: Position.SOUTH, x: this.screenWidth / 2, y: this.screenHeight - 80 },
      { pos: Position.WEST, x: 80, y: this.screenHeight / 2 },
      { pos: Position.NORTH, x: this.screenWidth / 2, y: 80 },
      { pos: Position.EAST, x: this.screenWidth - 80, y: this.screenHeight / 2 },
    ];

    positions.forEach(({ pos, x, y }) => {
      const container = this.playerPositions.get(pos);
      if (container) {
        container.x = x;
        container.y = y;
      }
    });
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