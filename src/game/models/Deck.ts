import { Card } from './Card'
import { Suit, Rank } from './Types'
export class Deck {
  private cards: Card[]

  constructor() {
    this.cards = []
    this.initialize()
  }

  /**
   * Initialize a standard 32-card Belote deck
   */
  private initialize(): void {
    this.cards = []
    
    // Create all 32 cards (8 ranks Ã— 4 suits)
    for (const suit of Object.values(Suit)) {
      for (const rank of Object.values(Rank)) {
        this.cards.push(new Card(suit, rank))
      }
    }
  }

  /**
   * Shuffle the deck using provided random function
   * @param randomFn - Random function that returns 0-1
   */
  public shuffle(randomFn: () => number): void {
    // Fisher-Yates shuffle algorithm
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(randomFn() * (i + 1))
      const temp = this.cards[i]!
      const cardJ = this.cards[j]!
      this.cards[i] = cardJ
      this.cards[j] = temp
    }
  }

  /**
   * Deal cards to players
   * @param numCards - Number of cards to deal
   * @returns Array of dealt cards
   */
  public deal(numCards: number): Card[] {
    if (numCards > this.cards.length) {
      throw new Error(`Cannot deal ${numCards} cards, only ${this.cards.length} remaining`)
    }

    return this.cards.splice(0, numCards)
  }

  /**
   * Get remaining card count
   */
  public size(): number {
    return this.cards.length
  }

  /**
   * Check if deck is empty
   */
  public isEmpty(): boolean {
    return this.cards.length === 0
  }

  /**
   * Reset deck to full 32 cards
   */
  public reset(): void {
    this.initialize()
  }

  /**
   * Get a copy of all cards (for debugging)
   */
  public getCards(): Card[] {
    return [...this.cards]
  }

  /**
   * Get total points in the deck (should be 152 for a full Belote deck)
   * @param trumpSuit - Trump suit for scoring
   * @returns Total points
   */
  public getTotalPoints(trumpSuit: Suit): number {
    return this.cards.reduce((total, card) => total + card.getPoints(trumpSuit), 0)
  }
}


