/* Project-wide types (alignés avec le code existant) */

export enum Suit {
  CLUBS = "C",
  DIAMONDS = "D",
  HEARTS = "H",
  SPADES = "S",
}

export enum Rank {
  SEVEN = "seven",
  EIGHT = "eight",
  NINE = "nine",
  TEN = "ten",
  JACK = "jack",
  QUEEN = "queen",
  KING = "king",
  ACE = "ace",
}

export enum Position {
  NORTH = "N",
  EAST  = "E",
  SOUTH = "S",
  WEST  = "W",
}

export enum Phase {
  DEALING    = "DEALING",
  AUCTION    = "AUCTION",
  PLAY       = "PLAY",
  ROUND_END  = "ROUND_END",
  FINISHED   = "FINISHED",
}

export enum AILevel {
  APPRENTI = "APPRENTI",
  CONFIRME = "CONFIRME",
  EXPERT   = "EXPERT",
  CHAMPION = "CHAMPION",
}

export enum Team { NS = "NS", EW = "EW" }

export type PlayerId = string;
export type RoundId  = string;
export type TrickId  = string;
export type CardId   = string;

/** Valeurs utilisées dans Card.ts (normal/trump + ordres) */
export type CardValue = {
  normal: number;
  trump: number;
  order: number;
  trumpOrder: number;
};

export interface GameSettings {
  aiLevel?: AILevel;
  targetScore?: number;
  trump?: Suit;
}

/**
 * Données de score pour UNE équipe.
 * Important: on garde les méthodes en option pour pouvoir aussi utiliser
 * des objets “littéraux” simples là où le code fait juste des additions.
 */
export interface ScoreData {
  gameScore?: number;
  cardPoints: number;
  lastTrickBonus: number;
  beloteBonus: number;
  total?: number;

  resetGame?(): void;
  finalizeRound?(): void;

  addCardPoints?(pts?: number): void;
  addLastTrickBonus?(pts?: number): void;
  addBeloteBonus?(pts?: number): void;
  getRoundTotal?(): number;
  hasWon?(target?: number): boolean;
}



