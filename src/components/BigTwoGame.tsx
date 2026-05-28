import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Player, PlayHand, Suit } from '../types';
import { sortCards, evaluateHand, isValidMove, getAiPlay, getRankLabel } from '../utils/bigTwoRules';
import { gameAudio } from '../utils/audio';
import CardView from './CardView';
import { Play, RotateCcw, Volume2, VolumeX, Swords, Award, HelpCircle, CheckCircle } from 'lucide-react';

interface BigTwoGameProps {
  userDisplayName: string;
  userTitle: string;
  userScore: number;
  onGameWin: (score: number, titleEarned?: string) => void;
  dailyChallengeActiveId?: string | null;
  onChallengeComplete?: (challengeId: string) => void;
}

// Dialog bubbles for funny Taiwanese card reactions
const TAIWAN_SLANG = [
  '黑桃二啦！哪次不黑桃二！',
  '欸欸欸，打這張牌你是認真的嗎？',
  '打這什麼鳥牌！',
  '過牌啦～留著好牌娶媳婦喔？',
  '別逼我出鐵支喔，這手牌有毒！',
  '大奶微微去冰半糖先來一杯。',
  '這局穩了，下波請大家吃雞排。',
  '完蛋，拿到梅花三還被壓成這樣。',
  '等等，讓我算個牌，不要催！',
  '不要急、不要慌，好戲在後頭！',
];

export default function BigTwoGame({
  userDisplayName,
  userTitle,
  userScore,
  onGameWin,
  dailyChallengeActiveId = null,
  onChallengeComplete,
}: BigTwoGameProps) {
  // Configured sound toggle
  const [soundOn, setSoundOn] = useState(true);

  // Core table state
  const [players, setPlayers] = useState<Player[]>([]);
  const [desk, setDesk] = useState<PlayHand | null>(null);
  const [turnIndex, setTurnIndex] = useState<number>(-1);
  const [consecutivePasses, setConsecutivePasses] = useState<number>(0);
  const [isFirstTurn, setIsFirstTurn] = useState<boolean>(true);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [playLogs, setPlayLogs] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'win' | 'lose' | 'solved'>('idle');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [playerSpeech, setPlayerSpeech] = useState<{ [playerId: string]: string }>({});

  // Refs for auto scrolling log
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [playLogs]);

  // Set visual speech feedback
  const triggerSpeech = (playerId: string, speechText: string) => {
    setPlayerSpeech((prev) => ({ ...prev, [playerId]: speechText }));
    setTimeout(() => {
      setPlayerSpeech((prev) => {
        const copy = { ...prev };
        delete copy[playerId];
        return copy;
      });
    }, 2800);
  };

  // Sound effects toggle helper
  const handleToggleSound = () => {
    const isNowOn = gameAudio.toggleSound();
    setSoundOn(isNowOn);
  };

  // Generate complete deck
  const createDeck = (): Card[] => {
    const deck: Card[] = [];
    const suits = [Suit.DIAMOND, Suit.CLUB, Suit.HEART, Suit.SPADE]; // ♦ ♣ ♥ ♠
    for (const suit of suits) {
      for (let rank = 3; rank <= 15; rank++) {
        deck.push({
          id: `${suit}-${rank}`,
          suit,
          rank,
        });
      }
    }
    return deck;
  };

  // Shuffle Fisher-Yates
  const shuffleDeck = (deck: Card[]): Card[] => {
    const copy = [...deck];
    for (let i = copy.length - 1; i > 0; i--) {
      const idx = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[idx]] = [copy[idx], copy[i]];
    }
    return copy;
  };

  // Launch fresh game
  const initNormalGame = () => {
    const deck = shuffleDeck(createDeck());
    
    // Distribute 13 cards to 4 players
    const humanCards = sortCards(deck.slice(0, 13));
    const ai1Cards = sortCards(deck.slice(13, 26));
    const ai2Cards = sortCards(deck.slice(26, 39));
    const ai3Cards = sortCards(deck.slice(39, 52));

    const initialPlayers: Player[] = [
      {
        id: 'p0',
        name: userDisplayName || '神秘牌客',
        avatar: '🎴',
        title: userTitle || '牌桌熟手',
        cardsCount: 13,
        isAi: false,
        score: userScore,
        cards: humanCards,
        lastAction: '',
      },
      {
        id: 'p1',
        name: '東區大老二至尊',
        avatar: '🐯',
        title: '老司機大師',
        cardsCount: 13,
        isAi: true,
        score: 9500,
        cards: ai1Cards,
        lastAction: '',
      },
      {
        id: 'p2',
        name: '高雄發哥',
        avatar: '🕶️',
        title: '夜市賭聖',
        cardsCount: 13,
        isAi: true,
        score: 8700,
        cards: ai2Cards,
        lastAction: '',
      },
      {
        id: 'p3',
        name: '三重老皮',
        avatar: '🦊',
        title: '萬華神算手',
        cardsCount: 13,
        isAi: true,
        score: 6400,
        cards: ai3Cards,
        lastAction: '',
      },
    ];

    setPlayers(initialPlayers);
    setDesk(null);
    setSelectedCards([]);
    setConsecutivePasses(0);
    setIsFirstTurn(true);
    setGameState('playing');

    // Find who has Club 3 to start the game
    let starterIdx = 0;
    initialPlayers.forEach((p, idx) => {
      if (p.cards.some((c) => c.rank === 3 && c.suit === Suit.CLUB)) {
        starterIdx = idx;
      }
    });

    setTurnIndex(starterIdx);

    const starterName = initialPlayers[starterIdx].isAi ? initialPlayers[starterIdx].name : '你';
    const initialLog = `💡 遊戲開局！由持有 [梅花 3] 的 [${starterName}] 先攻發行！`;
    setPlayLogs([initialLog]);

    if (initialPlayers[starterIdx].isAi) {
      triggerSpeech(initialPlayers[starterIdx].id, '哈哈，梅花三在我手，這盤主動權由我掌管！');
    } else {
      triggerSpeech('p0', '看我起手神牌，準備受死吧！');
    }
  };

  // Launch dynamic daily puzzle challenge
  const initChallengeGame = (challengeId: string) => {
    // Challenge setups (1 User vs 1 AI for focus residual solver)
    let pCards: Card[] = [];
    let oppCards: Card[] = [];
    let title = '';
    let desc = '';

    if (challengeId === 'challenge_1') {
      pCards = [
        { id: 'play_1', suit: Suit.DIAMOND, rank: 4 }, // ♦4
        { id: 'play_2', suit: Suit.HEART, rank: 12 },   // ♥Q
        { id: 'play_3', suit: Suit.SPADE, rank: 15 },   // ♠2
      ];
      oppCards = [
        { id: 'opp_1', suit: Suit.SPADE, rank: 13 }, // ♠K
        { id: 'opp_2', suit: Suit.CLUB, rank: 13 },  // ♣K
      ];
      title = '黑桃二的驚天逆襲';
      desc = '今日對抗：高雄發哥（殘局守門員）';
    } else if (challengeId === 'challenge_2') {
      pCards = [
        { id: 'play_4', suit: Suit.CLUB, rank: 3 },    // ♣3
        { id: 'play_5', suit: Suit.SPADE, rank: 12 },  // ♠Q
        { id: 'play_6', suit: Suit.HEART, rank: 15 },  // ♥2
      ];
      oppCards = [
        { id: 'opp_3', suit: Suit.HEART, rank: 12 }, // ♥Q
        { id: 'opp_4', suit: Suit.DIAMOND, rank: 12 }, // ♦Q
      ];
      title = '梅花三的絕地反擊';
      desc = '今日對抗：三重老皮（單挑新手考驗）';
    } else {
      // challenge_3
      pCards = [
        { id: 'play_7', suit: Suit.SPADE, rank: 14 },  // ♠A
        { id: 'play_8', suit: Suit.HEART, rank: 14 },  // ♥A
        { id: 'play_9', suit: Suit.CLUB, rank: 15 },   // ♣2
      ];
      oppCards = [
        { id: 'opp_5', suit: Suit.SPADE, rank: 13 }, // ♠K
        { id: 'opp_6', suit: Suit.HEART, rank: 13 }, // ♥K
        { id: 'opp_7', suit: Suit.DIAMOND, rank: 13 }, // ♦K
        { id: 'opp_8', suit: Suit.SPADE, rank: 10 }, // ♠10
        { id: 'opp_9', suit: Suit.CLUB, rank: 10 }, // ♣10
      ];
      title = '鐵支破壞狂';
      desc = '今日對抗：東區大老二至尊（高難度算牌局）';
    }

    const testPlayers: Player[] = [
      {
        id: 'p0',
        name: userDisplayName || '神秘牌客',
        avatar: '🎴',
        title: userTitle || '殘局挑戰者',
        cardsCount: pCards.length,
        isAi: false,
        score: userScore,
        cards: sortCards(pCards),
        lastAction: '',
      },
      {
        id: 'p2',
        name: challengeId === 'challenge_1' ? '高雄發哥' : challengeId === 'challenge_2' ? '三重老皮' : '東區大老二至尊',
        avatar: '🕶️',
        title: '殘局考驗官',
        cardsCount: oppCards.length,
        isAi: true,
        score: 8900,
        cards: sortCards(oppCards),
        lastAction: '',
      },
    ];

    setPlayers(testPlayers);
    setDesk(null);
    setSelectedCards([]);
    setConsecutivePasses(0);
    setIsFirstTurn(false); // Challenge typically starts directly
    setGameState('playing');
    setTurnIndex(0); // Player turns first to solve!
    
    setPlayLogs([
      `⚔️ [殘局挑戰開始]：${title}`,
      `📢 ${desc}`,
      `💡 請謹慎出第一張牌，並想辦法在回合限制內擊敗守門員過關！`,
    ]);

    triggerSpeech('p0', '殘局已布好，看我如何一劍封喉！');
  };

  // Auto trigger computer turns
  useEffect(() => {
    if (gameState !== 'playing' || turnIndex === -1) return;

    const activePlayer = players[turnIndex];
    if (!activePlayer) return;

    if (activePlayer.isAi) {
      setIsAiThinking(true);
      const thinkTime = Math.random() * 600 + 700; // Simulated latency for fluid realism

      const timer = setTimeout(() => {
        executeAiTurn(activePlayer);
      }, thinkTime);

      return () => clearTimeout(timer);
    }
  }, [turnIndex, gameState, players]);

  // Handle AI Player Turn
  const executeAiTurn = (ai: Player) => {
    setIsAiThinking(false);

    // AI Selects cards
    const aiPlay = getAiPlay(ai.cards, desk, isFirstTurn && players.length === 4);

    if (aiPlay && aiPlay.length > 0) {
      const evaluation = evaluateHand(aiPlay);
      
      // Remove cards from AI
      const remainingCards = ai.cards.filter((c) => !aiPlay.some((ap) => ap.id === c.id));
      
      // Update players array
      const updatedPlayers = players.map((p) => {
        if (p.id === ai.id) {
          return {
            ...p,
            cards: remainingCards,
            cardsCount: remainingCards.length,
            lastAction: `出牌: ${evaluation.type}`,
          };
        }
        return p;
      });

      // Sound FX
      gameAudio.playCardPlay();

      setDesk(evaluation);
      setConsecutivePasses(0);
      setIsFirstTurn(false);

      // Generate card description string
      const cardsDesc = aiPlay.map((c) => `${c.suit}${getRankLabel(c.rank)}`).join(', ');
      
      const nextLogs = [
        ...playLogs,
        `🥊 [${ai.name}] 出牌：[${evaluation.type}] (${cardsDesc})`,
      ];
      setPlayLogs(nextLogs);

      // Taiwanese reaction
      if (remainingCards.length === 1) {
        triggerSpeech(ai.id, '各位鄉親！只剩一張！聽牌啦！');
      } else if (Math.random() > 0.6) {
        const randomSlang = TAIWAN_SLANG[Math.floor(Math.random() * TAIWAN_SLANG.length)];
        triggerSpeech(ai.id, randomSlang);
      }

      setPlayers(updatedPlayers);

      // Check win condition
      if (remainingCards.length === 0) {
        setGameState('lose');
        gameAudio.playLose();
        return;
      }

      // Move turn
      const nextTurnIdx = (turnIndex + 1) % players.length;
      setTurnIndex(nextTurnIdx);
    } else {
      // AI Passes
      const updatedPlayers = players.map((p) => {
        if (p.id === ai.id) {
          return { ...p, lastAction: '過牌 (Pass)' };
        }
        return p;
      });

      // Sound FX
      gameAudio.playPass();

      const nextPassesVal = consecutivePasses + 1;
      setConsecutivePasses(nextPassesVal);

      const nextLogs = [...playLogs, `💨 [${ai.name}] 選擇過牌 (Pass)`];
      setPlayLogs(nextLogs);

      triggerSpeech(ai.id, '這手跟不起，過！下一位請～');

      setPlayers(updatedPlayers);

      // Check if everybody else passed, giving free turn
      const totalOpponents = players.length - 1;
      if (nextPassesVal >= totalOpponents) {
        const nextTurnIdx = (turnIndex + 1) % players.length;
        setDesk(null); // Clear desk
        setConsecutivePasses(0);
        setTurnIndex(nextTurnIdx);
        
        const leaderName = players[nextTurnIdx].isAi ? players[nextTurnIdx].name : '你';
        setPlayLogs([...nextLogs, `🌟 所有牌桌玩家均過牌！[${leaderName}] 奪回出牌主動權！`]);
      } else {
        const nextTurnIdx = (turnIndex + 1) % players.length;
        setTurnIndex(nextTurnIdx);
      }
    }
  };

  // Toggle card selection in user's UI
  const handleCardClick = (card: Card) => {
    setSelectedCards((prev) => {
      const isSelected = prev.some((c) => c.id === card.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== card.id);
      } else {
        return [...prev, card];
      }
    });
  };

  // User submits selected cards
  const handlePlaySelected = () => {
    if (selectedCards.length === 0) return;

    const user = players[0];
    if (!user) return;

    const isFirstOfAll = isFirstTurn && players.length === 4;
    const legal = isValidMove(selectedCards, desk, isFirstOfAll);

    if (!legal) {
      triggerSpeech('p0', '這不符合台灣大老二牌型規範、或是點數不夠大喔！再想想？');
      return;
    }

    // Play is legal
    const hand = evaluateHand(selectedCards);
    const remainingCards = user.cards.filter((c) => !selectedCards.some((sc) => sc.id === c.id));

    const updatedPlayers = players.map((p) => {
      if (p.id === 'p0') {
        return {
          ...p,
          cards: remainingCards,
          cardsCount: remainingCards.length,
          lastAction: `出牌: ${hand.type}`,
        };
      }
      return p;
    });

    gameAudio.playCardPlay();

    setDesk(hand);
    setConsecutivePasses(0);
    setIsFirstTurn(false);
    setSelectedCards([]);

    const cardsDesc = selectedCards.map((c) => `${c.suit}${getRankLabel(c.rank)}`).join(', ');
    const nextLogs = [...playLogs, `🔥 你打出：[${hand.type}] (${cardsDesc})`];
    setPlayLogs(nextLogs);

    triggerSpeech('p0', `吃我的 ${hand.type} 啦！`);

    setPlayers(updatedPlayers);

    // Check victory
    if (remainingCards.length === 0) {
      if (dailyChallengeActiveId) {
        setGameState('solved');
        gameAudio.playChallengeSuccess();
        if (onChallengeComplete) {
          onChallengeComplete(dailyChallengeActiveId);
        }
        // Reward 150 points for solving challenge successfully!
        onGameWin(150, '殘局破局大空頭');
      } else {
        setGameState('win');
        gameAudio.playWin();
        // Reward points according to standard formula: win counts cards left of others
        let pointsEarned = 100;
        updatedPlayers.slice(1).forEach((ai) => {
          pointsEarned += ai.cardsCount * 10;
        });
        onGameWin(pointsEarned, '東區大老二至尊');
      }
      return;
    }

    // Pass turn to next
    const nextTurnIdx = (turnIndex + 1) % players.length;
    setTurnIndex(nextTurnIdx);
  };

  // User skips / passes turn
  const handlePass = () => {
    if (desk === null) {
      triggerSpeech('p0', '現在是你拿主牌開局，不能過牌喔！打一張最小的也行！');
      return;
    }

    const updatedPlayers = players.map((p) => {
      if (p.id === 'p0') {
        return { ...p, lastAction: '過牌 (Pass)' };
      }
      return p;
    });

    gameAudio.playPass();

    const nextPassesVal = consecutivePasses + 1;
    setConsecutivePasses(nextPassesVal);

    const nextLogs = [...playLogs, '💨 你選擇過牌 (Pass)'];
    setPlayLogs(nextLogs);

    triggerSpeech('p0', '這把戰術迴避，大牌留著等下大合唱！');

    setPlayers(updatedPlayers);

    // Check if everybody else passed, giving free turn to next
    const totalOpponents = players.length - 1;
    if (nextPassesVal >= totalOpponents) {
      const nextTurnIdx = (turnIndex + 1) % players.length;
      setDesk(null); // Clear desk
      setConsecutivePasses(0);
      setTurnIndex(nextTurnIdx);
      
      const leaderName = players[nextTurnIdx].isAi ? players[nextTurnIdx].name : '你';
      setPlayLogs([...nextLogs, `🌟 所有牌桌玩家均過牌！[${leaderName}] 奪回出牌主動權！`]);
    } else {
      const nextTurnIdx = (turnIndex + 1) % players.length;
      setTurnIndex(nextTurnIdx);
    }
  };

  const currentActivePlayer = turnIndex !== -1 ? players[turnIndex] : null;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 rounded-2xl p-4 md:p-6 shadow-2xl border border-emerald-500/20 max-w-5xl mx-auto">
      {/* Top dashboard header */}
      <div className="flex flex-col sm:flex-row justify-between items-center pb-4 mb-4 border-b border-emerald-500/10 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
            {dailyChallengeActiveId ? <Swords size={24} className="animate-pulse" /> : <Award size={24} />}
          </div>
          <div>
            <h3 className="font-bold text-lg text-white font-sans flex items-center gap-2">
              {dailyChallengeActiveId ? '🏆 台灣大老二・殘局特訓' : '🎮 台味大老二・急速開局'}
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal">
                {dailyChallengeActiveId ? '今日殘局' : 'AI 對戰中'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              {dailyChallengeActiveId ? '挑戰成功將解鎖專屬頭銜並追加 +150 排行積分！' : '與全台高強度 AI 即時切磋，體會頂級流暢對決。'}
            </p>
          </div>
        </div>

        {/* Audio controller and reset buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSound}
            className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${
              soundOn
                ? 'bg-slate-800 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={soundOn ? '不聽台語配音（靜音）' : '開啟台式配音（音效）'}
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          
          <button
            onClick={dailyChallengeActiveId ? () => initChallengeGame(dailyChallengeActiveId) : initNormalGame}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-705 border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-medium text-white transition-all cursor-pointer"
          >
            <RotateCcw size={14} />
            {gameState === 'idle' ? '分發手牌' : '重新洗牌'}
          </button>
        </div>
      </div>

      {/* Main card felt table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Playboard stage (Takes 3 cols on desktop for wide feeling) */}
        <div className="lg:col-span-3 flex flex-col justify-between bg-emerald-900/40 rounded-xl p-4 md:p-6 border border-emerald-500/10 min-h-[460px] relative overflow-hidden backdrop-blur-sm">
          
          {gameState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md z-10 p-6 text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md"
              >
                <div className="text-5xl mb-4 text-emerald-400 flex justify-center gap-2">
                  <span>♠</span>
                  <span>♥</span>
                  <span>♣</span>
                  <span>♦</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-2 font-sans">
                  {dailyChallengeActiveId ? '準備好破解今日殘局了嗎？' : '精雕細琢・最台味的大老二對決'}
                </h4>
                <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                  {dailyChallengeActiveId 
                    ? '每日精選死局，測試你的智謀、邏輯算牌，並用精準的操作解鎖神級頭銜！'
                    : '極致流暢的卡牌互動、秒級 AIHeuristics 反應，融合道地爆笑對白，挑戰你的大老二勝率極限！'}
                </p>
                <button
                  onClick={dailyChallengeActiveId ? () => initChallengeGame(dailyChallengeActiveId) : initNormalGame}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all text-sm w-full justify-center md:w-auto mx-auto cursor-pointer"
                >
                  <Play size={16} />
                  {dailyChallengeActiveId ? '開始破解殘局' : '立即洗牌開局'}
                </button>
              </motion.div>
            </div>
          )}

          {/* Render victory or defeat screen overlying game table */}
          {(gameState === 'win' || gameState === 'lose' || gameState === 'solved') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md z-10 p-6 text-center">
              <motion.div
                initial={{ scale: 0.8, fillOpacity: 0 }}
                animate={{ scale: 1, fillOpacity: 1 }}
                className="max-w-md p-6 bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl"
              >
                {gameState === 'win' && (
                  <>
                    <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-bounce">
                      👑
                    </div>
                    <h3 className="text-2xl font-bold text-yellow-400 font-sans mb-2">
                      恭喜獲勝！你贏了！
                    </h3>
                    <p className="text-sm text-slate-300 mb-6">
                      這手牌打得簡直是完美無缺！成功擊垮東區大老二至尊與其他牌友。
                    </p>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-6 text-emerald-300 text-xs font-mono">
                      ✨ 積分獎勵：+150 積分 | 解鎖成就：【西門町牌神】
                    </div>
                  </>
                )}

                {gameState === 'solved' && (
                  <>
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-ping">
                      <CheckCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-400 font-sans mb-2">
                      殘局挑戰成功！
                    </h3>
                    <p className="text-sm text-slate-300 mb-6">
                      完美的下牌邏輯，成功突破守門員防線！恭喜你拿下了今日最高榮譽。
                    </p>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-6 text-emerald-300 text-xs font-mono">
                      🏅 殘局特訓包解鎖：+150 積分 | 頭銜更新：【大老二神算大老】
                    </div>
                  </>
                )}

                {gameState === 'lose' && (
                  <>
                    <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                      💀
                    </div>
                    <h3 className="text-2xl font-bold text-red-500 font-sans mb-2">
                      可惜了，再接再厲！
                    </h3>
                    <p className="text-sm text-slate-300 mb-6">
                      AI 在計算方面展現了無情威力。別氣餒，大老二世界成敗自古有之，深吸一口氣重新算牌！
                    </p>
                  </>
                )}

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={dailyChallengeActiveId ? () => initChallengeGame(dailyChallengeActiveId) : initNormalGame}
                    className="px-5 py-2.5 bg-emerald-550 hover:bg-emerald-500 text-white font-medium rounded-xl text-xs transition-all border border-emerald-400/20 cursor-pointer"
                  >
                    再玩一局
                  </button>
                  <button
                    onClick={() => setGameState('idle')}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition-all border border-slate-700 cursor-pointer"
                  >
                    返回桌面
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Render visual poker table slots */}
          {gameState === 'playing' && players.length > 0 && (
            <div className="w-full h-full flex flex-col justify-between gap-6 relative">
              
              {/* Top Row: AI Player 2 */}
              {players.length === 4 && (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
                      turnIndex === 2 ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md' : 'bg-slate-900/80 border-slate-800 text-slate-300'
                    }`}>
                      <span className="text-base">{players[2].avatar}</span>
                      <div className="text-left text-xs">
                        <div className="font-bold max-w-[80px] truncate">{players[2].name}</div>
                        <div className="text-[10px] text-slate-400">剩餘 {players[2].cardsCount} 張</div>
                      </div>
                    </div>

                    {/* Speech bubble for top AI */}
                    <AnimatePresence>
                      {playerSpeech[players[2].id] && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-slate-900 border border-slate-200 text-xs px-3 py-1.5 rounded-xl whitespace-nowrap shadow-xl z-20 font-medium"
                        >
                          💬 {playerSpeech[players[2].id]}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Middle Row: Left AI | Desk Center | Right AI */}
              <div className="flex justify-between items-center w-full my-auto py-2">
                
                {/* Left AI (p3 for normal, skipped for challenge, or p2 for challenge) */}
                <div className="w-[100px] flex justify-center text-center">
                  {players.length === 4 ? (
                    <div className="relative">
                      <div className={`p-2 rounded-xl border flex flex-col items-center transition-colors ${
                        turnIndex === 3 ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md animate-pulse' : 'bg-slate-900/80 border-slate-800 text-slate-300'
                      }`}>
                        <span className="text-3xl mb-1">{players[3].avatar}</span>
                        <div className="font-bold text-xs max-w-[88px] truncate">{players[3].name}</div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 mt-1">
                          {players[3].cardsCount} 張牌
                        </span>
                      </div>

                      {/* Left AI Speech */}
                      <AnimatePresence>
                        {playerSpeech[players[3].id] && (
                          <motion.div
                            initial={{ opacity: 0, x: 10, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-white text-slate-900 border border-slate-200 text-xs px-2.5 py-1.5 rounded-xl max-w-[140px] shadow-xl z-20 font-medium"
                          >
                            💬 {playerSpeech[players[3].id]}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    // Challenge Opponent Side Display (always left/p2)
                    <div className="relative">
                      <div className={`p-2.5 rounded-xl border flex flex-col items-center transition-colors ${
                        turnIndex === 1 ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md animate-pulse' : 'bg-slate-900/80 border-slate-800 text-slate-300'
                      }`}>
                        <span className="text-3xl mb-1">{players[1].avatar}</span>
                        <div className="font-bold text-xs max-w-[88px] truncate">{players[1].name}</div>
                        <span className="text-[10px] bg-red-500/10 text-red-400 px-1 rounded-full mt-1 font-mono">
                          殘局剩 {players[1].cardsCount} 張
                        </span>
                      </div>
                      
                      {/* Challenge Opponent Speech */}
                      <AnimatePresence>
                        {playerSpeech[players[1].id] && (
                          <motion.div
                            initial={{ opacity: 0, x: 10, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-white text-slate-900 border border-slate-200 text-xs px-2.5 py-1.5 rounded-xl max-w-[140px] shadow-xl z-20 font-medium"
                          >
                            💬 {playerSpeech[players[1].id]}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Desk center piles */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-[140px] p-3 rounded-xl border border-dashed border-emerald-500/10 bg-emerald-950/20 relative mx-4">
                  {isAiThinking && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 text-xs text-amber-300 font-sans px-2 py-0.5 rounded bg-amber-500/10 animate-pulse">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                      對手思考中...
                    </div>
                  )}

                  {desk ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-[11px] font-mono font-semibold tracking-wider text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1">
                        ♠ 最強壓案：{desk.type}
                      </div>
                      
                      {/* Cards visual layout in center */}
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {desk.cards.map((c, idx) => (
                          <CardView key={c.id} card={c} size="sm" disabled />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-3">
                      <HelpCircle size={32} className="mx-auto text-emerald-600/60 mb-1.5" />
                      <div className="text-slate-400 text-xs font-sans">
                        {consecutivePasses > 0 
                          ? `已連續 ${consecutivePasses} 人過牌` 
                          : '牌桌目前空空如也'}
                      </div>
                      <div className="text-[10px] text-emerald-500/40 mt-1 font-sans">
                        任意出牌主導權在：{currentActivePlayer?.isAi ? currentActivePlayer.name : '你'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right AI (p1 for normal, empty space for challenge) */}
                <div className="w-[100px] flex justify-center text-center">
                  {players.length === 4 ? (
                    <div className="relative">
                      <div className={`p-2 rounded-xl border flex flex-col items-center transition-colors ${
                        turnIndex === 1 ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md animate-pulse' : 'bg-slate-900/80 border-slate-800 text-slate-300'
                      }`}>
                        <span className="text-3xl mb-1">{players[1].avatar}</span>
                        <div className="font-bold text-xs max-w-[88px] truncate">{players[1].name}</div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 mt-1">
                          {players[1].cardsCount} 張牌
                        </span>
                      </div>

                      {/* Right AI Speech */}
                      <AnimatePresence>
                        {playerSpeech[players[1].id] && (
                          <motion.div
                            initial={{ opacity: 0, x: -10, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute right-full top-1/2 -translate-y-1/2 mr-2 bg-white text-slate-900 border border-slate-200 text-xs px-2.5 py-1.5 rounded-xl max-w-[140px] shadow-xl z-20 font-medium whitespace-normal"
                          >
                            💬 {playerSpeech[players[1].id]}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    // In challenge we can keep an empty element for perfect visual balance
                    <div className="text-xs text-slate-500 border border-slate-800/10 p-3 rounded-lg bg-slate-950/20 w-[90px]">
                      🤝 單挑局
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom Row: Human User */}
              <div className="w-full mt-auto">
                <div className="flex flex-col items-center gap-3">
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${turnIndex === 0 ? 'bg-amber-400 animate-ping' : 'bg-slate-700'}`} />
                    <span className="text-xs font-sans font-medium text-slate-300">
                      {turnIndex === 0 ? '💡 已輪到你出手！選擇符合牌型的組合，點擊「出牌」' : '⏳ 對手正在組織策略，靜靜等待下一輪...'}
                    </span>
                  </div>

                  {/* Card fan layer */}
                  <div className="relative pt-4 pb-2 w-full max-w-xl mx-auto flex items-center justify-center">
                    <div className="flex flex-wrap justify-center gap-[-20px] max-w-full translation-all duration-300 transform scale-100 p-2 border border-emerald-500/10 rounded-xl bg-slate-950/40">
                      {players[0].cards.map((card, idx) => (
                        <div
                          key={card.id}
                          style={{ marginLeft: idx > 0 ? '-14px' : '0' }}
                          className="transition-all"
                        >
                          <CardView
                            card={card}
                            selected={selectedCards.some((sc) => sc.id === card.id)}
                            onClick={() => handleCardClick(card)}
                            size="md"
                            animateIndex={idx}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* User action cluster buttons */}
                  <div className="flex items-center gap-3.5 z-10 my-1">
                    <button
                      disabled={turnIndex !== 0}
                      onClick={handlePlaySelected}
                      className={`px-5 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition-all cursor-pointer ${
                        turnIndex === 0 && selectedCards.length > 0
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20 active:scale-95'
                          : 'bg-slate-800 cursor-not-allowed text-slate-500 border border-slate-750'
                      }`}
                    >
                      🚀 出牌
                    </button>
                    
                    <button
                      disabled={turnIndex !== 0 || desk === null}
                      onClick={handlePass}
                      className={`px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        turnIndex === 0 && desk !== null
                          ? 'bg-slate-800 border-slate-750 hover:bg-slate-700 hover:border-slate-600 active:scale-95 text-slate-300'
                          : 'bg-slate-900 cursor-not-allowed text-slate-600 border-slate-800'
                      }`}
                    >
                      💨 過牌 (Pass)
                    </button>

                    <button
                      onClick={() => setSelectedCards([])}
                      disabled={selectedCards.length === 0}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                        selectedCards.length > 0 ? 'text-rose-400 hover:bg-rose-500/10' : 'text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      重選
                    </button>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>

        {/* Live log & diagnostics (Takes 1 col on desktop for modular look) */}
        <div className="lg:col-span-1 flex flex-col justify-between bg-slate-900 rounded-xl border border-slate-800 p-3 min-h-[360px]">
          
          {/* Logs container header */}
          <div>
            <div className="text-xs font-bold text-slate-400 font-sans tracking-wide uppercase px-2 py-1 flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <span>戰局即時日誌</span>
              <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
            </div>

            <div
              ref={logContainerRef}
              className="space-y-2 max-h-[300px] overflow-y-auto pr-1 text-[11px] font-mono leading-relaxed"
            >
              {playLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-8">無最新對戰記錄</div>
              ) : (
                playLogs.map((log, index) => {
                  let logColor = 'text-slate-400';
                  if (log.includes('你打出')) logColor = 'text-emerald-400 font-semibold';
                  if (log.includes('過牌')) logColor = 'text-slate-500';
                  if (log.includes('出牌')) logColor = 'text-teal-300';
                  if (log.includes('!')) logColor = 'text-amber-400';

                  return (
                    <div key={index} className={`p-1 rounded bg-slate-950/20 border-l border-slate-800 pl-2 ${logColor}`}>
                      {log}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* User local stats panel */}
          <div className="border-t border-slate-850 pt-3 mt-3 bg-slate-950/40 p-2.5 rounded-lg">
            <div className="text-xs font-bold text-slate-300 font-sans mb-1.5 flex items-center gap-1.5">
              💡 我的桌邊屬性
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">目前暱稱</div>
                <div className="text-xs font-bold text-white truncate max-w-full">{userDisplayName || '牌桌小白'}</div>
              </div>
              
              <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">當前稱號</div>
                <div className="text-xs font-bold text-amber-400 truncate max-w-full">{userTitle || '初心者'}</div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 mt-2 font-sans leading-normal">
              透過獲勝或解答精選殘局，提升排位積分，將直接回傳至全網排行榜！
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
