import { Card } from '../models/Card.js'
import { Player } from '../models/Player.js'
import { Trick } from '../models/Trick.js'
import { BeloteRules } from '../rules/BeloteRules.js'
import { Position, Suit } from '../models/Types.js'

/**
 * Result of playing a card
 */
export interface PlayCardResult {
  success: boolean
  error?: string
  beloteAnnouncement?: 'belote' | 'rebelote' | undefined
  trickCompleted: boolean
  trickWinner?: Position | undefined
  nextPlayer?: Position | undefined
}

/**
 * Play a card from a player's hand to the current trick
 * @param card - The card to play
 * @param player - The player playing the card
 * @param trick - The current trick
 * @param trumpSuit - The trump suit
 * @returns Result of the play
 */
export function playCard(
  card: Card,
  player: Player,
  trick: Trick,
  trumpSuit: Suit
): PlayCardResult {
  // Validate that the player has the card
  if (!player.hand.hasCard(card)) {
    return {
      success: false,
      error: `Player ${player.name} does not have card ${card.toString()}`,
      trickCompleted: false,
    }
  }

  // Validate that it's the player's turn
  const expectedPlayer = trick.getNextPlayer()
  if (expectedPlayer !== player.position) {
    return {
      success: false,
      error: `Not ${player.name}'s turn to play. Expected: ${expectedPlayer || 'unknown'}`,
      trickCompleted: false,
    }
  }

  // Validate that the card play is legal according to Belote rules
  if (!BeloteRules.isValidPlay(card, player.hand, trick, trumpSuit)) {
    return {
      success: false,
      error: `Invalid card play: ${card.toString()} cannot be played according to Belote rules`,
      trickCompleted: false,
    }
  }

  // Check for Belote/Rebelote announcement
  let beloteAnnouncement: 'belote' | 'rebelote' | undefined
  const announcement = BeloteRules.checkBeloteAnnouncement(card, player.hand, trumpSuit)
  if (announcement) {
    beloteAnnouncement = announcement
    
    // Update player's belote status
    if (announcement === 'belote' && !player.beloteAnnounced) {
      player.announceBelote()
    } else if (announcement === 'rebelote' && player.beloteAnnounced && !player.rebeloteAnnounced) {
      player.announceRebelote()
    }
  }

  // Remove card from player's hand
  const removedCard = player.hand.removeCard(card)
  if (!removedCard) {
    return {
      success: false,
      error: `Failed to remove card ${card.toString()} from player's hand`,
      trickCompleted: false,
    }
  }

  // Add card to trick
  try {
    trick.addPlay(player.position, card)
  } catch (error) {
    // Restore card to hand if trick play fails
    player.hand.addCard(removedCard)
    return {
      success: false,
      error: `Failed to add card to trick: ${error instanceof Error ? error.message : 'Unknown error'}`,
      trickCompleted: false,
    }
  }

  // Check if trick is completed
  const trickCompleted = trick.isCompleted()
  let trickWinner: Position | undefined
  let nextPlayer: Position | undefined

  if (trickCompleted) {
    trickWinner = trick.getWinner() || undefined
  } else {
    nextPlayer = trick.getNextPlayer() || undefined
  }

  return {
    success: true,
    beloteAnnouncement,
    trickCompleted,
    trickWinner,
    nextPlayer,
  }
}

/**
 * Automatically play the only valid card if player has no choice
 * @param player - The player
 * @param trick - The current trick
 * @param trumpSuit - The trump suit
 * @returns The card that was played, or null if player has multiple choices
 */
export function playOnlyValidCard(
  player: Player,
  trick: Trick,
  trumpSuit: Suit
): Card | null {
  const validCards = BeloteRules.getValidCards(player.hand, trick, trumpSuit)
  
  if (validCards.length === 1) {
    return validCards[0]!
  }
  
  return null
}

/**
 * Check if a player can make any legal moves
 * @param player - The player
 * @param trick - The current trick
 * @param trumpSuit - The trump suit
 * @returns True if player can make a legal move
 */
export function canPlayerPlay(player: Player, trick: Trick, trumpSuit: Suit): boolean {
  const validCards = BeloteRules.getValidCards(player.hand, trick, trumpSuit)
  return validCards.length > 0
}

/**
 * Get a summary of legal play options for a player
 * @param player - The player
 * @param trick - The current trick
 * @param trumpSuit - The trump suit
 * @returns Object describing play requirements
 */
export function getPlayOptions(player: Player, trick: Trick, trumpSuit: Suit) {
  const validCards = BeloteRules.getValidCards(player.hand, trick, trumpSuit)
  const mustCut = BeloteRules.mustCut(player.hand, trick, trumpSuit)
  const mustOvercut = BeloteRules.mustOvercut(player.hand, trick, trumpSuit)
  
  return {
    validCards,
    mustCut,
    mustOvercut,
    canFollowSuit: trick.getLeadSuit() ? player.hand.canFollowSuit(trick.getLeadSuit()!) : true,
    hasTrump: player.hand.hasTrump(trumpSuit),
    hasChoice: validCards.length > 1,
  }
}