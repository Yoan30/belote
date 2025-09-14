import type { Team } from "../Types";

/**
 * Implémentation minimale pour satisfaire les usages existants
 * (addCardPoints, addBeloteBonus, addLastTrickBonus, getRoundTotal,
 *  finalizeRound, hasWon, resetGame, gameScore).
 */
export class ScoreBoard {
  cardPoints: Record<Team, number> = { NS: 0, EW: 0 };
  beloteBonus: Record<Team, number> = { NS: 0, EW: 0 };
  lastTrickBonus: Record<Team, number> = { NS: 0, EW: 0 };
  gameScore: Record<Team, number> = { NS: 0, EW: 0 };

  resetRound(): void {
    this.cardPoints = { NS: 0, EW: 0 };
    this.beloteBonus = { NS: 0, EW: 0 };
    this.lastTrickBonus = { NS: 0, EW: 0 };
  }

  addCardPoints(team: Team, pts: number): void {
    this.cardPoints[team] += pts;
  }

  addBeloteBonus(team: Team, pts: number = 20): void {
    this.beloteBonus[team] += pts;
  }

  addLastTrickBonus(team: Team, pts: number = 10): void {
    this.lastTrickBonus[team] += pts;
  }

  getRoundTotal(team: Team): number {
    return this.cardPoints[team] + this.beloteBonus[team] + this.lastTrickBonus[team];
  }

  /**
   * Paramètre optionnel pour rester compatible avec les appels existants.
   * Ici on additionne simplement les totaux de la manche.
   */
  finalizeRound(_winningTeam?: Team): void {
    this.gameScore.NS += this.getRoundTotal("NS" as Team);
    this.gameScore.EW += this.getRoundTotal("EW" as Team);
    this.resetRound();
  }

  hasWon(target: number): boolean {
    return this.gameScore.NS >= target || this.gameScore.EW >= target;
  }

  resetGame(): void {
    this.gameScore = { NS: 0, EW: 0 };
    this.resetRound();
  }
}
