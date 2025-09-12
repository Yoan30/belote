import { describe, it, expect } from 'vitest';
import { Card } from '../src/game/models/Card.js';
import { Suit, Rank } from '../src/game/models/Types.js';

describe('Card', () => {
  it('should create a card with correct properties', () => {
    const card = new Card(Suit.SPADES, Rank.ACE);
    
    expect(card.suit).toBe(Suit.SPADES);
    expect(card.rank).toBe(Rank.ACE);
    expect(card.id).toBe('spades_ace');
  });

  it('should calculate correct point values for non-trump cards', () => {
    const ace = new Card(Suit.HEARTS, Rank.ACE);
    const jack = new Card(Suit.CLUBS, Rank.JACK);
    const seven = new Card(Suit.DIAMONDS, Rank.SEVEN);
    
    expect(ace.getPoints(Suit.SPADES)).toBe(11); // Non-trump ace
    expect(jack.getPoints(Suit.SPADES)).toBe(2); // Non-trump jack  
    expect(seven.getPoints(Suit.SPADES)).toBe(0); // Non-trump seven
  });

  it('should calculate correct point values for trump cards', () => {
    const ace = new Card(Suit.SPADES, Rank.ACE);
    const jack = new Card(Suit.SPADES, Rank.JACK);
    const nine = new Card(Suit.SPADES, Rank.NINE);
    
    expect(ace.getPoints(Suit.SPADES)).toBe(11); // Trump ace (same as non-trump)
    expect(jack.getPoints(Suit.SPADES)).toBe(20); // Trump jack
    expect(nine.getPoints(Suit.SPADES)).toBe(14); // Trump nine
  });

  it('should calculate correct playing order for non-trump cards', () => {
    const seven = new Card(Suit.HEARTS, Rank.SEVEN);
    const jack = new Card(Suit.HEARTS, Rank.JACK);
    const ace = new Card(Suit.HEARTS, Rank.ACE);
    
    expect(seven.getOrder(Suit.SPADES)).toBe(1);
    expect(jack.getOrder(Suit.SPADES)).toBe(4);
    expect(ace.getOrder(Suit.SPADES)).toBe(8);
  });

  it('should calculate correct playing order for trump cards', () => {
    const seven = new Card(Suit.SPADES, Rank.SEVEN);
    const jack = new Card(Suit.SPADES, Rank.JACK);
    const nine = new Card(Suit.SPADES, Rank.NINE);
    
    expect(seven.getOrder(Suit.SPADES)).toBe(1); // Trump seven (lowest)
    expect(nine.getOrder(Suit.SPADES)).toBe(7); // Trump nine (high)
    expect(jack.getOrder(Suit.SPADES)).toBe(8); // Trump jack (highest)
  });

  it('should correctly identify trump cards', () => {
    const spadeAce = new Card(Suit.SPADES, Rank.ACE);
    const heartAce = new Card(Suit.HEARTS, Rank.ACE);
    
    expect(spadeAce.isTrump(Suit.SPADES)).toBe(true);
    expect(heartAce.isTrump(Suit.SPADES)).toBe(false);
  });

  it('should provide string representation', () => {
    const card = new Card(Suit.DIAMONDS, Rank.KING);
    expect(card.toString()).toBe('king of diamonds');
  });

  it('should create card from ID', () => {
    const cardId = 'spades_ace';
    const card = Card.fromId(cardId);
    
    expect(card.suit).toBe(Suit.SPADES);
    expect(card.rank).toBe(Rank.ACE);
    expect(card.id).toBe(cardId);
  });

  it('should correctly determine which card beats another', () => {
    const spadeAce = new Card(Suit.SPADES, Rank.ACE);
    const spadeJack = new Card(Suit.SPADES, Rank.JACK);
    const heartAce = new Card(Suit.HEARTS, Rank.ACE);
    const heartKing = new Card(Suit.HEARTS, Rank.KING);
    
    // Trump beats non-trump
    expect(spadeJack.beats(heartAce, Suit.SPADES, Suit.HEARTS)).toBe(true);
    
    // Non-trump cannot beat trump
    expect(heartAce.beats(spadeJack, Suit.SPADES, Suit.HEARTS)).toBe(false);
    
    // Among trumps, higher order wins
    expect(spadeJack.beats(spadeAce, Suit.SPADES, Suit.HEARTS)).toBe(true);
    
    // Among same suit, higher order wins
    expect(heartAce.beats(heartKing, Suit.SPADES, Suit.HEARTS)).toBe(true);
  });
});