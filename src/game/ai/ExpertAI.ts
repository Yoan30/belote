import { Card } from '../models/Card.js'
import { BeloteAI, AIContext, AIDecision } from './BeloteAI.js'
import { AILevel } from '../models/Types.js'

/**
 * Expert AI with advanced strategy and rare mistakes
 * Mistake probability: 5%
 */
export class ExpertAI extends BeloteAI {
  constructor() {
    super(AILevel.EXPERT, 'Expert', 0.05)
  }

  public chooseCard(context: AIContext): AIDecision {
    const { validCards } = context
    
    if (validCards.length === 0) {
      throw new Error('No valid cards available')
    }

    // Random function for this AI
    const randomFn = () => Math.random()

    // 5% chance to make a mistake
    if (this.shouldMakeMistake(randomFn)) {
      return this.makeRandomChoice(validCards, randomFn)
    }

    // Use advanced strategic evaluation
    const bestCard = this.findBestCardAdvanced(context)
    
    return this.createDecision(
      bestCard.card,
      bestCard.reasoning,
      0.8
    )
  }

  private findBestCardAdvanced(context: AIContext): { card: Card; reasoning: string } {
    const { validCards } = context
    
    // Multiple evaluation criteria
    const cardEvaluations = validCards.map(card => {
      const basicScore = this.evaluateCard(card, context)
      const tacticalScore = this.evaluateTactical(card, context)
      const strategicScore = this.evaluateStrategic(card, context)
      
      const totalScore = (basicScore * 0.4) + (tacticalScore * 0.4) + (strategicScore * 0.2)
      
      return {
        card,
        score: totalScore,
        breakdown: { basicScore, tacticalScore, strategicScore },
      }
    })

    // Sort by score
    cardEvaluations.sort((a, b) => b.score - a.score)
    const bestCard = cardEvaluations[0]!

    const reasoning = this.generateAdvancedReasoning(bestCard, context)

    return {
      card: bestCard.card,
      reasoning,
    }
  }

  private evaluateTactical(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    const trickInfo = this.analyzeTrick(context)
    let score = 0.5

    // Tactical considerations for current trick
    if (trickInfo.isEmpty) {
      // Leading tactics
      score += this.evaluateLeadingTactics(card, context)
    } else {
      // Following tactics
      score += this.evaluateFollowingTactics(card, context)
    }

    // Partnership considerations
    if (trickInfo.isPartnerWinning) {
      // Partner winning - be more conservative
      if (cardInfo.points <= 2) {
        score += 0.25 // Discard low
      } else if (cardInfo.points >= 10) {
        score -= 0.2 // Don't waste high cards
      }
    } else {
      // Need to compete for the trick
      if (this.canCardWinTrick(card, context)) {
        score += 0.3 // Winning is good
        
        // But consider the cost
        if (cardInfo.points > 10 && trickInfo.totalPoints < 10) {
          score -= 0.1 // Don't overkill cheap tricks
        }
      }
    }

    // Trump management
    if (cardInfo.isTrump) {
      const trumpCount = context.player.hand.getTrumpCards(context.trumpSuit).length
      if (trumpCount === 1 && !this.isCriticalSituation(context)) {
        score -= 0.15 // Preserve last trump
      }
    }

    return Math.max(0.0, Math.min(1.0, score))
  }

  private evaluateStrategic(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    let score = 0.5

    // Long-term strategic considerations
    const remainingInfo = this.estimateRemainingCards(context)
    
    // Card counting considerations (simplified)
    if (cardInfo.isTrump) {
      // Estimate remaining trumps
      const myTrumps = context.player.hand.getTrumpCards(context.trumpSuit).length
      score += this.evaluateTrumpStrategy(card, myTrumps, context)
    }

    // Endgame considerations
    if (remainingInfo.avgCardsPerPlayer <= 3) {
      score += this.evaluateEndgame(card, context)
    }

    // Belote considerations
    if (this.canCreateBeloteOpportunity(card, context)) {
      score += 0.1
    }

    return Math.max(0.0, Math.min(1.0, score))
  }

  private evaluateTrumpStrategy(card: Card, myTrumpCount: number, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    let score = 0.0

    if (cardInfo.isJackOfTrump) {
      // Jack of trump is almost always good to play
      score += 0.2
    } else if (cardInfo.isNineOfTrump) {
      // Nine of trump is strong
      score += 0.15
    } else if (myTrumpCount >= 4) {
      // Have many trumps - can afford to play them
      score += 0.1
    } else if (myTrumpCount <= 2) {
      // Few trumps - be conservative
      score -= 0.1
    }

    return score
  }

  private evaluateEndgame(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    let score = 0.0

    // In endgame, high cards become more valuable
    if (cardInfo.isHighValue) {
      score += 0.15
    }

    // Trump cards are critical in endgame
    if (cardInfo.isTrump) {
      score += 0.1
    }

    return score
  }

  private isCriticalSituation(context: AIContext): boolean {
    const trickInfo = this.analyzeTrick(context)
    
    // High-value trick that we're losing
    return trickInfo.totalPoints >= 15 && !trickInfo.isPartnerWinning
  }

  private canCreateBeloteOpportunity(card: Card, context: AIContext): boolean {
    const { player, trumpSuit } = context
    
    // Check if playing this card sets up Belote announcement
    if (player.hand.hasBelote(trumpSuit) && !player.beloteAnnounced) {
      return card.isTrump(trumpSuit) && (card.rank === 'king' || card.rank === 'queen')
    }
    
    return false
  }

  protected evaluateCard(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    const trickInfo = this.analyzeTrick(context)
    let score = 0.5

    // Basic card strength
    score += cardInfo.points / 20 // Normalize points to 0-1 range

    // Trump bonus
    if (cardInfo.isTrump) {
      score += 0.1
      if (cardInfo.isJackOfTrump) score += 0.15
      if (cardInfo.isNineOfTrump) score += 0.1
    }

    // Context-specific adjustments
    if (!trickInfo.isEmpty) {
      if (this.canCardWinTrick(card, context)) {
        score += 0.2
      }
    }

    return Math.max(0.0, Math.min(1.0, score))
  }

  private evaluateLeadingTactics(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    let score = 0.0

    // Expert leading strategy
    if (cardInfo.isTrump) {
      const trumpCount = context.player.hand.getTrumpCards(context.trumpSuit).length
      if (trumpCount >= 4) {
        score += 0.15 // Lead trump if you have many
      } else {
        score -= 0.1 // Conserve trump otherwise
      }
    } else {
      // Lead with cards that might force trump
      if (cardInfo.points >= 10) {
        score += 0.1
      }
    }

    return score
  }

  private evaluateFollowingTactics(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    let score = 0.0

    // Expert following strategy
    if (this.canCardWinTrick(card, context)) {
      score += 0.2
      
      // Consider overkill
      const trickInfo = this.analyzeTrick(context)
      if (cardInfo.points > trickInfo.totalPoints + 5) {
        score -= 0.1 // Mild penalty for overkill
      }
    }

    return score
  }

  private canCardWinTrick(card: Card, context: AIContext): boolean {
    const { currentTrick, trumpSuit } = context
    const leadSuit = currentTrick.getLeadSuit()
    
    if (!leadSuit) {
      return true
    }

    const plays = currentTrick.getPlays()
    for (const play of plays) {
      if (!card.beats(play.card, trumpSuit, leadSuit)) {
        return false
      }
    }
    
    return true
  }

  private generateAdvancedReasoning(
    cardEval: { card: Card; score: number; breakdown: any },
    context: AIContext
  ): string {
    const { card } = cardEval
    const cardInfo = this.getCardInfo(card, context)
    const trickInfo = this.analyzeTrick(context)

    if (trickInfo.isEmpty) {
      if (cardInfo.isTrump && cardInfo.isHighValue) {
        return 'Entame tactique avec maître atout'
      } else if (cardInfo.isHighValue) {
        return 'Entame forcing pour faire couper'
      } else {
        return 'Entame sécurisée'
      }
    }

    if (trickInfo.isPartnerWinning) {
      if (cardInfo.points <= 2) {
        return 'Défausse optimale, partenaire maître'
      } else {
        return 'Soutien calculé du partenaire'
      }
    }

    if (this.canCardWinTrick(card, context)) {
      if (cardInfo.isTrump) {
        return 'Prise tactique à l\'atout'
      } else {
        return 'Prise avec honneur'
      }
    }

    return 'Coup expert calculé'
  }
}