import { Card } from '../models/Card.js'
import { BeloteAI, AIContext, AIDecision } from './BeloteAI.js'
import { AILevel } from '../models/Types.js'

/**
 * Simple AI that makes mostly random moves with minimal strategy
 * Mistake probability: 30%
 */
export class SimpleAI extends BeloteAI {
  constructor() {
    super(AILevel.APPRENTI, 'Apprenti', 0.3)
  }

  public chooseCard(context: AIContext): AIDecision {
    const { validCards } = context
    
    if (validCards.length === 0) {
      throw new Error('No valid cards available')
    }

    // Random function for this AI (would be injected in real implementation)
    const randomFn = () => Math.random()

    // 30% chance to make a completely random move
    if (this.shouldMakeMistake(randomFn)) {
      return this.makeRandomChoice(validCards, randomFn)
    }

    // Simple strategy: prefer high-value cards slightly
    const cardScores = validCards.map(card => ({
      card,
      score: this.evaluateCard(card, context),
    }))

    // Add some randomness to the choice
    const randomizedScores = cardScores.map(item => ({
      ...item,
      score: item.score + (randomFn() - 0.5) * 0.4, // Add ±0.2 randomness
    }))

    // Sort by score and pick the best
    randomizedScores.sort((a, b) => b.score - a.score)
    const chosenCard = randomizedScores[0]!.card

    return this.createDecision(
      chosenCard,
      'Stratégie simple',
      0.4
    )
  }

  protected evaluateCard(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    const trickInfo = this.analyzeTrick(context)

    let score = 0.5 // Base score

    // Prefer high-value cards slightly
    if (cardInfo.isHighValue) {
      score += 0.2
    }

    // Prefer trump cards
    if (cardInfo.isTrump) {
      score += 0.1
    }

    // Avoid wasting high cards when partner is winning
    if (trickInfo.isPartnerWinning && cardInfo.isHighValue) {
      score -= 0.2
    }

    // Very basic lead preference
    if (trickInfo.isEmpty) {
      // Prefer medium-strength cards when leading
      if (cardInfo.points >= 3 && cardInfo.points <= 10) {
        score += 0.1
      }
    }

    return Math.max(0.0, Math.min(1.0, score))
  }
}