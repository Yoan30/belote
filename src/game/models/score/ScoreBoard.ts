import { Team, ScoreData } from "../Types";

/** Implémentation concrète du score pour UNE équipe */
export class ScoreBoard implements ScoreData {
  public gameScore = 0;
  public cardPoints = 0;
  public lastTrickBonus = 0;
  public beloteBonus = 0;
  public total?: number;

  constructor(public readonly team?: Team) {}

  resetGame(): void {
    this.gameScore = 0;
    this.cardPoints = 0;
    this.lastTrickBonus = 0;
    this.beloteBonus = 0;
    this.total = 0;
  }

  addCardPoints(pts: number): void       { this.cardPoints    += pts; }
  addLastTrickBonus(pts: number): void   { this.lastTrickBonus+= pts; }
  addBeloteBonus(pts: number): void      { this.beloteBonus   += pts; }

  getRoundTotal(): number {
    return this.cardPoints + this.lastTrickBonus + this.beloteBonus;
  }

  finalizeRound(): void {
    this.total = this.getRoundTotal();
    this.gameScore += this.total;
    // on remet à zéro les points du pli courant
    this.cardPoints = 0;
    this.lastTrickBonus = 0;
    this.beloteBonus = 0;
  }

  hasWon(target: number = 1000): boolean {
    return this.gameScore >= target;
  }
}
