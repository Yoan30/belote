import { Round } from './Round';
import { Player } from './Player';
import { Position, Team, Phase, PlayerId, RoundId, Suit, GameSettings, ScoreData , AILevel} from './Types';
import { ScoreBoard } from './score/ScoreBoard';
export class GameState {
  public readonly gameId: string
  public readonly settings: GameSettings
  public readonly players: Map<Position, Player>
  public readonly teamScores: Map<Team, ScoreData>
  private rounds: Round[]
  private currentRoundIndex: number
  private phase: Phase
  private dealer: Position
  private currentPlayer: Position | null
  private gameCompleted: boolean
  private winner: Team | null

  constructor(gameId: string, settings: GameSettings) {
    this.gameId = gameId
    this.settings = { ...settings }
    this.players = new Map()
    this.teamScores = new Map([
      [Team.NS, new ScoreBoard(Team.NS)],
      [Team.EW, new ScoreBoard(Team.EW)],
    ])
    this.rounds = []
    this.currentRoundIndex = -1
    this.phase = Phase.DEALING
    this.dealer = Position.SOUTH // Start with human as dealer
    this.currentPlayer = null
    this.gameCompleted = false
    this.winner = null

    this.initializePlayers()
  }

  /**
   * Initialize players with AI levels
   */
  private initializePlayers(): void {
    // Human player (South)
    const human = Player.createHuman('human', Position.SOUTH, 'Vous')
    this.players.set(Position.SOUTH, human)

    // AI players
    const aiNames = ['Ordinateur 1', 'Ordinateur 2', 'Ordinateur 3']
    const aiPositions = [Position.WEST, Position.NORTH, Position.EAST]
    
    for (let i = 0; i < 3; i++) {
      const position = aiPositions[i]!
      const ai = Player.createAI(
        `ai_${i + 1}` as PlayerId,
        position,
        aiNames[i]!,
        (this.settings.aiLevel ?? AILevel.CONFIRME)
      )
      this.players.set(position, ai)
    }
  }

  /**
   * Start a new round
   */
  public startNewRound(): Round {
    const roundNumber = this.rounds.length + 1
    const roundId = `${this.gameId}_round_${roundNumber}` as RoundId
    
    // Reset players for new round
    for (const player of this.players.values()) {
      player.resetForNewRound()
    }

    const round = new Round(roundId, roundNumber, (this.settings.trump ?? Suit.SPADES), this.players)
    this.rounds.push(round)
    this.currentRoundIndex = this.rounds.length - 1
    this.phase = Phase.DEALING

    return round
  }

  /**
   * Get the current round
   */
  public getCurrentRound(): Round | null {
    if (this.currentRoundIndex < 0 || this.currentRoundIndex >= this.rounds.length) {
      return null
    }
    return this.rounds[this.currentRoundIndex] || null
  }

  /**
   * Get all rounds
   */
  public getRounds(): Round[] {
    return [...this.rounds]
  }

  /**
   * Get player by position
   */
  public getPlayer(position: Position): Player | undefined {
    return this.players.get(position)
  }

  /**
   * Get human player
   */
  public getHumanPlayer(): Player | undefined {
    return this.players.get(Position.SOUTH)
  }

  /**
   * Get AI players
   */
  public getAIPlayers(): Player[] {
    return [Position.WEST, Position.NORTH, Position.EAST]
      .map(pos => this.players.get(pos))
      .filter((player): player is Player => player !== undefined)
  }

  /**
   * Get all players
   */
  public getAllPlayers(): Player[] {
    return Array.from(this.players.values())
  }

  /**
   * Set the current phase
   */
  public setPhase(phase: Phase): void {
    this.phase = phase
  }

  /**
   * Get the current phase
   */
  public getPhase(): Phase {
    return this.phase
  }

  /**
   * Set the current player
   */
  public setCurrentPlayer(position: Position | null): void {
    this.currentPlayer = position
  }

  /**
   * Get the current player
   */
  public getCurrentPlayer(): Position | null {
    return this.currentPlayer
  }

  /**
   * Get the dealer position
   */
  public getDealer(): Position {
    return this.dealer
  }

  /**
   * Move dealer to next position (clockwise)
   */
  public nextDealer(): void {
    const positions = [Position.SOUTH, Position.WEST, Position.NORTH, Position.EAST]
    const currentIndex = positions.indexOf(this.dealer)
    const nextPosition = positions[(currentIndex + 1) % 4]
    if (nextPosition) {
      this.dealer = nextPosition
    }
  }

  /**
   * Get team score
   */
  public getTeamScore(team: Team): ScoreData | undefined {
    return this.teamScores.get(team)
  }

  /**
   * Update team scores from completed round
   */
  public updateScoresFromRound(round: Round): void {
    for (const team of [Team.NS, Team.EW]) {
      const roundTeamScore = round.getTeamScore(team)
      const gameTeamScore = this.teamScores.get(team)
      
      if (roundTeamScore && gameTeamScore) {
        roundTeamScore.finalizeRound?.(); const scoreData: any = roundTeamScore
        gameTeamScore.gameScore += (scoreData.total ?? 0)
      }
    }

    // Check for game end
    this.checkGameEnd()
  }

  /**
   * Check if the game has ended
   */
  private checkGameEnd(): void {
    for (const [team, ScoreData] of this.teamScores) {
      if (ScoreData.hasWon?.(this.settings.targetScore)) {
        this.gameCompleted = true
        this.winner = team
        this.phase = Phase.FINISHED
        break
      }
    }
  }

  /**
   * Check if game is completed
   */
  public isGameCompleted(): boolean {
    return this.gameCompleted
  }

  /**
   * Get the winning team
   */
  public getWinner(): Team | null {
    return this.winner
  }

  /**
   * Get next position clockwise
   */
  public getNextPosition(position: Position): Position {
    const positions = [Position.SOUTH, Position.WEST, Position.NORTH, Position.EAST]
    const currentIndex = positions.indexOf(position)
    const nextPosition = positions[(currentIndex + 1) % 4]
    return nextPosition || Position.SOUTH
  }

  /**
   * Get previous position (counter-clockwise)
   */
  public getPreviousPosition(position: Position): Position {
    const positions = [Position.SOUTH, Position.WEST, Position.NORTH, Position.EAST]
    const currentIndex = positions.indexOf(position)
    const prevPosition = positions[(currentIndex + 3) % 4]
    return prevPosition || Position.SOUTH
  }

  /**
   * Reset game to initial state
   */
  public resetGame(): void {
    // Reset team scores
    for (const ScoreData of this.teamScores.values()) {
      ScoreData.resetGame?.()
    }

    // Reset players
    for (const player of this.players.values()) {
      player.resetForNewGame()
    }

    // Reset game state
    this.rounds = []
    this.currentRoundIndex = -1
    this.phase = Phase.DEALING
    this.dealer = Position.SOUTH
    this.currentPlayer = null
    this.gameCompleted = false
    this.winner = null
  }

  /**
   * Get game statistics
   */
  public getGameStats() {
    const nsScore = this.teamScores.get(Team.NS)
    const ewScore = this.teamScores.get(Team.EW)
    
    return {
      roundsPlayed: this.rounds.length,
      currentPhase: this.phase,
      scores: {
        ns: nsScore?.gameScore || 0,
        ew: ewScore?.gameScore || 0,
      },
      dealer: this.dealer,
      currentPlayer: this.currentPlayer,
      gameCompleted: this.gameCompleted,
      winner: this.winner,
      targetScore: this.settings.targetScore,
    }
  }

  /**
   * Create a summary string
   */
  public toString(): string {
    const stats = this.getGameStats()
    return `Game ${this.gameId} - Round ${this.rounds.length} - NS: ${stats.scores.ns}, EW: ${stats.scores.ew} (Target: ${stats.targetScore})`
  }
}










