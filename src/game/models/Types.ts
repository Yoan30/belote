/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
// Core types for Belote game

export enum Suit {
  SPADES = 'spades',
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
}

export enum Rank {
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'jack',
  QUEEN = 'queen',
  KING = 'king',
  ACE = 'ace',
}

export enum Position {
  SOUTH = 'south', // Human player
  WEST = 'west',   // AI player
  NORTH = 'north', // AI player
  EAST = 'east',   // AI player
}

export enum Team {
  NS = 'ns', // North-South (Human + AI partner)
  EW = 'ew', // East-West (AI opponents)
}

export enum Phase {
  DEALING = 'dealing',
  BIDDING = 'bidding',
  PLAYING = 'playing',
  SCORING = 'scoring',
  FINISHED = 'finished',
}

export enum AILevel {
  APPRENTI = 'apprenti',
  CONFIRME = 'confirme',
  EXPERT = 'expert',
  CHAMPION = 'champion',
}

export interface CardValue {
  normal: number   // Points in non-trump suit
  trump: number    // Points in trump suit
  order: number    // Playing order (for trick-taking)
  trumpOrder: number // Playing order when trump
}
export interface GameSettings {
  targetScore: number
  aiLevel: AILevel
  trump: Suit
  seed?: string
  debugMode: boolean
}

export type PlayerId = string
export type CardId = string
export type TrickId = string
export type RoundId = string

//
// ---- Added for build (TeamScore shape) ----
export interface TeamScore {
  NS: number;
  EW: number;
}
    
// Added for build: per-team score map

/** Minimal scoring engine used par le jeu/IA. */
/* removed: class ScoreData (déplacé dans score/ScoreBoard) */
this.lastTrickBonus = { NS: 0, EW: 0 }
    this.beloteBonus = { NS: 0, EW: 0 }
    this.gameScore = { NS: 0, EW: 0 }
  }

  /** Remet à zéro les points de la manche en cours (pas le score de partie). */
  private resetRound(): void {
    this.cardPoints.NS = this.cardPoints.EW = 0
    this.lastTrickBonus.NS = this.lastTrickBonus.EW = 0
    this.beloteBonus.NS = this.beloteBonus.EW = 0
  }

  /** Remet tout à zéro (manche + score cumulé). */
  resetGame(): void {
    this.resetRound()
    this.gameScore.NS = this.gameScore.EW = 0
  }

  addCardPoints(team: Team, pts: number): void {
    if (team === Team.NS) this.cardPoints.NS += pts
    else this.cardPoints.EW += pts
  }

  addLastTrickBonus(team: Team, pts: number): void {
    if (team === Team.NS) this.lastTrickBonus.NS += pts
    else this.lastTrickBonus.EW += pts
  }

  addBeloteBonus(team: Team, pts: number): void {
    if (team === Team.NS) this.beloteBonus.NS += pts
    else this.beloteBonus.EW += pts
  }

  /** Total de la manche courante pour l'équipe. */
  getRoundTotal(team: Team): number {
    if (team === Team.NS) {
      return this.cardPoints.NS + this.lastTrickBonus.NS + this.beloteBonus.NS
    }
    return this.cardPoints.EW + this.lastTrickBonus.EW + this.beloteBonus.EW
  }

  /** Clôture la manche: cumule au score de partie et purge les compteurs de manche. */
  finalizeRound(): void {
    this.gameScore.NS += this.getRoundTotal(Team.NS)
    this.gameScore.EW += this.getRoundTotal(Team.EW)
    this.resetRound()
  }

  /** Renvoie l'équipe gagnante si un seuil est atteint (par défaut 1000), sinon null. */
  hasWon(target: number = 1000): Team | null {
    if (this.gameScore.NS >= target && this.gameScore.NS > this.gameScore.EW) return Team.NS
    if (this.gameScore.EW >= target && this.gameScore.EW > this.gameScore.NS) return Team.EW
    return null
  }
}
  
// Alias: ScoreData devient le type de la classe ScoreBoard
export type ScoreData = import('./score/ScoreBoard').ScoreBoard;
