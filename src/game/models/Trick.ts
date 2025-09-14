import { Card } from './Card'
import { Position, Suit, type TrickId } from './Types'
export interface TrickPlay {
  position: Position
  card: Card
  order: number // Play order within the trick (0-3)
}

export class Trick {
  public readonly id: TrickId
  public readonly trickNumber: number
  public readonly leader: Position
  public readonly trumpSuit: Suit
  private plays: TrickPlay[]
  private completed: boolean

  constructor(id: TrickId, trickNumber: number, leader: Position, trumpSuit: Suit) {
    this.id = id
    this.trickNumber = trickNumber
    this.leader = leader
    this.trumpSuit = trumpSuit
    this.plays = []
    this.completed = false
  }

  /**
   * Add a card play to the trick
   */
  public addPlay(position: Position, card: Card): void {
    if (this.completed) {
      throw new Error('Cannot add play to completed trick')
    }

    if (this.plays.length >= 4) {
      throw new Error('Trick already has 4 plays')
    }

    // Verify correct play order
    const expectedPosition = this.getNextPlayer()
    if (position !== expectedPosition) {
      throw new Error(`Expected play from ${expectedPosition}, got ${position}`)
    }

    const play: TrickPlay = {
      position,
      card,
      order: this.plays.length,
    }

    this.plays.push(play)

    // Mark as completed if this was the 4th play
    if (this.plays.length === 4) {
      this.completed = true
    }
  }

  /**
   * Get the next player to play in this trick
   */
  public getNextPlayer(): Position | null {
    if (this.completed) {
      return null
    }

    const positions = [Position.SOUTH, Position.WEST, Position.NORTH, Position.EAST]
    const leaderIndex = positions.indexOf(this.leader)
    const nextIndex = (leaderIndex + this.plays.length) % 4
    return positions[nextIndex] || null
  }

  /**
   * Get the lead suit (suit of the first card played)
   */
  public getLeadSuit(): Suit | null {
    if (this.plays.length > 0) {
      const firstPlay = this.plays[0]
      return firstPlay ? firstPlay.card.suit : null
    }
    return null
  }

  /**
   * Get all plays in the trick
   */
  public getPlays(): TrickPlay[] {
    return [...this.plays]
  }

  /**
   * Get the play by a specific position
   */
  public getPlayByPosition(position: Position): TrickPlay | undefined {
    return this.plays.find(play => play.position === position)
  }

  /**
   * Get the card played by a specific position
   */
  public getCardByPosition(position: Position): Card | undefined {
    const play = this.getPlayByPosition(position)
    return play?.card
  }

  /**
   * Determine the winner of the trick
   */
  public getWinner(): Position | null {
    if (!this.completed) {
      return null
    }

    const leadSuit = this.getLeadSuit()
    if (!leadSuit) {
      return null
    }

    let winningPlay = this.plays[0]
    if (!winningPlay) {
      return null
    }

    for (let i = 1; i < this.plays.length; i++) {
      const currentPlay = this.plays[i]
      if (currentPlay && currentPlay.card.beats(winningPlay.card, this.trumpSuit, leadSuit)) {
        winningPlay = currentPlay
      }
    }

    return winningPlay.position
  }

  /**
   * Get the winning card
   */
  public getWinningCard(): Card | null {
    const winner = this.getWinner()
    return winner ? this.getCardByPosition(winner) || null : null
  }

  /**
   * Calculate total points in this trick
   */
  public getTotalPoints(): number {
    return this.plays.reduce((total, play) => 
      total + play.card.getPoints(this.trumpSuit), 0
    )
  }

  /**
   * Check if trick is completed
   */
  public isCompleted(): boolean {
    return this.completed
  }

  /**
   * Check if trick is empty (no plays yet)
   */
  public isEmpty(): boolean {
    return this.plays.length === 0
  }

  /**
   * Get number of plays in the trick
   */
  public getPlayCount(): number {
    return this.plays.length
  }

  /**
   * Check if a position has already played in this trick
   */
  public hasPlayerPlayed(position: Position): boolean {
    return this.plays.some(play => play.position === position)
  }

  /**
   * Get all cards in the trick
   */
  public getAllCards(): Card[] {
    return this.plays.map(play => play.card)
  }

  /**
   * Get the positions that have played, in order
   */
  public getPlayedPositions(): Position[] {
    return this.plays.map(play => play.position)
  }

  /**
   * Create a string representation of the trick
   */
  public toString(): string {
    const playsStr = this.plays
      .map(play => `${play.position}: ${play.card.toString()}`)
      .join(', ')
    const winner = this.getWinner()
    const points = this.getTotalPoints()
    return `Trick ${this.trickNumber} (Leader: ${this.leader}): ${playsStr} | Winner: ${winner || 'TBD'} | Points: ${points}`
  }
}


