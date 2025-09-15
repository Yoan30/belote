import { Deck } from '../models/Deck'
import { Player } from '../models/Player'
import { Position } from '../models/Types'

/**
 * Deal cards to players in the standard Belote pattern
 * @param deck - The deck to deal from (should be shuffled)
 * @param players - Map of players by position
 * @param dealer - The dealer position
 */
export function dealCards(deck: Deck, players: Map<Position, Player>, dealer: Position): void {
  // Clear all hands first
  for (const player of players.values()) {
    player.hand.clear()
  }

  // Belote dealing pattern: 3-2-3 cards per player, twice
  const dealPattern = [3, 2, 3]
  
  // Get play order starting with player after dealer
  const positions = [Position.SOUTH, Position.WEST, Position.NORTH, Position.EAST]
  const dealerIndex = positions.indexOf(dealer)
  const dealOrder: Position[] = []
  
  for (let i = 1; i <= 4; i++) {
    const pos = positions[(dealerIndex + i) % 4]
    if (pos) {
      dealOrder.push(pos)
    }
  }

  // Deal twice using the pattern
  for (let round = 0; round < 2; round++) {
    for (const numCards of dealPattern) {
      for (const position of dealOrder) {
        const player = players.get(position)
        if (player) {
          const cards = deck.deal(numCards)
          player.hand.addCards(cards)
        }
      }
    }
  }

  // Sort all hands
  for (const _player of players.values()) {
    // Note: We'll need trump suit to sort properly, but for now sort without it
    // This will be refined when we have the trump suit available
  }
}

/**
 * Rotate dealer position clockwise
 * @param currentDealer - Current dealer position
 * @returns Next dealer position
 */
export function getNextDealer(currentDealer: Position): Position {
  const positions = [Position.SOUTH, Position.WEST, Position.NORTH, Position.EAST]
  const currentIndex = positions.indexOf(currentDealer)
  const nextPosition = positions[(currentIndex + 1) % 4]
  return nextPosition || Position.SOUTH
}

/**
 * Get the position of the player to the left of dealer (first to play)
 * @param dealer - The dealer position
 * @returns Position of first player
 */
export function getFirstPlayer(dealer: Position): Position {
  return getNextDealer(dealer) // Player to the left of dealer plays first
}

/**
 * Validate that the deal was successful
 * @param players - Map of players by position
 * @returns True if all players have exactly 8 cards
 */
export function validateDeal(players: Map<Position, Player>): boolean {
  for (const player of players.values()) {
    if (player.hand.size() !== 8) {
      return false
    }
  }
  return true
}

/**
 * Calculate total cards dealt
 * @param players - Map of players by position
 * @returns Total number of cards in all hands
 */
export function getTotalCardsDealt(players: Map<Position, Player>): number {
  let total = 0
  for (const player of players.values()) {
    total += player.hand.size()
  }
  return total
}


