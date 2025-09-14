import { Suit, Rank, CardValue, type CardId } from './Types'
// Card values for scoring - normal (non-trump) and trump
const CARD_VALUES: Record<Rank, CardValue> = {
  [Rank.SEVEN]: { normal: 0, trump: 0, order: 1, trumpOrder: 1 },
  [Rank.EIGHT]: { normal: 0, trump: 0, order: 2, trumpOrder: 2 },
  [Rank.NINE]: { normal: 0, trump: 14, order: 3, trumpOrder: 7 },
  [Rank.TEN]: { normal: 10, trump: 10, order: 6, trumpOrder: 5 },
  [Rank.JACK]: { normal: 2, trump: 20, order: 4, trumpOrder: 8 },
  [Rank.QUEEN]: { normal: 3, trump: 3, order: 5, trumpOrder: 4 },
  [Rank.KING]: { normal: 4, trump: 4, order: 7, trumpOrder: 6 },
  [Rank.ACE]: { normal: 11, trump: 11, order: 8, trumpOrder: 7 },
}

export class Card {
  public readonly id: CardId
  public readonly suit: Suit
  public readonly rank: Rank

  constructor(suit: Suit, rank: Rank) {
    this.suit = suit
    this.rank = rank
    this.id = `${suit}_${rank}` as CardId
  }

  /**
   * Get the point value of this card
   * @param trumpSuit - The trump suit for this round
   * @returns The point value
   */
  public getPoints(trumpSuit: Suit): number {
    const values = CARD_VALUES[this.rank]
    return this.suit === trumpSuit ? values.trump : values.normal
  }

  /**
   * Get the playing order value (for trick comparison)
   * @param trumpSuit - The trump suit for this round
   * @returns The order value (higher = stronger)
   */
  public getOrder(trumpSuit: Suit): number {
    const values = CARD_VALUES[this.rank]
    return this.suit === trumpSuit ? values.trumpOrder : values.order
  }

  /**
   * Check if this card is trump
   * @param trumpSuit - The trump suit for this round
   * @returns True if this card is trump
   */
  public isTrump(trumpSuit: Suit): boolean {
    return this.suit === trumpSuit
  }

  /**
   * Check if this card is Jack of trump (highest card)
   * @param trumpSuit - The trump suit for this round
   * @returns True if this is Jack of trump
   */
  public isJackOfTrump(trumpSuit: Suit): boolean {
    return this.suit === trumpSuit && this.rank === Rank.JACK
  }

  /**
   * Check if this card is Nine of trump (second highest trump)
   * @param trumpSuit - The trump suit for this round
   * @returns True if this is Nine of trump
   */
  public isNineOfTrump(trumpSuit: Suit): boolean {
    return this.suit === trumpSuit && this.rank === Rank.NINE
  }

  /**
   * Check if this card can beat another card in a trick
   * @param other - The card to compare against
   * @param trumpSuit - The trump suit
   * @param leadSuit - The suit that was led in this trick
   * @returns True if this card beats the other
   */
  public beats(other: Card, trumpSuit: Suit, leadSuit: Suit): boolean {
    // Trump always beats non-trump
    if (this.isTrump(trumpSuit) && !other.isTrump(trumpSuit)) {
      return true
    }
    
    // Non-trump cannot beat trump
    if (!this.isTrump(trumpSuit) && other.isTrump(trumpSuit)) {
      return false
    }

    // Both trump - compare trump order
    if (this.isTrump(trumpSuit) && other.isTrump(trumpSuit)) {
      return this.getOrder(trumpSuit) > other.getOrder(trumpSuit)
    }

    // Both non-trump - must follow suit to beat
    if (this.suit !== leadSuit) {
      return false // Cannot beat if not following suit
    }
    if (other.suit !== leadSuit) {
      return true // Other card is not following suit, so we beat it
    }

    // Both following suit - compare normal order
    return this.getOrder(trumpSuit) > other.getOrder(trumpSuit)
  }

  /**
   * Get display name for the card
   */
  public toString(): string {
    return `${this.rank} of ${this.suit}`
  }

  /**
   * Create a card from its ID
   */
  public static fromId(id: CardId): Card {
    const [suitStr, rankStr] = id.split('_')
    const suit = suitStr as Suit
    const rank = rankStr as Rank
    return new Card(suit, rank)
  }
}



