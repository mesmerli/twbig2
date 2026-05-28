import { LeaderboardEntry, DailyChallenge, Suit } from '../types';

export const LOCAL_TITLES = [
  '西門町神釣手',
  '信義區彭于晏',
  '萬華牌局一陣風',
  '大安區包租公',
  '淡水河神算子',
  '逢甲林志玲',
  '高雄發哥',
  '三重老皮',
  '大奶微微愛好者',
  '竹科加班狂',
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    name: '大奶微微打天下',
    title: '東區大老二至尊',
    score: 9820,
    winCount: 421,
    playCount: 550,
    recentMedals: ['🏆 賽季冠', '🔥 十連勝', '🎯 精準鐵支'],
  },
  {
    rank: 2,
    name: '信義區彭于晏',
    title: '高富帥牌組大師',
    score: 8750,
    winCount: 350,
    playCount: 480,
    recentMedals: ['🥇 實力派', '💡 戰略核心'],
  },
  {
    rank: 3,
    name: '板橋發哥二號',
    title: '無情過牌機器',
    score: 7900,
    winCount: 310,
    playCount: 450,
    recentMedals: ['⚡ 閃電手'],
  },
  {
    rank: 4,
    name: '台大資工張學友',
    title: '演算法必勝客',
    score: 7450,
    winCount: 298,
    playCount: 410,
    recentMedals: ['🧠 算牌神童'],
  },
  {
    rank: 5,
    name: '高雄林志玲',
    title: '霸氣女牌聖',
    score: 7120,
    winCount: 270,
    playCount: 395,
    recentMedals: ['💃 傲視群雄'],
  },
  {
    rank: 6,
    name: '淡水河神算',
    title: '老司機過牌法',
    score: 6850,
    winCount: 245,
    playCount: 380,
    recentMedals: ['🐢 耐力大師'],
  },
  {
    rank: 7,
    name: '三重劉德華',
    title: '蘆洲五張狂魔',
    score: 6200,
    winCount: 215,
    playCount: 350,
    recentMedals: ['🔥 五連勝'],
  },
  {
    rank: 8,
    name: '帝寶包租公',
    title: '有錢就是任性',
    score: 5980,
    winCount: 190,
    playCount: 320,
    recentMedals: ['💰 財大氣粗'],
  },
  {
    rank: 9,
    name: '夜市套圈圈神人',
    title: '手速流至尊',
    score: 5400,
    winCount: 175,
    playCount: 310,
    recentMedals: [],
  },
];

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'challenge_1',
    title: '黑桃二的驚天逆襲',
    difficulty: '中等',
    description: '此時對方剩餘 2 張牌（已知含有梅花 K）。你的手上僅剩 3 張，包含壓底的【黑桃2】與【鑽石 4】、以及【紅心 Q】。輪到你出牌，如何打出完美結局贏得本局？',
    opponentHand: [
      { id: 'opp_1', suit: Suit.SPADE, rank: 13, faceUp: false }, // Spade K
      { id: 'opp_2', suit: Suit.CLUB, rank: 13, faceUp: true },  // Club K (known)
    ],
    playerHand: [
      { id: 'play_1', suit: Suit.DIAMOND, rank: 4 }, // Diamond 4
      { id: 'play_2', suit: Suit.HEART, rank: 12 },   // Heart Q
      { id: 'play_3', suit: Suit.SPADE, rank: 15 },   // Spade 2 (largest)
    ],
    targetWinInTurns: 2,
    isCompleted: false,
  },
  {
    id: 'challenge_2',
    title: '梅花三的絕地反擊（新手局）',
    difficulty: '簡單',
    description: '桌面上無牌，輪到你開局。你手上有【梅花 3】、【黑桃 Q】、【紅心 2】。對手手上有【紅心 Q】與【鑽石 Q】。請打出包含梅花3的組合，並在對手防備下最終用紅心2奪得勝果。',
    opponentHand: [
      { id: 'opp_3', suit: Suit.HEART, rank: 12, faceUp: true }, // Heart Q
      { id: 'opp_4', suit: Suit.DIAMOND, rank: 12, faceUp: true }, // Diamond Q
    ],
    playerHand: [
      { id: 'play_4', suit: Suit.CLUB, rank: 3 },    // Club 3
      { id: 'play_5', suit: Suit.SPADE, rank: 12 },  // Spade Q
      { id: 'play_6', suit: Suit.HEART, rank: 15 },  // Heart 2
    ],
    targetWinInTurns: 2,
    isCompleted: false,
  },
  {
    id: 'challenge_3',
    title: '鐵支破壞狂（高手局）',
    difficulty: '困難',
    description: '對方剩餘 5 張牌（暗示可能為順子或同花）。你手握【黑桃 A】與【紅心 A】一對，以及【梅花 2】。對手手牌強大，你必須精準卡位，利用對手過牌機會，引誘他拆牌，再以大牌一槌定音！',
    opponentHand: [
      { id: 'opp_5', suit: Suit.SPADE, rank: 13, faceUp: false }, // Spade K
      { id: 'opp_6', suit: Suit.HEART, rank: 13, faceUp: false }, // Heart K
      { id: 'opp_7', suit: Suit.DIAMOND, rank: 13, faceUp: false }, // Diamond K
      { id: 'opp_8', suit: Suit.SPADE, rank: 10, faceUp: false }, // Spade 10
      { id: 'opp_9', suit: Suit.CLUB, rank: 10, faceUp: false }, // Club 10
    ],
    playerHand: [
      { id: 'play_7', suit: Suit.SPADE, rank: 14 },  // Spade A
      { id: 'play_8', suit: Suit.HEART, rank: 14 },  // Heart A
      { id: 'play_9', suit: Suit.CLUB, rank: 15 },   // Club 2
    ],
    targetWinInTurns: 2,
    isCompleted: false,
  }
];
