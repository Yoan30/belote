import { Card } from ''
import { BeloteAI, AIContext, AIDecision } from ''
import { AILevel } from ''

/**
 * Smart AI with basic strategy and occasional mistakes
 * Mistake probability: 15%
 */
export class SmartAI extends BeloteAI {
  constructor() {
    super(AILevel.CONFIRME, 'Confirmé', 0.15)
  }

  public chooseCard(context: AIContext): AIDecision {
    const { validCards } = context
    
    if (validCards.length === 0) {
      throw new Error('No valid cards available')
    }

    // Random function for this AI
    const randomFn = () => Math.random()

    // 15% chance to make a mistake
    if (this.shouldMakeMistake(randomFn)) {
      return this.makeRandomChoice(validCards, randomFn)
    }

    // Use strategic evaluation
    const bestCard = this.findBestCard(context)
    
    return this.createDecision(
      bestCard.card,
      bestCard.reasoning,
      0.6
    )
  }

  private findBestCard(context: AIContext): { card: Card; reasoning: string } {
    const { validCards } = context
    const trickInfo = this.analyzeTrick(context)

    // Evaluate all cards and find the best one
    const cardEvaluations = validCards.map(card => ({
      card,
      score: this.evaluateCard(card, context),
      info: this.getCardInfo(card, context),
    }))

    // Sort by score (highest first)
    cardEvaluations.sort((a, b) => b.score - a.score)
    const bestCard = cardEvaluations[0]!

    // Generate reasoning
    let reasoning = this.generateReasoning(bestCard, trickInfo, context)

    return {
      card: bestCard.card,
      reasoning,
    }
  }

  private generateReasoning(
    cardEval: { card: Card; score: number; info: any },
    trickInfo: any,
    _context: AIContext
  ): string {
    const { info } = cardEval
    
    if (trickInfo.isEmpty) {
      if (info.isTrump && info.isHighValue) {
        return 'Entame avec un atout fort'
      } else if (info.isHighValue) {
        return 'Entame avec une belle carte'
      } else {
        return 'Entame prudente'
      }
    }

    if (trickInfo.isPartnerWinning) {
      if (info.points <= 2) {
        return 'Défausse faible, partenaire maître'
      } else {
        return 'Soutien du partenaire'
      }
    }

    if (info.isTrump) {
      return 'Coupe ou surcoupe'
    }

    if (trickInfo.leadSuit && cardEval.card.suit === trickInfo.leadSuit) {
      return 'Fournit à la couleur'
    }

    return 'Défausse tactique'
  }

  protected evaluateCard(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    const trickInfo = this.analyzeTrick(context)

    let score = 0.5 // Base score

    // Trick-specific strategy
    if (trickInfo.isEmpty) {
      // Leading strategy
      score += this.evaluateLeadingCard(card, context)
    } else {
      // Following strategy  
      score += this.evaluateFollowingCard(card, context)
    }

    // General card value considerations
    if (cardInfo.isTrump) {
      score += 0.15 // Trump cards are generally good
      
      if (cardInfo.isJackOfTrump) {
        score += 0.2 // Jack of trump is very strong
      } else if (cardInfo.isNineOfTrump) {
        score += 0.15 // Nine of trump is strong
      }
    }

    // Consider partnership
    if (trickInfo.isPartnerWinning) {
      // Partner is winning - prefer low cards
      if (cardInfo.points <= 3) {
        score += 0.2
      } else {
        score -= 0.15 // Don't waste high cards
      }
    } else {
      // Try to win or help win
      if (cardInfo.isHighValue || cardInfo.isTrump) {
        score += 0.1
      }
    }

    return Math.max(0.0, Math.min(1.0, score))
  }

  private evaluateLeadingCard(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    let score = 0.0

    // Lead with medium-strength cards
    if (cardInfo.points >= 4 && cardInfo.points <= 10) {
      score += 0.1
    }

    // Be cautious with very high cards
    if (cardInfo.points > 10) {
      score -= 0.05
    }

    // Trump leads can be good if you have multiple
    if (cardInfo.isTrump) {
      const trumpCount = context.player.hand.getTrumpCards(context.trumpSuit).length
      if (trumpCount >= 3) {
        score += 0.1
      } else {
        score -= 0.1 // Don't waste trump if you have few
      }
    }

    return score
  }

  private evaluateFollowingCard(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    const trickInfo = this.analyzeTrick(context)
    let score = 0.0

    // If we can win the trick
    const canWin = this.canCardWinTrick(card, context)
    if (canWin) {
      score += 0.2
      
      // Winning with trump is good
      if (cardInfo.isTrump) {
        score += 0.1
      }
    }

    // Following suit considerations
    if (trickInfo.leadSuit && card.suit === trickInfo.leadSuit) {
      score += 0.05 // Small bonus for following suit
    }

    // Trump considerations
    if (cardInfo.isTrump && !trickInfo.hasTrump) {
      score += 0.15 // First trump in trick
    }

    return score
  }

  private canCardWinTrick(card: Card, context: AIContext): boolean {
    const { currentTrick, trumpSuit } = context
    const leadSuit = currentTrick.getLeadSuit()
    
    if (!leadSuit) {
      return true // Any card wins an empty trick
    }

    const plays = currentTrick.getPlays()
    for (const play of plays) {
      if (!card.beats(play.card, trumpSuit, leadSuit)) {
        return false
      }
    }
    
    return true
  }
}
