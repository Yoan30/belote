import { Card } from '../models/Card'
import { Hand } from '../models/Hand'
import { Trick } from '../models/Trick'
import { BeloteRules } from '../rules/BeloteRules'
import { Suit } from '../models/Types'
/**
 * Check if a player must follow the lead suit
 * @param hand - Player's hand
 * @param leadSuit - The suit that was led
 * @returns True if player must follow suit
 */
export function mustFollowSuit(hand: Hand, leadSuit: Suit): boolean {
  return hand.canFollowSuit(leadSuit)
}

/**
 * Check if a player must cut (play trump) when they cannot follow suit
 * @param hand - Player's hand
 * @param trick - Current trick
 * @param trumpSuit - Trump suit
 * @returns True if player must cut
 */
export function mustCut(hand: Hand, trick: Trick, trumpSuit: Suit): boolean {
  return BeloteRules.mustCut(hand, trick, trumpSuit)
}

/**
 * Check if a player must overcut (play higher trump than current highest trump)
 * @param hand - Player's hand
 * @param trick - Current trick
 * @param trumpSuit - Trump suit
 * @returns True if player must overcut
 */
export function mustOvercut(hand: Hand, trick: Trick, trumpSuit: Suit): boolean {
  return BeloteRules.mustOvercut(hand, trick, trumpSuit)
}

/**
 * Get cards that follow the lead suit
 * @param hand - Player's hand
 * @param leadSuit - The suit that was led
 * @returns Cards that follow suit
 */
export function getFollowSuitCards(hand: Hand, leadSuit: Suit): Card[] {
  return hand.getCardsFollowingSuit(leadSuit)
}

/**
 * Get trump cards that can overcut the current highest trump
 * @param hand - Player's hand
 * @param trick - Current trick
 * @param trumpSuit - Trump suit
 * @returns Trump cards that can overcut
 */
export function getOvercutCards(hand: Hand, trick: Trick, trumpSuit: Suit): Card[] {
  if (!mustOvercut(hand, trick, trumpSuit)) {
    return []
  }

  const validCards = BeloteRules.getValidCards(hand, trick, trumpSuit)
  return validCards.filter(card => card.isTrump(trumpSuit))
}

/**
 * Get all trump cards in hand
 * @param hand - Player's hand
 * @param trumpSuit - Trump suit
 * @returns All trump cards
 */
export function getTrumpCards(hand: Hand, trumpSuit: Suit): Card[] {
  return hand.getTrumpCards(trumpSuit)
}

/**
 * Get discard options (cards that can be played when not following suit and not cutting)
 * @param hand - Player's hand
 * @param trick - Current trick
 * @param trumpSuit - Trump suit
 * @returns Cards that can be discarded
 */
export function getDiscardCards(hand: Hand, trick: Trick, trumpSuit: Suit): Card[] {
  const leadSuit = trick.getLeadSuit()
  if (!leadSuit) {
    return hand.getCards() // Can play any card if leading
  }

  // If we can follow suit, we must
  if (mustFollowSuit(hand, leadSuit)) {
    return []
  }

  // If we must cut, we cannot discard
  if (mustCut(hand, trick, trumpSuit)) {
    return []
  }

  // Can discard non-trump cards
  return hand.getNonTrumpCards(trumpSuit)
}

/**
 * Check if a specific card can be legally played
 * @param card - Card to check
 * @param hand - Player's hand
 * @param trick - Current trick
 * @param trumpSuit - Trump suit
 * @returns True if card can be played
 */
export function canPlayCard(card: Card, hand: Hand, trick: Trick, trumpSuit: Suit): boolean {
  return BeloteRules.isValidPlay(card, hand, trick, trumpSuit)
}

/**
 * Get explanation for why a card cannot be played
 * @param card - Card to check
 * @param hand - Player's hand
 * @param trick - Current trick
 * @param trumpSuit - Trump suit
 * @returns Explanation string or null if card is valid
 */
export function getPlayRestrictionReason(
  card: Card,
  hand: Hand,
  trick: Trick,
  trumpSuit: Suit
): string | null {
  if (!hand.hasCard(card)) {
    return 'Vous n\'avez pas cette carte'
  }

  if (canPlayCard(card, hand, trick, trumpSuit)) {
    return null
  }

  const leadSuit = trick.getLeadSuit()
  if (!leadSuit) {
    return null // Should be able to play any card when leading
  }

  // Check specific restrictions
  const canFollow = mustFollowSuit(hand, leadSuit)
  const mustCutTrump = mustCut(hand, trick, trumpSuit)
  const mustOvercutTrump = mustOvercut(hand, trick, trumpSuit)

  if (canFollow && card.suit !== leadSuit) {
    return `Vous devez fournir du ${leadSuit}`
  }

  if (mustOvercutTrump && (!card.isTrump(trumpSuit) || !isOvercut(card, trick, trumpSuit))) {
    return 'Vous devez surcouper'
  }

  if (mustCutTrump && !card.isTrump(trumpSuit)) {
    return 'Vous devez couper'
  }

  return 'Cette carte ne peut pas Ãªtre jouÃ©e'
}

/**
 * Check if a trump card overcutes the current highest trump in trick
 * @param card - Trump card to check
 * @param trick - Current trick
 * @param trumpSuit - Trump suit
 * @returns True if card overcutes
 */
function isOvercut(card: Card, trick: Trick, trumpSuit: Suit): boolean {
  if (!card.isTrump(trumpSuit)) {
    return false
  }

  const cards = trick.getAllCards()
  const trumpCards = cards.filter(c => c.isTrump(trumpSuit))
  
  if (trumpCards.length === 0) {
    return true // Any trump is an overcut if no trump in trick
  }

  const highestTrump = trumpCards.reduce((highest, c) => 
    c.getOrder(trumpSuit) > highest.getOrder(trumpSuit) ? c : highest
  )

  return card.getOrder(trumpSuit) > highestTrump.getOrder(trumpSuit)
}

/**
 * Get a text description of play requirements
 * @param hand - Player's hand
 * @param trick - Current trick
 * @param trumpSuit - Trump suit
 * @returns Description of what player must do
 */
export function getPlayRequirementDescription(
  hand: Hand,
  trick: Trick,
  trumpSuit: Suit
): string {
  const leadSuit = trick.getLeadSuit()
  
  if (!leadSuit) {
    return 'Vous pouvez jouer n\'importe quelle carte'
  }

  if (mustFollowSuit(hand, leadSuit)) {
    return `Vous devez fournir du ${leadSuit}`
  }

  if (mustOvercut(hand, trick, trumpSuit)) {
    return 'Vous devez surcouper'
  }

  if (mustCut(hand, trick, trumpSuit)) {
    return 'Vous devez couper'
  }

  return 'Vous pouvez dÃ©fausser n\'importe quelle carte'
}


