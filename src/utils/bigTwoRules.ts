import { Card, Suit, HandType, PlayHand } from '../types';

// Convert suit to numerical value for comparison: Spade > Heart > Club > Diamond
export function getSuitValue(suit: Suit): number {
  switch (suit) {
    case Suit.SPADE:
      return 4;
    case Suit.HEART:
      return 3;
    case Suit.CLUB:
      return 2;
    case Suit.DIAMOND:
      return 1;
    default:
      return 0;
  }
}

// Format ranks for humans
export function getRankLabel(rank: number): string {
  if (rank <= 10) return rank.toString();
  if (rank === 11) return 'J';
  if (rank === 12) return 'Q';
  if (rank === 13) return 'K';
  if (rank === 14) return 'A';
  if (rank === 15) return '2';
  return rank.toString();
}

// Sort cards by card value (Rank primary, Suit secondary)
export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    if (a.rank !== b.rank) {
      return a.rank - b.rank;
    }
    return getSuitValue(a.suit) - getSuitValue(b.suit);
  });
}

// Check if a set of cards is a Straight
function isStraightHelper(cards: Card[]): boolean {
  if (cards.length !== 5) return false;
  const sorted = [...cards].sort((a, b) => a.rank - b.rank);
  
  // Normal straight checks (e.g. 3-4-5-6-7, up to 10-J-Q-K-A)
  // Wait, in Taiwan Big Two, A-2-3-4-5 is a valid straight and 2 is rank 15, A is 14.
  // Let's check for standard sequential ranks
  let isSequential = true;
  for (let i = 0; i < 4; i++) {
    if (sorted[i + 1].rank !== sorted[i].rank + 1) {
      isSequential = false;
      break;
    }
  }
  if (isSequential) return true;

  // Check special straights like A-2-3-4-5.
  // The ranks will be [3, 4, 5, 14, 15] in sorted representation.
  const ranks = sorted.map(c => c.rank);
  const isA2345 = ranks.includes(14) && ranks.includes(15) && ranks.includes(3) && ranks.includes(4) && ranks.includes(5);
  if (isA2345) return true;

  // Check 2-3-4-5-6 -> [3, 4, 5, 6, 15]
  const is23456 = ranks.includes(15) && ranks.includes(3) && ranks.includes(4) && ranks.includes(5) && ranks.includes(6);
  if (is23456) return true;

  return false;
}

// Get highest card in a Straight (properly handling Big Two specific straight orders)
function getStraightHighestCard(cards: Card[]): { rank: number; suitVal: number } {
  const sorted = [...cards].sort((a, b) => a.rank - b.rank);
  const ranks = sorted.map(c => c.rank);

  // Check if it's A-2-3-4-5 (represented as 3, 4, 5, 14=A, 15=2)
  // In Taiwan Big Two, 2 is the largest card. In an A-2-3-4-5 straight, 2 is the highest card.
  // The card with rank 15 (2) should be the pivot card.
  const card2 = sorted.find(c => c.rank === 15);
  if (card2 && ranks.includes(14) && ranks.includes(3)) {
    return { rank: 15, suitVal: getSuitValue(card2.suit) };
  }

  // Otherwise, standard highest card
  const highest = sorted[sorted.length - 1];
  return { rank: highest.rank, suitVal: getSuitValue(highest.suit) };
}

// Analyze five card combinations
function analyzeFiveCards(cards: Card[]): PlayHand {
  const sorted = sortCards(cards);
  
  // 1. Straight Flush
  const isFlush = cards.every(c => c.suit === cards[0].suit);
  const isStraight = isStraightHelper(cards);
  
  if (isFlush && isStraight) {
    const highestInfo = getStraightHighestCard(cards);
    return {
      type: 'STRAIGHT_FLUSH',
      cards: sorted,
      highestCardValue: highestInfo.rank,
      highestCardSuitValue: highestInfo.suitVal,
    };
  }

  // 2. Four of a kind (Iron branch)
  // Ranks can be clustered: XXXXY or YXXXX
  const rankCount: { [key: number]: number } = {};
  cards.forEach(c => rankCount[c.rank] = (rankCount[c.rank] || 0) + 1);
  
  const fourOfKindRank = Object.keys(rankCount).find(k => rankCount[Number(k)] === 4);
  if (fourOfKindRank !== undefined) {
    const mainRank = Number(fourOfKindRank);
    const mainCards = cards.filter(c => c.rank === mainRank);
    const highestMainCard = mainCards.reduce((prev, current) => 
      getSuitValue(current.suit) > getSuitValue(prev.suit) ? current : prev, mainCards[0]
    );
    return {
      type: 'FOUR_OF_A_KIND',
      cards: sorted,
      highestCardValue: mainRank,
      highestCardSuitValue: getSuitValue(highestMainCard.suit),
    };
  }

  // 3. Full House (葫蘆)
  // XXXYY or YYXXX
  const threeOfKindRank = Object.keys(rankCount).find(k => rankCount[Number(k)] === 3);
  const pairRank = Object.keys(rankCount).find(k => rankCount[Number(k)] === 2);
  if (threeOfKindRank !== undefined && pairRank !== undefined) {
    const mainRank = Number(threeOfKindRank);
    return {
      type: 'FULL_HOUSE',
      cards: sorted,
      highestCardValue: mainRank,
      highestCardSuitValue: 4, // Triple wins by rank, suits don't matter as ranks are distinct
    };
  }

  // 4. Flush (同花)
  if (isFlush) {
    const highest = sorted[sorted.length - 1];
    return {
      type: 'FLUSH',
      cards: sorted,
      highestCardValue: highest.rank,
      highestCardSuitValue: getSuitValue(highest.suit),
    };
  }

  // 5. Straight (順子)
  if (isStraight) {
    const highestInfo = getStraightHighestCard(cards);
    return {
      type: 'STRAIGHT',
      cards: sorted,
      highestCardValue: highestInfo.rank,
      highestCardSuitValue: highestInfo.suitVal,
    };
  }

  return { type: 'INVALID', cards, highestCardValue: 0, highestCardSuitValue: 0 };
}

// Evaluate a hand selected by a player
export function evaluateHand(cards: Card[]): PlayHand {
  const len = cards.length;
  if (len === 1) {
    const card = cards[0];
    return {
      type: 'SINGLE',
      cards,
      highestCardValue: card.rank,
      highestCardSuitValue: getSuitValue(card.suit),
    };
  }
  
  if (len === 2) {
    if (cards[0].rank === cards[1].rank) {
      const highestSuitCard = getSuitValue(cards[0].suit) > getSuitValue(cards[1].suit) ? cards[0] : cards[1];
      return {
        type: 'PAIR',
        cards: sortCards(cards),
        highestCardValue: cards[0].rank,
        highestCardSuitValue: getSuitValue(highestSuitCard.suit),
      };
    }
  }

  if (len === 3) {
    if (cards[0].rank === cards[1].rank && cards[1].rank === cards[2].rank) {
      return {
        type: 'TRIPLE',
        cards,
        highestCardValue: cards[0].rank,
        highestCardSuitValue: 4,
      };
    }
  }

  if (len === 5) {
    return analyzeFiveCards(cards);
  }

  return {
    type: 'INVALID',
    cards,
    highestCardValue: 0,
    highestCardSuitValue: 0,
  };
}

// Compare two hands to see if the new play is valid and larger
export function isValidMove(newCards: Card[], prevHand: PlayHand | null, isFirstTurnOfGame: boolean = false): boolean {
  if (newCards.length === 0) return false;

  const newHand = evaluateHand(newCards);
  if (newHand.type === 'INVALID') return false;

  // Rule: In Taiwan Big Two, the very first turn must contain the smallest card (Club 3)
  if (isFirstTurnOfGame) {
    const hasClub3 = newCards.some(c => c.rank === 3 && c.suit === Suit.CLUB);
    if (!hasClub3) return false;
  }

  // If the desk is empty (others passed, or it is the starter turn)
  if (!prevHand || prevHand.cards.length === 0) {
    return true;
  }

  // Check length consistency
  if (newCards.length !== prevHand.cards.length) {
    return false;
  }

  // For Singles, Pairs, Triples
  if (['SINGLE', 'PAIR', 'TRIPLE'].includes(prevHand.type)) {
    if (newHand.type !== prevHand.type) return false;
    
    if (newHand.highestCardValue !== prevHand.highestCardValue) {
      return newHand.highestCardValue > prevHand.highestCardValue;
    }
    return newHand.highestCardSuitValue > prevHand.highestCardSuitValue;
  }

  // For Five Card Hands
  if (['STRAIGHT', 'FLUSH', 'FULL_HOUSE', 'FOUR_OF_A_KIND', 'STRAIGHT_FLUSH'].includes(prevHand.type)) {
    const combinationRank = {
      'STRAIGHT': 1,
      'FLUSH': 2,
      'FULL_HOUSE': 3,
      'FOUR_OF_A_KIND': 4,
      'STRAIGHT_FLUSH': 5,
    };

    const newCombValue = combinationRank[newHand.type as 'STRAIGHT' | 'FLUSH' | 'FULL_HOUSE' | 'FOUR_OF_A_KIND' | 'STRAIGHT_FLUSH'] || 0;
    const prevCombValue = combinationRank[prevHand.type as 'STRAIGHT' | 'FLUSH' | 'FULL_HOUSE' | 'FOUR_OF_A_KIND' | 'STRAIGHT_FLUSH'] || 0;

    if (newCombValue !== prevCombValue) {
      return newCombValue > prevCombValue;
    }

    // Same combination type
    if (newHand.highestCardValue !== prevHand.highestCardValue) {
      return newHand.highestCardValue > prevHand.highestCardValue;
    }
    return newHand.highestCardSuitValue > prevHand.highestCardSuitValue;
  }

  return false;
}

// AI Engine - selects subset of cards to Play or returns null (Pass)
export function getAiPlay(aiCards: Card[], prevHand: PlayHand | null, isFirstTurn: boolean = false): Card[] | null {
  const sortedAiCards = sortCards(aiCards);

  // If starting a new round (desk is empty)
  if (!prevHand || prevHand.cards.length === 0) {
    // If it is the first turn of the game, must play Club 3
    if (isFirstTurn) {
      const club3 = sortedAiCards.find(c => c.rank === 3 && c.suit === Suit.CLUB);
      if (club3) {
        // Try to form a pair or straight with Club 3, or just play it as single
        // For simplicity in AI starter, just play Club 3 alone or as double if available
        const pairsOf3 = sortedAiCards.filter(c => c.rank === 3);
        if (pairsOf3.length >= 2) {
          return pairsOf3.slice(0, 2);
        }
        return [club3];
      }
    }

    // AI chooses to play: tries to get rid of lowest cards first.
    // Let's find first pair, or else play lowest single
    // Look for lowest pair
    for (let i = 0; i < sortedAiCards.length - 1; i++) {
      if (sortedAiCards[i].rank === sortedAiCards[i+1].rank) {
        return [sortedAiCards[i], sortedAiCards[i+1]];
      }
    }
    // No pair, just play lowest single card
    return [sortedAiCards[0]];
  }

  const prevLen = prevHand.cards.length;

  // Single card requested
  if (prevLen === 1) {
    for (const card of sortedAiCards) {
      if (isValidMove([card], prevHand)) {
        return [card];
      }
    }
  }

  // Pair requested
  if (prevLen === 2) {
    // Search for pairs
    for (let i = 0; i < sortedAiCards.length - 1; i++) {
      for (let j = i + 1; j < sortedAiCards.length; j++) {
        if (sortedAiCards[i].rank === sortedAiCards[j].rank) {
          const possiblePair = [sortedAiCards[i], sortedAiCards[j]];
          if (isValidMove(possiblePair, prevHand)) {
            return possiblePair;
          }
        }
      }
    }
  }

  // Triple requested
  if (prevLen === 3) {
    for (let i = 0; i < sortedAiCards.length - 2; i++) {
      if (sortedAiCards[i].rank === sortedAiCards[i+1].rank && sortedAiCards[i+1].rank === sortedAiCards[i+2].rank) {
        const triple = [sortedAiCards[i], sortedAiCards[i+1], sortedAiCards[i+2]];
        if (isValidMove(triple, prevHand)) {
          return triple;
        }
      }
    }
  }

  // 5 card hands requested (Straights, Flushes, Full House)
  if (prevLen === 5) {
    // Let's generate all 5-card combinations the AI holds and check if any beat the prevHand.
    // To make it performant and simple for client preview:
    // We can do a heuristic search of 5-card subsets
    const len = sortedAiCards.length;
    if (len >= 5) {
      // Look for a Full house first
      // Find a triple and a pair
      const rankCount: { [key: number]: Card[] } = {};
      sortedAiCards.forEach(c => {
        if (!rankCount[c.rank]) rankCount[c.rank] = [];
        rankCount[c.rank].push(c);
      });

      const triples = Object.values(rankCount).filter(arr => arr.length >= 3);
      const pairs = Object.values(rankCount).filter(arr => arr.length >= 2);

      if (triples.length > 0 && pairs.length > 1) {
        for (const t of triples) {
          for (const p of pairs) {
            if (p[0].rank !== t[0].rank) {
              const fullHouseSelection = [...t.slice(0, 3), ...p.slice(0, 2)];
              if (isValidMove(fullHouseSelection, prevHand)) {
                return fullHouseSelection;
              }
            }
          }
        }
      }

      // Check for simple Straights
      // Let's slide a window or search 5 sequential values
      for (let i = 0; i <= len - 5; i++) {
        // Find 5 cards with unique ranks that can form a straight
        const subset: Card[] = [];
        const seenRanks = new Set<number>();
        for (let j = i; j < len; j++) {
          const card = sortedAiCards[j];
          if (!seenRanks.has(card.rank)) {
            subset.push(card);
            seenRanks.add(card.rank);
          }
          if (subset.length === 5) {
            if (isStraightHelper(subset) && isValidMove(subset, prevHand)) {
              return subset;
            }
            // remove last and search more
            subset.pop();
            seenRanks.delete(card.rank);
          }
        }
      }
      
      // Check for Flushes
      // Group by suits
      const suitGroups: { [key: string]: Card[] } = {};
      sortedAiCards.forEach(c => {
        if (!suitGroups[c.suit]) suitGroups[c.suit] = [];
        suitGroups[c.suit].push(c);
      });
      for (const suitCards of Object.values(suitGroups)) {
        if (suitCards.length >= 5) {
          const flushSelection = suitCards.slice(suitCards.length - 5);
          if (isValidMove(flushSelection, prevHand)) {
            return flushSelection;
          }
        }
      }
    }
  }

  return null; // Passes if no legal move found
}
