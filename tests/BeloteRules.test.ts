import { describe, it, expect } from 'vitest';
import { Card } from '../src/game/models/Card.js';
import { Suit, Rank } from '../src/game/models/Types.js';

describe('Game Models Basic Integration', () => {
  describe('Card basics', () => {
    it('should create and identify cards correctly', () => {
      const card = new Card(Suit.SPADES, Rank.ACE);
      
      expect(card.suit).toBe(Suit.SPADES);
      expect(card.rank).toBe(Rank.ACE);
      expect(card.id).toBe('spades_ace');
      expect(card.toString()).toBe('ace of spades');
    });

    it('should calculate points correctly for trump and non-trump', () => {
      const jack = new Card(Suit.CLUBS, Rank.JACK);
      const nine = new Card(Suit.CLUBS, Rank.NINE);
      const ace = new Card(Suit.SPADES, Rank.ACE);
      
      // Trump points
      expect(jack.getPoints(Suit.CLUBS)).toBe(20); // Jack of trump
      expect(nine.getPoints(Suit.CLUBS)).toBe(14); // Nine of trump
      expect(ace.getPoints(Suit.CLUBS)).toBe(11);  // Non-trump ace
      
      // Non-trump points
      expect(jack.getPoints(Suit.SPADES)).toBe(2); // Non-trump jack
      expect(nine.getPoints(Suit.SPADES)).toBe(0); // Non-trump nine
      expect(ace.getPoints(Suit.SPADES)).toBe(11); // Non-trump ace
    });

    it('should handle card comparison correctly', () => {
      const trumpJack = new Card(Suit.CLUBS, Rank.JACK);
      const trumpNine = new Card(Suit.CLUBS, Rank.NINE);
      const regularAce = new Card(Suit.SPADES, Rank.ACE);
      
      // Trump beats non-trump
      expect(trumpJack.beats(regularAce, Suit.CLUBS, Suit.SPADES)).toBe(true);
      expect(regularAce.beats(trumpJack, Suit.CLUBS, Suit.SPADES)).toBe(false);
      
      // Higher trump beats lower trump
      expect(trumpJack.beats(trumpNine, Suit.CLUBS, Suit.CLUBS)).toBe(true);
      expect(trumpNine.beats(trumpJack, Suit.CLUBS, Suit.CLUBS)).toBe(false);
    });

    it('should identify trump cards correctly', () => {
      const spadeAce = new Card(Suit.SPADES, Rank.ACE);
      const clubAce = new Card(Suit.CLUBS, Rank.ACE);
      
      expect(spadeAce.isTrump(Suit.SPADES)).toBe(true);
      expect(spadeAce.isTrump(Suit.CLUBS)).toBe(false);
      expect(clubAce.isTrump(Suit.CLUBS)).toBe(true);
      expect(clubAce.isTrump(Suit.SPADES)).toBe(false);
    });

    it('should create cards from ID', () => {
      const cardId = 'hearts_king';
      const card = Card.fromId(cardId);
      
      expect(card.suit).toBe(Suit.HEARTS);
      expect(card.rank).toBe(Rank.KING);
      expect(card.id).toBe(cardId);
    });
  });

  describe('Basic game logic', () => {
    it('should handle belote-rebelote identification', () => {
      const trumpKing = new Card(Suit.CLUBS, Rank.KING);
      const trumpQueen = new Card(Suit.CLUBS, Rank.QUEEN);
      const nonTrumpKing = new Card(Suit.SPADES, Rank.KING);
      
      // Simulate having both king and queen of trump
      const cards = [trumpKing, trumpQueen, new Card(Suit.HEARTS, Rank.ACE)];
      const trump = Suit.CLUBS;
      
      const hasKing = cards.some(card => card.rank === Rank.KING && card.suit === trump);
      const hasQueen = cards.some(card => card.rank === Rank.QUEEN && card.suit === trump);
      
      expect(hasKing && hasQueen).toBe(true); // Has belote-rebelote
      
      // Test without both cards
      const cards2 = [trumpKing, nonTrumpKing, new Card(Suit.HEARTS, Rank.ACE)];
      const hasKing2 = cards2.some(card => card.rank === Rank.KING && card.suit === trump);
      const hasQueen2 = cards2.some(card => card.rank === Rank.QUEEN && card.suit === trump);
      
      expect(hasKing2 && hasQueen2).toBe(false); // No belote-rebelote
    });

    it('should calculate total points correctly', () => {
      const cards = [
        new Card(Suit.CLUBS, Rank.JACK),   // 20 points (trump)
        new Card(Suit.CLUBS, Rank.NINE),   // 14 points (trump) 
        new Card(Suit.SPADES, Rank.ACE),   // 11 points (non-trump)
        new Card(Suit.HEARTS, Rank.TEN),   // 10 points (non-trump)
      ];
      
      const trump = Suit.CLUBS;
      let totalPoints = 0;
      
      cards.forEach(card => {
        totalPoints += card.getPoints(trump);
      });
      
      expect(totalPoints).toBe(55); // 20 + 14 + 11 + 10
    });
  });
});