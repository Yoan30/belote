import { Card } from '../../game/models/Card.js';
import { Hand } from '../../game/models/Hand.js';
import { Trick } from '../../game/models/Trick.js';
import { GameState } from '../../game/models/GameState.js';
import { Position, Suit, AILevel } from '../../game/models/Types.js';
import seedrandom from 'seedrandom';

export interface AIDecision {
  card: Card;
  confidence: number; // 0-1, how confident the AI is in this decision
  reasoning?: string; // For debugging
}

export class AIManager {
  private rng: () => number;
  private seed: string;

  constructor(seed?: string) {
    this.seed = seed || this.generateSeed();
    this.rng = seedrandom(this.seed);
  }

  // Simplified decision making without the existing AI classes for now
  public makeDecision(
    level: AILevel,
    hand: Hand,
    _trick: Trick | null,
    _trump: Suit,
    _gameState: GameState,
    _position: Position
  ): AIDecision {
    const cards = hand.getCards();
    if (cards.length === 0) {
      throw new Error('No cards in hand');
    }

    // Simple random choice for now - would implement proper AI logic later
    const randomIndex = Math.floor(this.getRandom() * cards.length);
    const card = cards[randomIndex];
    
    if (!card) {
      throw new Error('Failed to select a card');
    }

    const confidence = this.calculateConfidence(level, cards.length);
    
    return {
      card,
      confidence,
      reasoning: `${this.getAILevelName(level)} chose ${card.toString()} randomly`
    };
  }

  private calculateConfidence(level: AILevel, handSize: number): number {
    // Base confidence by AI level
    const baseConfidence = {
      [AILevel.APPRENTI]: 0.6,
      [AILevel.CONFIRME]: 0.75,
      [AILevel.EXPERT]: 0.85,
      [AILevel.CHAMPION]: 0.95
    }[level];

    // Adjust based on hand size (fewer cards = easier decision = more confident)
    const handAdjustment = (8 - handSize) * 0.02; // Up to 0.16 bonus for smaller hands
    
    return Math.min(0.99, baseConfidence + handAdjustment);
  }

  public setSeed(seed: string): void {
    this.seed = seed;
    this.rng = seedrandom(seed);
  }

  public getSeed(): string {
    return this.seed;
  }

  public getRandom(): number {
    return this.rng();
  }

  private generateSeed(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Simulate thinking time for different AI levels
  public async simulateThinking(level: AILevel): Promise<void> {
    const thinkingTimes: Record<AILevel, [number, number]> = {
      [AILevel.APPRENTI]: [200, 800],    // 0.2-0.8 seconds
      [AILevel.CONFIRME]: [500, 1500],   // 0.5-1.5 seconds  
      [AILevel.EXPERT]: [800, 2000],     // 0.8-2.0 seconds
      [AILevel.CHAMPION]: [1000, 2500]   // 1.0-2.5 seconds
    };

    const [min, max] = thinkingTimes[level];
    const thinkingTime = min + this.getRandom() * (max - min);
    
    return new Promise(resolve => {
      setTimeout(resolve, thinkingTime);
    });
  }

  // Get all available AI levels
  public getAvailableLevels(): AILevel[] {
    return Object.values(AILevel);
  }

  // Get AI level display names
  public getAILevelName(level: AILevel): string {
    const names = {
      [AILevel.APPRENTI]: 'Apprenti',
      [AILevel.CONFIRME]: 'Confirmé', 
      [AILevel.EXPERT]: 'Expert',
      [AILevel.CHAMPION]: 'Champion'
    };
    return names[level];
  }

  // Get AI level descriptions
  public getAILevelDescription(level: AILevel): string {
    const descriptions = {
      [AILevel.APPRENTI]: 'Joue de manière basique, fait parfois des erreurs',
      [AILevel.CONFIRME]: 'Comprend les règles et joue correctement la plupart du temps',
      [AILevel.EXPERT]: 'Joue de manière optimisée avec une bonne stratégie',
      [AILevel.CHAMPION]: 'Maîtrise parfaite du jeu avec stratégie avancée'
    };
    return descriptions[level];
  }

  // Test AI determinism with same seed
  public testDeterminism(level: AILevel, testCases: any[]): boolean {
    const results1: Card[] = [];
    const results2: Card[] = [];

    // First run
    this.setSeed('test-seed');
    testCases.forEach(testCase => {
      const decision = this.makeDecision(level, testCase.hand, testCase.trick, testCase.trump, testCase.gameState, testCase.position);
      results1.push(decision.card);
    });

    // Second run with same seed
    this.setSeed('test-seed');
    testCases.forEach(testCase => {
      const decision = this.makeDecision(level, testCase.hand, testCase.trick, testCase.trump, testCase.gameState, testCase.position);
      results2.push(decision.card);
    });

    // Compare results
    if (results1.length !== results2.length) return false;
    
    for (let i = 0; i < results1.length; i++) {
      if (results1[i]?.id !== results2[i]?.id) {
        return false;
      }
    }

    return true;
  }
}