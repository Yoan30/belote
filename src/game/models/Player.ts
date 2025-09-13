import { Hand } from ''
import { Position, Team, AILevel, type PlayerId } from ''

export class Player {
  public readonly id: PlayerId
  public readonly position: Position
  public readonly team: Team
  public readonly name: string
  public readonly isHuman: boolean
  public readonly aiLevel: AILevel | undefined
  public hand: Hand
  public score: number
  public beloteAnnounced: boolean
  public rebeloteAnnounced: boolean

  constructor(
    id: PlayerId,
    position: Position,
    name: string,
    isHuman: boolean = false,
    aiLevel: AILevel | undefined = undefined
  ) {
    this.id = id
    this.position = position
    this.name = name
    this.isHuman = isHuman
    this.aiLevel = aiLevel
    this.hand = new Hand()
    this.score = 0
    this.beloteAnnounced = false
    this.rebeloteAnnounced = false

    // Determine team based on position
    this.team = (position === Position.NORTH || position === Position.SOUTH) ? Team.NS : Team.EW
  }

  /**
   * Get the player's partner
   */
  public getPartnerPosition(): Position {
    switch (this.position) {
      case Position.NORTH:
        return Position.SOUTH
      case Position.SOUTH:
        return Position.NORTH
      case Position.EAST:
        return Position.WEST
      case Position.WEST:
        return Position.EAST
    }
  }

  /**
   * Get opponent positions
   */
  public getOpponentPositions(): Position[] {
    switch (this.position) {
      case Position.NORTH:
        return [Position.EAST, Position.WEST]
      case Position.SOUTH:
        return [Position.EAST, Position.WEST]
      case Position.EAST:
        return [Position.NORTH, Position.SOUTH]
      case Position.WEST:
        return [Position.NORTH, Position.SOUTH]
    }
  }

  /**
   * Check if this player is on the same team as another position
   */
  public isTeammate(otherPosition: Position): boolean {
    return this.getPartnerPosition() === otherPosition
  }

  /**
   * Check if this player is an opponent of another position
   */
  public isOpponent(otherPosition: Position): boolean {
    return this.getOpponentPositions().includes(otherPosition)
  }

  /**
   * Reset player state for a new round
   */
  public resetForNewRound(): void {
    this.hand.clear()
    this.beloteAnnounced = false
    this.rebeloteAnnounced = false
  }

  /**
   * Reset player state for a new game
   */
  public resetForNewGame(): void {
    this.resetForNewRound()
    this.score = 0
  }

  /**
   * Add points to player's score
   */
  public addScore(points: number): void {
    this.score += points
  }

  /**
   * Announce Belote (when playing King or Queen of trump first)
   */
  public announceBelote(): void {
    this.beloteAnnounced = true
  }

  /**
   * Announce Rebelote (when playing the second of King/Queen of trump)
   */
  public announceRebelote(): void {
    this.rebeloteAnnounced = true
  }

  /**
   * Check if player has announced both Belote and Rebelote
   */
  public hasCompleteBelote(): boolean {
    return this.beloteAnnounced && this.rebeloteAnnounced
  }

  /**
   * Get display string for the player
   */
  public toString(): string {
    const typeStr = this.isHuman ? 'Human' : `AI(${this.aiLevel || 'unknown'})`
    return `${this.name} (${this.position}, ${typeStr})`
  }

  /**
   * Create a human player
   */
  public static createHuman(id: PlayerId, position: Position, name: string): Player {
    return new Player(id, position, name, true)
  }

  /**
   * Create an AI player
   */
  public static createAI(
    id: PlayerId,
    position: Position,
    name: string,
    aiLevel: AILevel
  ): Player {
    return new Player(id, position, name, false, aiLevel)
  }
}
