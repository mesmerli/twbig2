export enum Suit {
  SPADE = '♠',   // 黑桃
  HEART = '♥',   // 紅心
  CLUB = '♣',    // 梅花
  DIAMOND = '♦', // 磚塊
}

export interface Card {
  id: string;
  suit: Suit;
  rank: number; // 3 to 15 (11=J, 12=Q, 13=K, 14=A, 15=2)
  faceUp?: boolean;
}

export type HandType =
  | 'INVALID'
  | 'SINGLE'
  | 'PAIR'
  | 'TRIPLE'
  | 'STRAIGHT'
  | 'FLUSH'
  | 'FULL_HOUSE'
  | 'FOUR_OF_A_KIND'
  | 'STRAIGHT_FLUSH';

export interface PlayHand {
  type: HandType;
  cards: Card[];
  highestCardValue: number; // For comparison
  highestCardSuitValue: number; // For comparison
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  title: string;
  cardsCount: number;
  isAi: boolean;
  score: number;
  lastAction?: string; // 'pass', 'play', 'think' etc.
  cards: Card[];
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  title: string;
  score: number;
  winCount: number;
  playCount: number;
  recentMedals: string[];
}

export interface DailyChallenge {
  id: string;
  title: string;
  difficulty: '簡單' | '中等' | '困難';
  description: string;
  opponentHand: Card[];
  playerHand: Card[];
  targetWinInTurns: number;
  isCompleted: boolean;
}
