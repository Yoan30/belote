import { Trick } from ''
import { Team, Suit, Position, ScoreData } from ''

/**
 * Calculate points for a single trick
 * @param trick - The completed trick
 * @param trumpSuit - The trump suit
 * @returns Points scored in this trick
 */
export function calculateTrickPoints(trick: Trick, trumpSuit: Suit): number {
  if (!trick.isCompleted()) {
    return 0
  }

  const cards = trick.getAllCards()
  return cards.reduce((total, card) => total + card.getPoints(trumpSuit), 0)
}

/**
 * Determine which team won a trick
 * @param trick - The completed trick
 * @returns The winning team
 */
export function getTrickWinningTeam(trick: Trick): Team | null {
  const winner = trick.getWinner()
  if (!winner) {
    return null
  }

  // North-South vs East-West
  if (winner === Position.NORTH || winner === Position.SOUTH) {
    return Team.NS
  } else {
    return Team.EW
  }
}

/**
 * Calculate final scores for a round
 * @param tricks - All completed tricks from the round
 * @param trumpSuit - The trump suit
 * @param beloteTeam - Team that scored Belote (if any)
 * @returns Score data for both teams
 */
export function calculateRoundScores(
  tricks: Trick[],
  trumpSuit: Suit,
  beloteTeam: Team | null = null
): { nsScore: ScoreData; ewScore: ScoreData } {
  const nsScore: ScoreData = {
    cardPoints: 0,
    beloteBonus: 0,
    lastTrickBonus: 0,
    total: 0,
  }

  const ewScore: ScoreData = {
    cardPoints: 0,
    beloteBonus: 0,
    lastTrickBonus: 0,
    total: 0,
  }

  // Calculate card points from tricks
  for (const trick of tricks) {
    if (!trick.isCompleted()) {
      continue
    }

    const points = calculateTrickPoints(trick, trumpSuit)
    const winningTeam = getTrickWinningTeam(trick)

    if (winningTeam === Team.NS) {
      nsScore.cardPoints += points
    } else if (winningTeam === Team.EW) {
      ewScore.cardPoints += points
    }
  }

  // Add last trick bonus (10 points)
  if (tricks.length > 0) {
    const lastTrick = tricks[tricks.length - 1]
    if (lastTrick?.isCompleted()) {
      const lastTrickWinner = getTrickWinningTeam(lastTrick)
      if (lastTrickWinner === Team.NS) {
        nsScore.lastTrickBonus = 10
      } else if (lastTrickWinner === Team.EW) {
        ewScore.lastTrickBonus = 10
      }
    }
  }

  // Add Belote bonus (20 points)
  if (beloteTeam === Team.NS) {
    nsScore.beloteBonus = 20
  } else if (beloteTeam === Team.EW) {
    ewScore.beloteBonus = 20
  }

  // Calculate totals
  nsScore.total = nsScore.cardPoints + nsScore.beloteBonus + nsScore.lastTrickBonus
  ewScore.total = ewScore.cardPoints + ewScore.beloteBonus + ewScore.lastTrickBonus

  return { nsScore, ewScore }
}

/**
 * Validate that total points equal 162 (152 card points + 10 last trick)
 * @param nsScore - North-South score data
 * @param ewScore - East-West score data
 * @returns True if points total correctly
 */
export function validateRoundScores(nsScore: ScoreData, ewScore: ScoreData): boolean {
  const totalCardPoints = nsScore.cardPoints + ewScore.cardPoints
  const totalLastTrick = nsScore.lastTrickBonus + ewScore.lastTrickBonus

  // Total card points should be 152, last trick should be 10
  return totalCardPoints === 152 && totalLastTrick === 10
}

/**
 * Check if a team has won the game
 * @param teamScore - The team's total game score
 * @param targetScore - The target score to win (default 1000)
 * @returns True if team has won
 */
export function hasTeamWon(teamScore: number, targetScore: number = 1000): boolean {
  return teamScore >= targetScore
}

/**
 * Calculate minimum points needed to win
 * @param currentScore - Current team score
 * @param targetScore - Target score to win (default 1000)
 * @returns Points needed to win
 */
export function getPointsToWin(currentScore: number, targetScore: number = 1000): number {
  return Math.max(0, targetScore - currentScore)
}

/**
 * Get a summary of the scoring for a round
 * @param nsScore - North-South score data
 * @param ewScore - East-West score data
 * @returns Formatted summary string
 */
export function getRoundScoreSummary(nsScore: ScoreData, ewScore: ScoreData): string {
  const lines = [
    'Score de la donne:',
    `Nord-Sud: ${nsScore.cardPoints} (cartes) + ${nsScore.beloteBonus} (belote) + ${nsScore.lastTrickBonus} (dernier pli) = ${nsScore.total}`,
    `Est-Ouest: ${ewScore.cardPoints} (cartes) + ${ewScore.beloteBonus} (belote) + ${ewScore.lastTrickBonus} (dernier pli) = ${ewScore.total}`,
  ]
  return lines.join('\n')
}

/**
 * Determine the winner of a game
 * @param nsGameScore - North-South total game score
 * @param ewGameScore - East-West total game score
 * @param targetScore - Target score to win (default 1000)
 * @returns Winning team or null if no winner yet
 */
export function getGameWinner(
  nsGameScore: number,
  ewGameScore: number,
  targetScore: number = 1000
): Team | null {
  if (nsGameScore >= targetScore && ewGameScore >= targetScore) {
    // Both teams reached target - highest score wins
    return nsGameScore >= ewGameScore ? Team.NS : Team.EW
  } else if (nsGameScore >= targetScore) {
    return Team.NS
  } else if (ewGameScore >= targetScore) {
    return Team.EW
  }
  return null
}

/**
 * Calculate percentage of total points won by a team in a round
 * @param teamScore - Team's score data
 * @param totalRoundPoints - Total points available in round (including bonuses)
 * @returns Percentage (0-100)
 */
export function getScorePercentage(teamScore: ScoreData, totalRoundPoints: number): number {
  if (totalRoundPoints === 0) {
    return 0
  }
  return Math.round((teamScore.total / totalRoundPoints) * 100)
}
