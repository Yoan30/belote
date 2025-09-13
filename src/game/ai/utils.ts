import { Card } from ''
import { Rank, Suit } from ''

/**
 * Utility functions for AI implementations
 */

/**
 * Calculate relative card strength (0.0 to 1.0)
 * @param card - The card to evaluate
 * @param trumpSuit - The trump suit
 * @returns Normalized strength value
 */
export function calculateCardStrength(card: Card, trumpSuit: Suit): number {
  const points = card.getPoints(trumpSuit)
  const maxPoints = 20 // Jack of trump is highest at 20 points
  return points / maxPoints
}

/**
 * Get cards that are guaranteed to win tricks
 * @param hand - Player's hand
 * @param trumpSuit - The trump suit
 * @returns Array of guaranteed winning cards
 */
export function getGuaranteedWinners(hand: Card[], trumpSuit: Suit): Card[] {
  const winners: Card[] = []
  
  // Jack of trump is always a winner
  const jackOfTrump = hand.find(card => card.isJackOfTrump(trumpSuit))
  if (jackOfTrump) {
    winners.push(jackOfTrump)
  }
  
  // Nine of trump is usually a winner (simplified assumption)
  const nineOfTrump = hand.find(card => card.isNineOfTrump(trumpSuit))
  if (nineOfTrump) {
    winners.push(nineOfTrump)
  }
  
  return winners
}

/**
 * Estimate the minimum number of tricks this hand should win
 * @param hand - Player's hand
 * @param trumpSuit - The trump suit
 * @returns Estimated minimum tricks
 */
export function estimateMinimumTricks(hand: Card[], trumpSuit: Suit): number {
  let tricks = 0
  
  // Count guaranteed winners
  tricks += getGuaranteedWinners(hand, trumpSuit).length
  
  // Count likely winners (high trumps)
  const trumpCards = hand.filter(card => card.isTrump(trumpSuit))
  const highTrumps = trumpCards.filter(card => card.getOrder(trumpSuit) >= 6)
  tricks += Math.floor(highTrumps.length / 2) // Conservative estimate
  
  // Count high non-trump cards
  const nonTrumpCards = hand.filter(card => !card.isTrump(trumpSuit))
  const aces = nonTrumpCards.filter(card => card.rank === Rank.ACE)
  tricks += Math.floor(aces.length / 2) // Aces might win
  
  return Math.min(tricks, 8) // Can't win more than 8 tricks
}

/**
 * Calculate the defensive value of a card (how much it prevents opponents from scoring)
 * @param card - The card to evaluate
 * @param trumpSuit - The trump suit
 * @returns Defensive value (0.0 to 1.0)
 */
export function calculateDefensiveValue(card: Card, trumpSuit: Suit): number {
  let value = 0.0
  
  // Trump cards have high defensive value
  if (card.isTrump(trumpSuit)) {
    value += 0.3
    if (card.isJackOfTrump(trumpSuit)) {
      value += 0.5 // Jack can stop any play
    } else if (card.isNineOfTrump(trumpSuit)) {
      value += 0.3
    }
  }
  
  // High non-trump cards can force trump usage
  if (!card.isTrump(trumpSuit) && card.getPoints(trumpSuit) >= 10) {
    value += 0.2
  }
  
  return Math.min(1.0, value)
}

/**
 * Calculate offensive value (ability to win tricks and score points)
 * @param card - The card to evaluate
 * @param trumpSuit - The trump suit
 * @returns Offensive value (0.0 to 1.0)
 */
export function calculateOffensiveValue(card: Card, trumpSuit: Suit): number {
  let value = 0.0
  
  // Point value contributes to offense
  value += card.getPoints(trumpSuit) / 20
  
  // Playing order contributes to winning ability
  value += card.getOrder(trumpSuit) / 8
  
  // Trump cards have bonus offensive value
  if (card.isTrump(trumpSuit)) {
    value += 0.2
  }
  
  return Math.min(1.0, value)
}

/**
 * Analyze suit distribution in a hand
 * @param hand - Player's hand
 * @param trumpSuit - The trump suit
 * @returns Suit distribution analysis
 */
export function analyzeSuitDistribution(hand: Card[], trumpSuit: Suit) {
  const distribution = {
    [Suit.SPADES]: 0,
    [Suit.HEARTS]: 0,
    [Suit.DIAMONDS]: 0,
    [Suit.CLUBS]: 0,
  }
  
  const suitStrengths = {
    [Suit.SPADES]: 0,
    [Suit.HEARTS]: 0,
    [Suit.DIAMONDS]: 0,
    [Suit.CLUBS]: 0,
  }
  
  for (const card of hand) {
    distribution[card.suit]++
    suitStrengths[card.suit] += card.getPoints(trumpSuit)
  }
  
  // Find longest and strongest suits
  const suits = Object.values(Suit)
  const longestSuit = suits.reduce((longest, suit) => 
    distribution[suit] > distribution[longest] ? suit : longest
  )
  
  const strongestSuit = suits.reduce((strongest, suit) => 
    suitStrengths[suit] > suitStrengths[strongest] ? suit : strongest
  )
  
  return {
    distribution,
    suitStrengths,
    longestSuit,
    strongestSuit,
    trumpCount: distribution[trumpSuit],
    hasVoid: suits.some(suit => suit !== trumpSuit && distribution[suit] === 0),
    hasSingleton: suits.some(suit => suit !== trumpSuit && distribution[suit] === 1),
  }
}

/**
 * Calculate synergy between cards (how well they work together)
 * @param cards - Array of cards to analyze
 * @param trumpSuit - The trump suit
 * @returns Synergy score (0.0 to 1.0)
 */
export function calculateCardSynergy(cards: Card[], trumpSuit: Suit): number {
  if (cards.length < 2) {
    return 0.0
  }
  
  let synergy = 0.0
  
  // Same suit synergy
  const suitGroups = new Map<Suit, Card[]>()
  for (const card of cards) {
    if (!suitGroups.has(card.suit)) {
      suitGroups.set(card.suit, [])
    }
    suitGroups.get(card.suit)!.push(card)
  }
  
  for (const [_suit, suitCards] of suitGroups) {
    if (suitCards.length >= 2) {
      synergy += 0.1 * suitCards.length // Bonus for suit length
      
      // Sequential card bonus
      // Could add logic for sequential cards here if needed
    }
  }
  
  // Trump synergy
  const trumpCards = cards.filter(c => c.isTrump(trumpSuit))
  if (trumpCards.length >= 3) {
    synergy += 0.2 // Good trump holding
  }
  
  return Math.min(1.0, synergy)
}

/**
 * Estimate card location probability (simplified card counting)
 * @param card - The card to locate
 * @param knownCards - Cards that are known to be played/seen
 * @param remainingPlayers - Number of remaining players who could have the card
 * @returns Probability that a specific opponent has the card
 */
export function estimateCardLocation(
  card: Card,
  knownCards: Card[],
  remainingPlayers: number
): number {
  // Check if card is already known
  const isKnown = knownCards.some(known => known.id === card.id)
  if (isKnown) {
    return 0.0 // Card is already played
  }
  
  // Equal probability among remaining players
  return 1.0 / remainingPlayers
}

/**
 * Calculate the expected value of playing a card
 * @param card - The card to evaluate
 * @param tricksRemaining - Number of tricks remaining in the round
 * @param trumpSuit - The trump suit
 * @returns Expected value
 */
export function calculateExpectedValue(
  card: Card,
  tricksRemaining: number,
  trumpSuit: Suit
): number {
  const immediate = card.getPoints(trumpSuit)
  const defensive = calculateDefensiveValue(card, trumpSuit) * 10
  const offensive = calculateOffensiveValue(card, trumpSuit) * 10
  
  // Weight factors based on tricks remaining
  const immediateWeight = 1.0
  const futureWeight = tricksRemaining / 8.0
  
  return immediate * immediateWeight + (defensive + offensive) * futureWeight
}

/**
 * Determine optimal card order for leading
 * @param hand - Player's hand
 * @param trumpSuit - The trump suit
 * @returns Cards sorted by leading preference
 */
export function getOptimalLeadingOrder(hand: Card[], trumpSuit: Suit): Card[] {
  return hand.slice().sort((a, b) => {
    const aValue = calculateLeadingValue(a, trumpSuit)
    const bValue = calculateLeadingValue(b, trumpSuit)
    return bValue - aValue
  })
}

/**
 * Calculate how good a card is for leading
 * @param card - The card to evaluate
 * @param trumpSuit - The trump suit
 * @returns Leading value
 */
function calculateLeadingValue(card: Card, trumpSuit: Suit): number {
  let value = 0.0
  
  // Medium-value cards are often good leads
  const points = card.getPoints(trumpSuit)
  if (points >= 4 && points <= 10) {
    value += 0.3
  }
  
  // High trump cards can be good aggressive leads
  if (card.isTrump(trumpSuit) && points >= 11) {
    value += 0.4
  }
  
  // Avoid leading with very low or very high non-trump
  if (!card.isTrump(trumpSuit)) {
    if (points <= 2) {
      value -= 0.2 // Too weak
    } else if (points >= 11) {
      value -= 0.1 // Too valuable to lead
    }
  }
  
  return value
}
