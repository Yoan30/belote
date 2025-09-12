import { Card } from '../models/Card.js'
import { BeloteAI, AIContext, AIDecision } from './BeloteAI.js'
import { AILevel, Suit, Team } from '../models/Types.js'

/**
 * Champion AI with near-optimal play and very rare mistakes
 * Mistake probability: 1%
 */
export class ChampionAI extends BeloteAI {
  constructor() {
    super(AILevel.CHAMPION, 'Champion', 0.01)
  }

  public chooseCard(context: AIContext): AIDecision {
    const { validCards } = context
    
    if (validCards.length === 0) {
      throw new Error('No valid cards available')
    }

    // Random function for this AI
    const randomFn = () => Math.random()

    // Only 1% chance to make a mistake
    if (this.shouldMakeMistake(randomFn)) {
      return this.makeRandomChoice(validCards, randomFn)
    }

    // Use championship-level evaluation
    const bestCard = this.findOptimalCard(context)
    
    return this.createDecision(
      bestCard.card,
      bestCard.reasoning,
      0.95
    )
  }

  private findOptimalCard(context: AIContext): { card: Card; reasoning: string } {
    const { validCards } = context
    
    // Multi-layered evaluation system
    const cardEvaluations = validCards.map(card => {
      const scores = {
        immediate: this.evaluateImmediate(card, context),
        tactical: this.evaluateTactical(card, context),
        strategic: this.evaluateStrategic(card, context),
        probabilistic: this.evaluateProbabilistic(card, context),
      }
      
      // Weighted combination of all factors
      const totalScore = 
        scores.immediate * 0.35 +
        scores.tactical * 0.30 +
        scores.strategic * 0.25 +
        scores.probabilistic * 0.10
      
      return {
        card,
        score: totalScore,
        scores,
      }
    })

    // Sort by score
    cardEvaluations.sort((a, b) => b.score - a.score)
    const bestCard = cardEvaluations[0]!

    const reasoning = this.generateChampionReasoning(bestCard, context)

    return {
      card: bestCard.card,
      reasoning,
    }
  }

  private evaluateImmediate(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    const trickInfo = this.analyzeTrick(context)
    let score = 0.5

    // Immediate trick considerations
    if (trickInfo.isEmpty) {
      score += this.evaluateOptimalLead(card, context)
    } else {
      score += this.evaluateOptimalResponse(card, context)
    }

    // Immediate value considerations
    if (this.canCardWinTrick(card, context)) {
      const trickValue = this.calculateTrickValue(context)
      score += trickValue / 50 // Normalize to 0-1 range
      
      // Efficiency bonus
      if (cardInfo.points <= trickValue) {
        score += 0.1 // Efficient win
      }
    }

    return Math.max(0.0, Math.min(1.0, score))
  }

  private evaluateTactical(card: Card, context: AIContext): number {
    const trickInfo = this.analyzeTrick(context)
    let score = 0.5

    // Advanced tactical considerations
    if (trickInfo.isPartnerWinning) {
      score += this.evaluatePartnerSupport(card, context)
    } else {
      score += this.evaluateCompetitive(card, context)
    }

    // Communication through play
    score += this.evaluateCommunication(card, context)

    // Defensive considerations
    score += this.evaluateDefensive(card, context)

    return Math.max(0.0, Math.min(1.0, score))
  }

  private evaluateStrategic(card: Card, context: AIContext): number {
    let score = 0.5

    // Long-term strategic value
    score += this.evaluateCardRetention(card, context)
    score += this.evaluateFutureOpportunities(card, context)
    score += this.evaluateOpponentConstraints(card, context)

    // Game state considerations
    const gameInfo = this.analyzeGameState(context)
    if (gameInfo.isCloseGame) {
      score += this.evaluateCloseGameStrategy(card, context)
    }

    return Math.max(0.0, Math.min(1.0, score))
  }

  private evaluateProbabilistic(card: Card, context: AIContext): number {
    let score = 0.5

    // Card distribution analysis
    score += this.evaluateCardDistribution(card, context)
    
    // Opponent modeling (simplified)
    score += this.evaluateOpponentBehavior(card, context)

    return Math.max(0.0, Math.min(1.0, score))
  }

  private evaluateOptimalLead(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    let score = 0.0

    // Champion leading strategy
    if (cardInfo.isTrump) {
      const trumpAnalysis = this.analyzeTrumpSituation(context)
      if (trumpAnalysis.shouldLeadTrump) {
        score += 0.2
        if (cardInfo.isJackOfTrump) score += 0.1
      } else {
        score -= 0.15
      }
    } else {
      // Lead to establish suit or force trump
      const suitAnalysis = this.analyzeSuitStrength(card.suit, context)
      score += suitAnalysis.leadershipValue
    }

    return score
  }

  private evaluateOptimalResponse(card: Card, context: AIContext): number {
    let score = 0.0

    // Optimal response calculation
    if (this.canCardWinTrick(card, context)) {
      const efficiency = this.calculateWinEfficiency(card, context)
      score += efficiency
    }

    // Sacrifice analysis
    if (!this.canCardWinTrick(card, context)) {
      const sacrificeValue = this.calculateSacrificeValue(card, context)
      score += sacrificeValue
    }

    return score
  }

  private evaluatePartnerSupport(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    let score = 0.0

    // Optimal discard when partner is winning
    if (cardInfo.points <= 2) {
      score += 0.3 // Perfect discard
    } else if (cardInfo.points <= 4) {
      score += 0.1 // Acceptable discard
    } else {
      score -= 0.2 // Wasteful
    }

    // Signal strength to partner
    const signalValue = this.calculateSignalValue(card, context)
    score += signalValue

    return score
  }

  private evaluateCompetitive(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    let score = 0.0

    if (this.canCardWinTrick(card, context)) {
      const trickValue = this.calculateTrickValue(context)
      const costBenefit = (trickValue - cardInfo.points) / 20
      score += costBenefit
    }

    return score
  }

  private evaluateCommunication(_card: Card, _context: AIContext): number {
    // Simplified communication evaluation
    // In a full implementation, this would analyze conventional signals
    return 0.0
  }

  private evaluateDefensive(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    let score = 0.0

    // Prevent opponent scoring
    const opponentThreat = this.assessOpponentThreat(context)
    if (opponentThreat.high && cardInfo.isTrump) {
      score += 0.15
    }

    return score
  }

  private evaluateCardRetention(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    let score = 0.0

    // Value of keeping this card for later
    if (cardInfo.isJackOfTrump) {
      score -= 0.1 // High retention value
    } else if (cardInfo.isTrump && cardInfo.isHighValue) {
      score -= 0.05 // Medium retention value
    }

    return score
  }

  private evaluateFutureOpportunities(_card: Card, _context: AIContext): number {
    // Analyze what opportunities this play creates/destroys
    return 0.0 // Simplified for now
  }

  private evaluateOpponentConstraints(_card: Card, _context: AIContext): number {
    // Analyze how this play constrains opponents
    return 0.0 // Simplified for now
  }

  private evaluateCloseGameStrategy(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    let score = 0.0

    // In close games, every point matters
    if (cardInfo.isHighValue) {
      score += 0.1
    }

    return score
  }

  private evaluateCardDistribution(_card: Card, _context: AIContext): number {
    // Simplified card counting
    return 0.0
  }

  private evaluateOpponentBehavior(_card: Card, _context: AIContext): number {
    // Simplified opponent modeling
    return 0.0
  }

  // Helper methods
  private analyzeTrumpSituation(context: AIContext) {
    const trumpCards = context.player.hand.getTrumpCards(context.trumpSuit)
    const jackOfTrump = trumpCards.find(c => c.isJackOfTrump(context.trumpSuit))
    
    return {
      trumpCount: trumpCards.length,
      hasJack: !!jackOfTrump,
      shouldLeadTrump: trumpCards.length >= 4 || !!jackOfTrump,
    }
  }

  private analyzeSuitStrength(suit: Suit, context: AIContext) {
    const suitCards = context.player.hand.getCardsOfSuit(suit)
    const highCards = suitCards.filter(c => c.getPoints(context.trumpSuit) >= 10)
    
    return {
      cardCount: suitCards.length,
      strength: highCards.length / Math.max(1, suitCards.length),
      leadershipValue: highCards.length >= 2 ? 0.1 : -0.05,
    }
  }

  private calculateWinEfficiency(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    const trickValue = this.calculateTrickValue(context)
    
    if (trickValue === 0) return 0.1 // Any win is good for 0-point trick
    
    return Math.min(0.3, trickValue / cardInfo.points)
  }

  private calculateSacrificeValue(card: Card, context: AIContext): number {
    const cardInfo = this.getCardInfo(card, context)
    
    // Low-value sacrifice is better
    return Math.max(0.0, 0.2 - cardInfo.points / 20)
  }

  private calculateTrickValue(context: AIContext): number {
    return context.currentTrick.getTotalPoints()
  }

  private calculateSignalValue(_card: Card, _context: AIContext): number {
    // Simplified signaling
    return 0.0
  }

  private assessOpponentThreat(context: AIContext) {
    const trickValue = this.calculateTrickValue(context)
    
    return {
      high: trickValue >= 15,
      medium: trickValue >= 10,
      low: trickValue < 10,
    }
  }

  private analyzeGameState(context: AIContext) {
    const { gameState } = context
    const nsScore = gameState.getTeamScore(Team.NS)?.gameScore || 0
    const ewScore = gameState.getTeamScore(Team.EW)?.gameScore || 0
    const target = gameState.settings.targetScore
    
    return {
      isCloseGame: Math.abs(nsScore - ewScore) < 100,
      isNearEnd: Math.max(nsScore, ewScore) > target * 0.8,
    }
  }

  protected evaluateCard(card: Card, context: AIContext): number {
    return this.evaluateImmediate(card, context)
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

  private generateChampionReasoning(
    cardEval: { card: Card; score: number; scores: any },
    context: AIContext
  ): string {
    const { card } = cardEval
    const cardInfo = this.getCardInfo(card, context)
    const trickInfo = this.analyzeTrick(context)

    // Generate sophisticated reasoning
    if (trickInfo.isEmpty) {
      if (cardInfo.isTrump && cardInfo.isJackOfTrump) {
        return 'Entame maîtresse au valet d\'atout'
      } else if (cardInfo.isHighValue) {
        return 'Entame forcing calculée'
      } else {
        return 'Entame technique optimale'
      }
    }

    if (trickInfo.isPartnerWinning) {
      if (cardInfo.points <= 2) {
        return 'Défausse parfaite, partenaire maître'
      } else {
        return 'Soutien stratégique optimisé'
      }
    }

    if (this.canCardWinTrick(card, context)) {
      const efficiency = this.calculateWinEfficiency(card, context)
      if (efficiency > 0.2) {
        return 'Prise optimale, excellent rapport'
      } else {
        return 'Prise nécessaire calculée'
      }
    }

    return 'Coup de champion analysé'
  }
}