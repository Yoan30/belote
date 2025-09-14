import { Team, type ScoreData } from './Types'
export class TeamScore {
  public readonly team: Team
  public gameScore: number
  public roundCardPoints: number
  public roundBeloteBonus: number
  public roundLastTrickBonus: number

  constructor(team: Team) {
    this.team = team
    this.gameScore = 0
    this.roundCardPoints = 0
    this.roundBeloteBonus = 0
    this.roundLastTrickBonus = 0
  }

  /**
   * Get the total score for the current round
   */
  public getRoundTotal(): number {
    return this.roundCardPoints + this.roundBeloteBonus + this.roundLastTrickBonus
  }

  /**
   * Add card points for the current round
   */
  public addCardPoints(points: number): void {
    this.roundCardPoints += points
  }

  /**
   * Add Belote bonus (20 points)
   */
  public addBeloteBonus(): void {
    this.roundBeloteBonus += 20
  }

  /**
   * Add last trick bonus (10 points)
   */
  public addLastTrickBonus(): void {
    this.roundLastTrickBonus += 10
  }

  /**
   * Finalize the round by adding round total to game score
   */
  public finalizeRound(): ScoreData {
    const roundData: ScoreData = {
      cardPoints: this.roundCardPoints,
      beloteBonus: this.roundBeloteBonus,
      lastTrickBonus: this.roundLastTrickBonus,
      total: this.getRoundTotal(),
    }

    this.gameScore += roundData.total
    this.resetRound()
    
    return roundData
  }

  /**
   * Reset round-specific scores
   */
  public resetRound(): void {
    this.roundCardPoints = 0
    this.roundBeloteBonus = 0
    this.roundLastTrickBonus = 0
  }

  /**
   * Reset all scores for a new game
   */
  public resetGame(): void {
    this.gameScore = 0
    this.resetRound()
  }

  /**
   * Check if team has won the game
   */
  public hasWon(targetScore: number): boolean {
    return this.gameScore >= targetScore
  }

  /**
   * Get current round score data
   */
  public getCurrentRoundData(): ScoreData {
    return {
      cardPoints: this.roundCardPoints,
      beloteBonus: this.roundBeloteBonus,
      lastTrickBonus: this.roundLastTrickBonus,
      total: this.getRoundTotal(),
    }
  }

  /**
   * Create a copy of this team score
   */
  public clone(): TeamScore {
    const copy = new TeamScore(this.team)
    copy.gameScore = this.gameScore
    copy.roundCardPoints = this.roundCardPoints
    copy.roundBeloteBonus = this.roundBeloteBonus
    copy.roundLastTrickBonus = this.roundLastTrickBonus
    return copy
  }
}



