import { Deck } from './Deck'
import { Player } from './Player'
import { Trick } from './Trick'
import { TeamScore, Position, Suit, Team, type RoundId, type TrickId } from './Types'
export class Round {
  public readonly id: RoundId
  public readonly roundNumber: number
  public readonly trumpSuit: Suit
  public readonly players: Map<Position, Player>
  public readonly teamScores: Map<Team, TeamScore>
  private deck: Deck
  private tricks: Trick[]
  private currentTrickIndex: number
  private completed: boolean

  constructor(
    id: RoundId,
    roundNumber: number,
    trumpSuit: Suit,
    players: Map<Position, Player>
  ) {
    this.id = id
    this.roundNumber = roundNumber
    this.trumpSuit = trumpSuit
    this.players = new Map(players)
    this.teamScores = new Map([
      [Team.NS, new TeamScore(Team.NS)],
      [Team.EW, new TeamScore(Team.EW)],
    ])
    this.deck = new Deck()
    this.tricks = []
    this.currentTrickIndex = 0
    this.completed = false
  }

  /**
   * Deal cards to all players
   */
  public dealCards(randomFn: () => number): void {
    // Shuffle deck
    this.deck.shuffle(randomFn)

    // Deal 8 cards to each player (standard Belote)
    for (const player of this.players.values()) {
      const cards = this.deck.deal(8)
      player.hand.addCards(cards)
      player.hand.sort(this.trumpSuit)
    }
  }

  /**
   * Start a new trick
   */
  public startTrick(leader: Position): Trick {
    if (this.completed) {
      throw new Error('Cannot start trick in completed round')
    }

    const trickNumber = this.tricks.length + 1
    const trickId = `${this.id}_trick_${trickNumber}` as TrickId
    const trick = new Trick(trickId, trickNumber, leader, this.trumpSuit)
    
    this.tricks.push(trick)
    this.currentTrickIndex = this.tricks.length - 1

    return trick
  }

  /**
   * Get the current trick
   */
  public getCurrentTrick(): Trick | null {
    if (this.currentTrickIndex < 0 || this.currentTrickIndex >= this.tricks.length) {
      return null
    }
    return this.tricks[this.currentTrickIndex] || null
  }

  /**
   * Get a specific trick by index
   */
  public getTrick(index: number): Trick | null {
    if (index < 0 || index >= this.tricks.length) {
      return null
    }
    return this.tricks[index] || null
  }

  /**
   * Get all tricks
   */
  public getTricks(): Trick[] {
    return [...this.tricks]
  }

  /**
   * Get all completed tricks
   */
  public getCompletedTricks(): Trick[] {
    return this.tricks.filter(trick => trick.isCompleted())
  }

  /**
   * Check if round is completed (all 8 tricks played)
   */
  public isCompleted(): boolean {
    return this.completed || (this.tricks.length === 8 && this.tricks.every(trick => trick.isCompleted()))
  }

  /**
   * Finalize the round and calculate scores
   */
  public finalizeRound(): void {
    if (this.completed) {
      return
    }

    // Calculate card points for each team
    for (const trick of this.getCompletedTricks()) {
      const winner = trick.getWinner()
      if (winner) {
        const player = this.players.get(winner)
        if (player) {
          const teamScore = this.teamScores.get(player.team)
          if (teamScore) {
            teamScore.addCardPoints(trick.getTotalPoints())
          }
        }
      }
    }

    // Add last trick bonus (10 points) to winner of last trick
    const lastTrick = this.tricks[this.tricks.length - 1]
    if (lastTrick?.isCompleted()) {
      const lastTrickWinner = lastTrick.getWinner()
      if (lastTrickWinner) {
        const player = this.players.get(lastTrickWinner)
        if (player) {
          const teamScore = this.teamScores.get(player.team)
          if (teamScore) {
            teamScore.addLastTrickBonus()
          }
        }
      }
    }

    // Add Belote bonuses
    for (const player of this.players.values()) {
      if (player.hasCompleteBelote()) {
        const teamScore = this.teamScores.get(player.team)
        if (teamScore) {
          teamScore.addBeloteBonus()
        }
      }
    }

    this.completed = true
  }

  /**
   * Get team score
   */
  public getTeamScore(team: Team): TeamScore | undefined {
    return this.teamScores.get(team)
  }

  /**
   * Get player by position
   */
  public getPlayer(position: Position): Player | undefined {
    return this.players.get(position)
  }

  /**
   * Get all players
   */
  public getAllPlayers(): Player[] {
    return Array.from(this.players.values())
  }

  /**
   * Check if a player has announced Belote/Rebelote
   */
  public checkBeloteAnnouncement(position: Position, playedCard: any): void {
    const player = this.players.get(position)
    if (!player) {
      return
    }

    // Check if player has King and Queen of trump
    if (!player.hand.hasBelote(this.trumpSuit)) {
      return
    }

    // Check if the played card is King or Queen of trump
    const isKingOfTrump = playedCard.suit === this.trumpSuit && playedCard.rank === 'king'
    const isQueenOfTrump = playedCard.suit === this.trumpSuit && playedCard.rank === 'queen'

    if (isKingOfTrump || isQueenOfTrump) {
      if (!player.beloteAnnounced) {
        player.announceBelote()
      } else if (!player.rebeloteAnnounced) {
        player.announceRebelote()
      }
    }
  }

  /**
   * Get the next trick leader (winner of current trick)
   */
  public getNextTrickLeader(): Position | null {
    const currentTrick = this.getCurrentTrick()
    return currentTrick?.getWinner() || null
  }

  /**
   * Get round statistics
   */
  public getStats() {
    return {
      tricksPlayed: this.tricks.length,
      tricksCompleted: this.getCompletedTricks().length,
      totalPoints: this.tricks.reduce((sum, trick) => sum + trick.getTotalPoints(), 0),
      completed: this.isCompleted(),
    }
  }

  /**
   * Create a summary of the round
   */
  public toString(): string {
    const nsScore = this.teamScores.get(Team.NS)
    const ewScore = this.teamScores.get(Team.EW)
    return `Round ${this.roundNumber} (Trump: ${this.trumpSuit}) - NS: ${nsScore?.getRoundTotal() || 0}, EW: ${ewScore?.getRoundTotal() || 0}`
  }
}


