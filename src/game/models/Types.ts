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

export interface ScoreData {
  cardPoints: number
  beloteBonus: number
  lastTrickBonus: number
  total: number
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
export type TeamScore = Record<string, number>;
