import { Card } from '../models/Card'
import { Player } from '../models/Player'
import { Rank, Suit, Position, Team } from '../models/Types'
/**
 * Result of checking for Belote/Rebelote
 */
export interface BeloteResult {
  hasBelote: boolean
  canAnnounceBelote: boolean
  canAnnounceRebelote: boolean
  beloteCards: Card[]
  team: Team | null
}

/**
 * Check if a player has Belote (King and Queen of trump)
 * @param player - The player to check
 * @param trumpSuit - The trump suit
 * @returns Belote detection result
 */
export function checkPlayerBelote(player: Player, trumpSuit: Suit): BeloteResult {
  const hasBelote = player.hand.hasBelote(trumpSuit)
  const beloteCards = player.hand.getBeloteCards(trumpSuit)

  const result: BeloteResult = {
    hasBelote,
    canAnnounceBelote: hasBelote && !player.beloteAnnounced,
    canAnnounceRebelote: hasBelote && player.beloteAnnounced && !player.rebeloteAnnounced,
    beloteCards,
    team: hasBelote ? player.team : null,
  }

  return result
}

/**
 * Check if playing a card triggers a Belote announcement
 * @param card - The card being played
 * @param player - The player playing the card
 * @param trumpSuit - The trump suit
 * @returns 'belote', 'rebelote', or null
 */
export function checkBeloteAnnouncement(
  card: Card,
  player: Player,
  trumpSuit: Suit
): 'belote' | 'rebelote' | null {
  // Must be King or Queen of trump
  if (!card.isTrump(trumpSuit)) {
    return null
  }

  if (card.rank !== Rank.KING && card.rank !== Rank.QUEEN) {
    return null
  }

  // Player must have Belote
  const beloteResult = checkPlayerBelote(player, trumpSuit)
  if (!beloteResult.hasBelote) {
    return null
  }

  // Check if this is the first or second announcement
  if (!player.beloteAnnounced) {
    return 'belote'
  } else if (!player.rebeloteAnnounced) {
    return 'rebelote'
  }

  return null
}

/**
 * Get the other card in a Belote pair
 * @param card - King or Queen of trump
 * @param trumpSuit - The trump suit
 * @returns The other card (Queen if card is King, or King if card is Queen)
 */
export function getBelotePair(card: Card, trumpSuit: Suit): Card | null {
  if (!card.isTrump(trumpSuit)) {
    return null
  }

  if (card.rank === Rank.KING) {
    return new Card(trumpSuit, Rank.QUEEN)
  } else if (card.rank === Rank.QUEEN) {
    return new Card(trumpSuit, Rank.KING)
  }

  return null
}

/**
 * Check all players for Belote and return teams that have it
 * @param players - Map of all players
 * @param trumpSuit - The trump suit
 * @returns Array of teams that have Belote
 */
export function findBeloteTeams(
  players: Map<Position, Player>,
  trumpSuit: Suit
): Team[] {
  const beloteTeams: Set<Team> = new Set()

  for (const player of players.values()) {
    const beloteResult = checkPlayerBelote(player, trumpSuit)
    if (beloteResult.hasBelote && beloteResult.team) {
      beloteTeams.add(beloteResult.team)
    }
  }

  return Array.from(beloteTeams)
}

/**
 * Check if a team has completed Belote (announced both Belote and Rebelote)
 * @param players - Map of all players
 * @param team - The team to check
 * @returns True if team has completed Belote
 */
export function hasTeamCompletedBelote(
  players: Map<Position, Player>,
  team: Team
): boolean {
  for (const player of players.values()) {
    if (player.team === team && player.hasCompleteBelote()) {
      return true
    }
  }
  return false
}

/**
 * Get Belote bonus points for a team
 * @param players - Map of all players
 * @param team - The team to check
 * @returns Belote bonus points (20 if team has completed Belote, 0 otherwise)
 */
export function getBeloteBonus(
  players: Map<Position, Player>,
  team: Team
): number {
  return hasTeamCompletedBelote(players, team) ? 20 : 0
}

/**
 * Get all players who have Belote
 * @param players - Map of all players
 * @param trumpSuit - The trump suit
 * @returns Array of players who have Belote
 */
export function getPlayersWithBelote(
  players: Map<Position, Player>,
  trumpSuit: Suit
): Player[] {
  const playersWithBelote: Player[] = []

  for (const player of players.values()) {
    const beloteResult = checkPlayerBelote(player, trumpSuit)
    if (beloteResult.hasBelote) {
      playersWithBelote.push(player)
    }
  }

  return playersWithBelote
}

/**
 * Validate Belote announcements (ensure only one team can have Belote)
 * @param players - Map of all players
 * @param trumpSuit - The trump suit
 * @returns True if Belote distribution is valid
 */
export function validateBeloteDistribution(
  players: Map<Position, Player>,
  trumpSuit: Suit
): boolean {
  const beloteTeams = findBeloteTeams(players, trumpSuit)
  
  // At most one team can have Belote
  return beloteTeams.length <= 1
}

/**
 * Get a description of Belote status for display
 * @param player - The player
 * @param trumpSuit - The trump suit
 * @returns Description string
 */
export function getBeloteStatusDescription(
  player: Player,
  trumpSuit: Suit
): string {
  const beloteResult = checkPlayerBelote(player, trumpSuit)

  if (!beloteResult.hasBelote) {
    return 'Pas de Belote'
  }

  if (player.hasCompleteBelote()) {
    return 'Belote et Rebelote annoncÃ©es (+20 points)'
  } else if (player.beloteAnnounced) {
    return 'Belote annoncÃ©e (Rebelote en attente)'
  } else {
    return 'Belote disponible (non annoncÃ©e)'
  }
}

/**
 * Process Belote announcement when a card is played
 * @param card - The card being played
 * @param player - The player playing the card
 * @param trumpSuit - The trump suit
 * @returns Object with announcement info and updated player state
 */
export function processBeloteAnnouncement(
  card: Card,
  player: Player,
  trumpSuit: Suit
): {
  announcement: 'belote' | 'rebelote' | null
  message: string | null
  bonusEarned: boolean
} {
  const announcement = checkBeloteAnnouncement(card, player, trumpSuit)
  
  if (!announcement) {
    return {
      announcement: null,
      message: null,
      bonusEarned: false,
    }
  }

  let message: string
  let bonusEarned = false

  if (announcement === 'belote') {
    player.announceBelote()
    message = `${player.name} annonce "Belote" !`
  } else {
    player.announceRebelote()
    message = `${player.name} annonce "Rebelote" ! (+20 points)`
    bonusEarned = true
  }

  return {
    announcement,
    message,
    bonusEarned,
  }
}


