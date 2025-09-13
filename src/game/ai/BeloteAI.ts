import { Card } from '../models/Card'
import { Player } from '../models/Player'
import { Trick } from '../models/Trick'
import { Round } from '../models/Round'
import { GameState } from '../models/GameState'
import { AILevel, Suit, Position } from '../models/Types'
/**
 * AI decision context provided to AI implementations
 */
export interface AIContext {
  player: Player
  currentTrick: Trick
  round: Round
  gameState: GameState
  trumpSuit: Suit
  validCards: Card[]
  playersInOrder: Position[]
}

/**
 * Result of an AI decision
 */
export interface AIDecision {
  card: Card
  reasoning?: string
  confidence: number // 0.0 to 1.0
}

/**
 * Abstract base class for all AI implementations
 */
export abstract class BeloteAI {
  public readonly level: AILevel
  public readonly name: string
  public readonly mistakeProbability: number

  constructor(level: AILevel, name: string, mistakeProbability: number = 0.0) {
    this.level = level
    this.name = name
    this.mistakeProbability = mistakeProbability
  }

  /**
   * Choose a card to play
   * @param context - The current game context
   * @returns The AI's decision
   */
  public abstract chooseCard(context: AIContext): AIDecision

  /**
   * Evaluate the strength of a card in the current context
   * @param card - The card to evaluate
   * @param context - The current game context
   * @returns Strength score (0.0 to 1.0)
   */
  protected abstract evaluateCard(card: Card, context: AIContext): number

  /**
   * Check if AI should make a mistake based on mistake probability
   * @param randomFn - Random function (0-1)
   * @returns True if AI should make a mistake
   */
  protected shouldMakeMistake(randomFn: () => number): boolean {
    return randomFn() < this.mistakeProbability
  }

  /**
   * Make a random choice from valid cards (used for mistakes)
   * @param validCards - Array of valid cards
   * @param randomFn - Random function (0-1)
   * @returns Random card decision
   */
  protected makeRandomChoice(validCards: Card[], randomFn: () => number): AIDecision {
    if (validCards.length === 0) {
      throw new Error('No valid cards available for random choice')
    }

    const randomIndex = Math.floor(randomFn() * validCards.length)
    const card = validCards[randomIndex]!

    return {
      card,
      reasoning: 'Coup alÃ©atoire',
      confidence: 0.1,
    }
  }

  /**
   * Get basic card information for evaluation
   * @param card - The card to analyze
   * @param context - The current game context
   * @returns Basic card info
   */
  protected getCardInfo(card: Card, context: AIContext) {
    const { trumpSuit } = context
    
    return {
      isTrump: card.isTrump(trumpSuit),
      points: card.getPoints(trumpSuit),
      order: card.getOrder(trumpSuit),
      isHighValue: card.getPoints(trumpSuit) >= 10,
      isJackOfTrump: card.isJackOfTrump(trumpSuit),
      isNineOfTrump: card.isNineOfTrump(trumpSuit),
    }
  }

  /**
   * Analyze the current trick state
   * @param context - The current game context
   * @returns Trick analysis
   */
  protected analyzeTrick(context: AIContext) {
    const { currentTrick, trumpSuit } = context
    const plays = currentTrick.getPlays()
    const leadSuit = currentTrick.getLeadSuit()
    
    return {
      isEmpty: currentTrick.isEmpty(),
      leadSuit,
      playCount: plays.length,
      currentWinner: currentTrick.getWinner(),
      totalPoints: currentTrick.getTotalPoints(),
      hasTrump: plays.some(play => play.card.isTrump(trumpSuit)),
      isPartnerWinning: this.isPartnerCurrentlyWinning(context),
    }
  }

  /**
   * Check if partner is currently winning the trick
   * @param context - The current game context
   * @returns True if partner is winning
   */
  protected isPartnerCurrentlyWinning(context: AIContext): boolean {
    const { currentTrick, player } = context
    const currentWinner = currentTrick.getWinner()
    
    if (!currentWinner) {
      return false
    }

    return player.isTeammate(currentWinner)
  }

  /**
   * Get remaining cards in other players' hands (estimation)
   * @param context - The current game context
   * @returns Estimated card distribution
   */
  protected estimateRemainingCards(context: AIContext) {
    const { round, player } = context
    const allPlayers = round.getAllPlayers()
    
    let totalCardsRemaining = 0
    for (const otherPlayer of allPlayers) {
      if (otherPlayer.id !== player.id) {
        totalCardsRemaining += otherPlayer.hand.size()
      }
    }

    return {
      totalCardsRemaining,
      avgCardsPerPlayer: totalCardsRemaining / 3,
    }
  }

  /**
   * Create a standard decision with reasoning
   * @param card - The chosen card
   * @param reasoning - Explanation for the choice
   * @param confidence - Confidence level (0.0 to 1.0)
   * @returns AI decision object
   */
  protected createDecision(card: Card, reasoning: string, confidence: number): AIDecision {
    return {
      card,
      reasoning,
      confidence: Math.max(0.0, Math.min(1.0, confidence)),
    }
  }
}


