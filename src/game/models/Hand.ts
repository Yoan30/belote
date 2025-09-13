import { Card } from ''
import { Suit, Rank } from ''

export class Hand {
  private cards: Card[]

  constructor(cards: Card[] = []) {
    this.cards = [...cards]
  }

  /**
   * Add a card to the hand
   */
  public addCard(card: Card): void {
    this.cards.push(card)
  }

  /**
   * Add multiple cards to the hand
   */
  public addCards(cards: Card[]): void {
    this.cards.push(...cards)
  }

  /**
   * Remove and return a specific card
   * @param cardToRemove - The card to remove
   * @returns The removed card, or undefined if not found
   */
  public removeCard(cardToRemove: Card): Card | undefined {
    const index = this.cards.findIndex(card => card.id === cardToRemove.id)
    if (index !== -1) {
      return this.cards.splice(index, 1)[0]
    }
    return undefined
  }

  /**
   * Check if hand contains a specific card
   */
  public hasCard(card: Card): boolean {
    return this.cards.some(c => c.id === card.id)
  }

  /**
   * Get all cards in the hand
   */
  public getCards(): Card[] {
    return [...this.cards]
  }

  /**
   * Get cards of a specific suit
   */
  public getCardsOfSuit(suit: Suit): Card[] {
    return this.cards.filter(card => card.suit === suit)
  }

  /**
   * Get trump cards
   */
  public getTrumpCards(trumpSuit: Suit): Card[] {
    return this.cards.filter(card => card.isTrump(trumpSuit))
  }

  /**
   * Get non-trump cards
   */
  public getNonTrumpCards(trumpSuit: Suit): Card[] {
    return this.cards.filter(card => !card.isTrump(trumpSuit))
  }

  /**
   * Check if hand has King and Queen of trump (Belote)
   */
  public hasBelote(trumpSuit: Suit): boolean {
    const trumpCards = this.getTrumpCards(trumpSuit)
    const hasKing = trumpCards.some(card => card.rank === Rank.KING)
    const hasQueen = trumpCards.some(card => card.rank === Rank.QUEEN)
    return hasKing && hasQueen
  }

  /**
   * Get Belote cards (King and Queen of trump) if present
   */
  public getBeloteCards(trumpSuit: Suit): Card[] {
    if (!this.hasBelote(trumpSuit)) {
      return []
    }
    
    const trumpCards = this.getTrumpCards(trumpSuit)
    return trumpCards.filter(card => 
      card.rank === Rank.KING || card.rank === Rank.QUEEN
    )
  }

  /**
   * Check if hand can follow suit
   */
  public canFollowSuit(leadSuit: Suit): boolean {
    return this.cards.some(card => card.suit === leadSuit)
  }

  /**
   * Get valid cards that can follow suit
   */
  public getCardsFollowingSuit(leadSuit: Suit): Card[] {
    return this.cards.filter(card => card.suit === leadSuit)
  }

  /**
   * Check if hand has any trump cards
   */
  public hasTrump(trumpSuit: Suit): boolean {
    return this.cards.some(card => card.isTrump(trumpSuit))
  }

  /**
   * Get the highest trump card in hand
   */
  public getHighestTrump(trumpSuit: Suit): Card | undefined {
    const trumpCards = this.getTrumpCards(trumpSuit)
    if (trumpCards.length === 0) {
      return undefined
    }

    return trumpCards.reduce((highest, card) => 
      card.getOrder(trumpSuit) > highest.getOrder(trumpSuit) ? card : highest
    )
  }

  /**
   * Get the lowest card in hand (for discarding)
   */
  public getLowestCard(trumpSuit: Suit): Card | undefined {
    if (this.cards.length === 0) {
      return undefined
    }

    return this.cards.reduce((lowest, card) => {
      const lowestPoints = lowest.getPoints(trumpSuit)
      const cardPoints = card.getPoints(trumpSuit)
      
      // Prefer non-trump over trump when points are equal
      if (lowestPoints === cardPoints) {
        if (lowest.isTrump(trumpSuit) && !card.isTrump(trumpSuit)) {
          return card
        }
        return lowest
      }
      
      return cardPoints < lowestPoints ? card : lowest
    })
  }

  /**
   * Get number of cards in hand
   */
  public size(): number {
    return this.cards.length
  }

  /**
   * Check if hand is empty
   */
  public isEmpty(): boolean {
    return this.cards.length === 0
  }

  /**
   * Sort cards by suit and rank
   */
  public sort(trumpSuit: Suit): void {
    this.cards.sort((a, b) => {
      // Trump cards come first
      if (a.isTrump(trumpSuit) && !b.isTrump(trumpSuit)) {
        return -1
      }
      if (!a.isTrump(trumpSuit) && b.isTrump(trumpSuit)) {
        return 1
      }

      // Within same trump status, sort by suit then by order
      if (a.suit !== b.suit) {
        return a.suit.localeCompare(b.suit)
      }

      // Same suit - sort by playing order
      return b.getOrder(trumpSuit) - a.getOrder(trumpSuit)
    })
  }

  /**
   * Get total points in hand
   */
  public getTotalPoints(trumpSuit: Suit): number {
    return this.cards.reduce((total, card) => total + card.getPoints(trumpSuit), 0)
  }

  /**
   * Clear all cards from hand
   */
  public clear(): void {
    this.cards = []
  }

  /**
   * Create a copy of this hand
   */
  public clone(): Hand {
    return new Hand(this.cards)
  }
}
