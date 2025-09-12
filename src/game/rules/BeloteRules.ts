import { Card } from '../models/Card.js'
import { Hand } from '../models/Hand.js'
import { Trick } from '../models/Trick.js'
import { Suit, Position } from '../models/Types.js'

export class BeloteRules {
  /**
   * Get valid cards that can be played from a hand given the current trick state
   * @param hand - The player's hand
   * @param trick - The current trick
   * @param trumpSuit - The trump suit
   * @returns Array of valid cards that can be played
   */
  public static getValidCards(hand: Hand, trick: Trick, trumpSuit: Suit): Card[] {
    const handCards = hand.getCards()
    
    if (handCards.length === 0) {
      return []
    }

    // If trick is empty, any card can be played
    if (trick.isEmpty()) {
      return handCards
    }

    const leadSuit = trick.getLeadSuit()
    if (!leadSuit) {
      return handCards
    }

    // Try to follow suit first
    const suitCards = hand.getCardsFollowingSuit(leadSuit)
    if (suitCards.length > 0) {
      // Must follow suit if possible
      return suitCards
    }

    // Cannot follow suit - check if we must cut (play trump)
    const trumpCards = hand.getTrumpCards(trumpSuit)
    const nonTrumpCards = hand.getNonTrumpCards(trumpSuit)

    // If lead suit is trump, we cannot follow, so any card is valid
    if (leadSuit === trumpSuit) {
      return handCards
    }

    // Lead suit is not trump and we cannot follow
    // Check if partner is currently winning
    const isPartnerWinning = this.isPartnerCurrentlyWinning(trick, trumpSuit)

    if (isPartnerWinning) {
      // Partner is winning, we can play any card
      return handCards
    }

    // Partner is not winning - we must cut if we have trump
    if (trumpCards.length > 0) {
      // Check if we must overcut (play higher trump than highest trump in trick)
      const highestTrumpInTrick = this.getHighestTrumpInTrick(trick, trumpSuit)
      
      if (highestTrumpInTrick) {
        // Must overcut if possible
        const overcutCards = trumpCards.filter(card => 
          card.getOrder(trumpSuit) > highestTrumpInTrick.getOrder(trumpSuit)
        )
        
        if (overcutCards.length > 0) {
          return overcutCards
        } else {
          // Cannot overcut - must play any trump
          return trumpCards
        }
      } else {
        // No trump in trick yet - must play any trump
        return trumpCards
      }
    }

    // No trump cards - can play any non-trump card
    return nonTrumpCards
  }

  /**
   * Check if the partner of the current player is currently winning the trick
   */
  private static isPartnerCurrentlyWinning(trick: Trick, _trumpSuit: Suit): boolean {
    const currentWinner = trick.getWinner()
    if (!currentWinner) {
      return false
    }

    const plays = trick.getPlays()
    if (plays.length === 0) {
      return false
    }

    // Get the position that would play next
    const nextPlayer = trick.getNextPlayer()
    if (!nextPlayer) {
      return false
    }

    // Check if current winner is partner of next player
    return this.arePartners(currentWinner, nextPlayer)
  }

  /**
   * Check if two positions are partners
   */
  private static arePartners(pos1: Position, pos2: Position): boolean {
    return (
      (pos1 === Position.NORTH && pos2 === Position.SOUTH) ||
      (pos1 === Position.SOUTH && pos2 === Position.NORTH) ||
      (pos1 === Position.EAST && pos2 === Position.WEST) ||
      (pos1 === Position.WEST && pos2 === Position.EAST)
    )
  }

  /**
   * Get the highest trump card currently in the trick
   */
  private static getHighestTrumpInTrick(trick: Trick, trumpSuit: Suit): Card | null {
    const cards = trick.getAllCards()
    const trumpCards = cards.filter(card => card.isTrump(trumpSuit))
    
    if (trumpCards.length === 0) {
      return null
    }

    return trumpCards.reduce((highest, card) => 
      card.getOrder(trumpSuit) > highest.getOrder(trumpSuit) ? card : highest
    )
  }

  /**
   * Validate if a card play is legal
   * @param card - The card to play
   * @param hand - The player's hand
   * @param trick - The current trick
   * @param trumpSuit - The trump suit
   * @returns True if the play is valid
   */
  public static isValidPlay(card: Card, hand: Hand, trick: Trick, trumpSuit: Suit): boolean {
    if (!hand.hasCard(card)) {
      return false
    }

    const validCards = this.getValidCards(hand, trick, trumpSuit)
    return validCards.some(validCard => validCard.id === card.id)
  }

  /**
   * Check if a player must play trump (cut)
   * @param hand - The player's hand
   * @param trick - The current trick
   * @param trumpSuit - The trump suit
   * @returns True if player must cut
   */
  public static mustCut(hand: Hand, trick: Trick, trumpSuit: Suit): boolean {
    const leadSuit = trick.getLeadSuit()
    if (!leadSuit || leadSuit === trumpSuit) {
      return false
    }

    // Cannot follow suit
    if (hand.canFollowSuit(leadSuit)) {
      return false
    }

    // Check if partner is winning
    if (this.isPartnerCurrentlyWinning(trick, trumpSuit)) {
      return false
    }

    // Must cut if we have trump
    return hand.hasTrump(trumpSuit)
  }

  /**
   * Check if a player must overcut (play higher trump)
   * @param hand - The player's hand
   * @param trick - The current trick
   * @param trumpSuit - The trump suit
   * @returns True if player must overcut
   */
  public static mustOvercut(hand: Hand, trick: Trick, trumpSuit: Suit): boolean {
    if (!this.mustCut(hand, trick, trumpSuit)) {
      return false
    }

    const highestTrumpInTrick = this.getHighestTrumpInTrick(trick, trumpSuit)
    if (!highestTrumpInTrick) {
      return false
    }

    const trumpCards = hand.getTrumpCards(trumpSuit)
    return trumpCards.some(card => 
      card.getOrder(trumpSuit) > highestTrumpInTrick.getOrder(trumpSuit)
    )
  }

  /**
   * Check if a Belote can be announced
   * @param card - The card being played
   * @param hand - The player's hand
   * @param trumpSuit - The trump suit
   * @returns 'belote', 'rebelote', or null
   */
  public static checkBeloteAnnouncement(card: Card, hand: Hand, trumpSuit: Suit): 'belote' | 'rebelote' | null {
    // Must be King or Queen of trump
    if (!card.isTrump(trumpSuit) || (card.rank !== 'king' && card.rank !== 'queen')) {
      return null
    }

    // Must have the other card (King or Queen) in hand or have played it previously
    if (!hand.hasBelote(trumpSuit)) {
      return null
    }

    // This is a simplified version - in a full implementation you'd track
    // whether belote was already announced
    return 'belote'
  }

  /**
   * Calculate card points for a set of cards
   * @param cards - The cards to calculate points for
   * @param trumpSuit - The trump suit
   * @returns Total points
   */
  public static calculateCardPoints(cards: Card[], trumpSuit: Suit): number {
    return cards.reduce((total, card) => total + card.getPoints(trumpSuit), 0)
  }

  /**
   * Determine the winner of a completed trick
   * @param trick - The completed trick
   * @param _trumpSuit - The trump suit
   * @returns The winning position
   */
  public static determineTrickWinner(trick: Trick, _trumpSuit: Suit): Position | null {
    if (!trick.isCompleted()) {
      return null
    }

    return trick.getWinner()
  }

  /**
   * Check if all cards in a deal have been played (end of round)
   * @param players - All players with their hands
   * @returns True if round is over
   */
  public static isRoundComplete(players: Map<Position, { hand: Hand }>): boolean {
    for (const player of players.values()) {
      if (!player.hand.isEmpty()) {
        return false
      }
    }
    return true
  }

  /**
   * Get the play order starting from a given position
   * @param startPosition - The starting position
   * @returns Array of positions in play order
   */
  public static getPlayOrder(startPosition: Position): Position[] {
    const positions = [Position.SOUTH, Position.WEST, Position.NORTH, Position.EAST]
    const startIndex = positions.indexOf(startPosition)
    
    const result: Position[] = []
    for (let i = 0; i < 4; i++) {
      const pos = positions[(startIndex + i) % 4]
      if (pos) {
        result.push(pos)
      }
    }
    
    return result
  }
}