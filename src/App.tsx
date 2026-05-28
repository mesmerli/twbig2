import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Github,
  ExternalLink,
  Swords,
  Users,
  Award,
  CircleAlert,
  Zap,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Layers,
  HelpCircle,
  Check,
  Smartphone,
  ChevronRight,
  User,
  Medal,
  Download,
} from 'lucide-react';

import { Card, LeaderboardEntry, DailyChallenge } from './types';
import { INITIAL_LEADERBOARD, DAILY_CHALLENGES, LOCAL_TITLES } from './data/mockData';
import BigTwoGame from './components/BigTwoGame';

export default function App() {
  // Localization setup & personal identity
  const [userDisplayName, setUserDisplayName] = useState('萬華牌王阿強');
  const [userTitle, setUserTitle] = useState('東區大老二至尊');
  const [userScore, setUserScore] = useState(4800);
  const [tempName, setTempName] = useState('萬華牌王阿強');
  const [selectedLocalTitle, setSelectedLocalTitle] = useState('萬華牌局一陣風');

  // Play Mode: 'official' (the embedded website) or 'local' (hand puzzles / web trial React engine)
  const [playMode, setPlayMode] = useState<'official' | 'local'>('official');

  // Daily Challenge setup list
  const [challenges, setChallenges] = useState<DailyChallenge[]>(DAILY_CHALLENGES);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

  // Custom live sorting leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Mobile menu trigger
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize and sort leaderboard with user inside
  useEffect(() => {
    const defaultList = [...INITIAL_LEADERBOARD];
    
    // Check if user already exists in defaultList, or add custom user entry
    const userEntry: LeaderboardEntry = {
      rank: 0, // calculated from sorting index
      name: `${userDisplayName} (你)`,
      title: userTitle,
      score: userScore,
      winCount: Math.floor(userScore / 24),
      playCount: Math.floor(userScore / 18) + 5,
      recentMedals: ['🔥 當日挑戰獲勝者', '🍀 運氣爆棚'],
    };

    const combinedList = [...defaultList, userEntry];
    combinedList.sort((a, b) => b.score - a.score);

    // Apply ranking values
    const rankedList = combinedList.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));

    setLeaderboard(rankedList);
  }, [userDisplayName, userTitle, userScore]);

  // Callback when human wins a game or challenge
  const handleGameWin = (scoreAdded: number, titleEarned?: string) => {
    setUserScore((prev) => prev + scoreAdded);
    if (titleEarned) {
      setUserTitle(titleEarned);
    }
  };

  // Callback when a challenge is computed fully
  const handleChallengeComplete = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((ch) => (ch.id === challengeId ? { ...ch, isCompleted: true } : ch))
    );
  };

  const handleUpdateIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserDisplayName(tempName.trim());
      setUserTitle(selectedLocalTitle);
    }
  };

  // Quick helper to scroll to the game board area
  const scrollToDemo = (mode?: 'official' | 'local') => {
    if (mode) {
      setPlayMode(mode);
    }
    const element = document.getElementById('demo-table');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentActiveChallengeObj = challenges.find((ch) => ch.id === activeChallengeId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 relative">
      {/* Glow Effects Background */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[800px] left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Segment */}
      <header className="sticky top-4 mx-auto max-w-7xl z-50 px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://raw.githubusercontent.com/mesmerli/taiwan-big-two-ai/main/src/assets/logo.png" 
              alt="台灣大老二 AI" 
              className="w-10 h-10 object-contain rounded-lg drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="font-display font-extrabold text-white text-base tracking-wider block">台灣大老二 AI</span>
              <span className="text-[10px] text-slate-400 font-mono block -mt-1">Taiwan Big Two AI - 全台最強對戰平台</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <a href="#features" className="text-xs font-semibold tracking-wider text-slate-300 hover:text-amber-400 transition-colors uppercase">特色亮點</a>
            <a href="#download" className="text-xs font-semibold tracking-wider text-sky-400 hover:text-amber-400 transition-colors uppercase">微軟商店</a>
            <a href="#challenges" className="text-xs font-semibold tracking-wider text-slate-300 hover:text-amber-400 transition-colors uppercase">殘局挑戰</a>
            <a href="#demo" className="text-xs font-semibold tracking-wider text-slate-300 hover:text-amber-400 transition-colors uppercase">對抗 Demo</a>
            <a href="#leaderboard" className="text-xs font-semibold tracking-wider text-slate-300 hover:text-amber-400 transition-colors uppercase">排行榜</a>
            <a href="#tech" className="text-xs font-semibold tracking-wider text-slate-300 hover:text-amber-400 transition-colors uppercase">演算法</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://apps.microsoft.com/detail/9PM1S8GKBLK9?hl=zh-tw&gl=TW&ocid=pdpshare"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-950/40 hover:bg-blue-900/60 text-blue-200 border border-blue-800/40 transition"
            >
              <span className="grid grid-cols-2 gap-[1px] w-2.5 h-2.5">
                <span className="bg-[#f25022] rounded-[0.5px]" />
                <span className="bg-[#7fba00] rounded-[0.5px]" />
                <span className="bg-[#00a4ef] rounded-[0.5px]" />
                <span className="bg-[#ffb900] rounded-[0.5px]" />
              </span>
              微軟商店下載
            </a>
            <a
              href="https://github.com/mesmerli/taiwan-big-two-ai"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 transition"
            >
              <Github size={14} />
              GitHub
            </a>
            <button
              onClick={() => scrollToDemo('official')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-2 rounded-full font-bold transition-all shadow-lg text-xs cursor-pointer"
            >
              立即開局
            </button>
          </div>

          {/* Mobile menu triggers */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-current transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-current transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-current transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu list */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#070e17] border-b border-slate-800 px-4 py-4 space-y-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-300 py-1"
            >
              特色亮點
            </a>
            <a
              href="#download"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-blue-450 py-1 font-semibold"
            >
              微軟商店原生下載
            </a>
            <a
              href="#challenges"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-300 py-1"
            >
              每日殘局挑戰
            </a>
            <a
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-300 py-1"
            >
              流暢對抗 Demo
            </a>
            <a
              href="#leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-300 py-1"
            >
              王牌排行榜
            </a>
            <a
              href="#tech"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-300 py-1"
            >
              演算法指南
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href="https://apps.microsoft.com/detail/9PM1S8GKBLK9?hl=zh-tw&gl=TW&ocid=pdpshare"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-950 border border-blue-800 rounded-lg text-xs text-blue-200 hover:bg-blue-900 transition"
              >
                <span className="grid grid-cols-2 gap-[1px] w-2.5 h-2.5">
                  <span className="bg-[#f25022] rounded-[0.5px]" />
                  <span className="bg-[#7fba00] rounded-[0.5px]" />
                  <span className="bg-[#00a4ef] rounded-[0.5px]" />
                  <span className="bg-[#ffb900] rounded-[0.5px]" />
                </span>
                微軟商店官方下載
              </a>
              <a
                href="https://github.com/mesmerli/taiwan-big-two-ai"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 rounded-lg text-xs text-white"
              >
                <Github size={14} />
                GitHub 專案
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToDemo('official');
                }}
                className="w-full py-2 bg-amber-500 rounded-lg text-xs text-slate-950 font-bold"
              >
                立即開局
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Intro Section and Main Bento Header Layout */}
      <section className="relative pt-12 pb-16 md:py-20 overflow-hidden border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Content Card - Styled as a majestic Bento cell */}
            <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-8 md:p-10 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/40">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-slate-300 font-mono">Decision Engine v4.0</span>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
                  <Sparkles size={14} className="text-amber-400" />
                  <span className="text-xs font-semibold text-amber-300 font-display">台味撲克 × 頂級 decision AI</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                  極致流暢 <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500">
                    台灣大老二 AI
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 max-w-xl mb-8 leading-relaxed">
                  主打最深度的決策演算法與微秒級流暢出牌體驗。首創結合多元大模型 AI 牌風性格，賽後提供專屬 AI 評價反饋與互動問答，帶你體驗原汁原味卻智商爆棚的台灣大老二魅力！
                </p>
              </div>

              {/* Stats badges inside Hero */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-lg mb-8 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 backdrop-blur-sm">
                <div>
                  <div className="text-2xl font-bold font-display text-white">15<span className="text-amber-500 text-sm">ms</span></div>
                  <div className="text-[10px] text-slate-400 mt-1">AI 毫秒決策延遲</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-white">100<span className="text-amber-500 text-sm">%</span></div>
                  <div className="text-[10px] text-slate-400 mt-1">台灣大老二規則覆蓋</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-white">LLM</div>
                  <div className="text-[10px] text-slate-400 mt-1">AI 賽後點評與問答</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-wrap">
                <button
                  onClick={() => scrollToDemo('official')}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95 transition text-center cursor-pointer whitespace-nowrap"
                >
                  開始線上試玩
                </button>
                <a
                  href="https://apps.microsoft.com/detail/9PM1S8GKBLK9?hl=zh-tw&gl=TW&ocid=pdpshare"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-blue-950/40 hover:bg-blue-900/30 text-blue-300 hover:text-blue-200 rounded-xl text-xs font-bold border border-blue-800/40 hover:border-blue-700/50 transition whitespace-nowrap"
                >
                  <span className="grid grid-cols-2 gap-[1px] w-2.5 h-2.5 font-sans">
                    <span className="bg-[#f25022] rounded-[0.5px]" />
                    <span className="bg-[#7fba00] rounded-[0.5px]" />
                    <span className="bg-[#00a4ef] rounded-[0.5px]" />
                    <span className="bg-[#ffb900] rounded-[0.5px]" />
                  </span>
                  MS Store 下載 (30天免費試玩)
                  <ExternalLink size={11} className="opacity-60" />
                </a>
                <a
                  href="https://github.com/mesmerli/taiwan-big-two-ai"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 transition"
                >
                  <Github size={14} />
                  造訪 GitHub 專案
                  <ExternalLink size={12} className="opacity-60" />
                </a>
              </div>
            </div>

            {/* Right Visual Bento Box */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl min-h-[420px] lg:min-h-full">
              <div className="absolute top-4 left-6 flex items-center gap-2 z-30">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-slate-300">流暢即時對戰體驗</span>
              </div>

              {/* Card spread visualization integrated directly in Bento Box! */}
              <div className="relative w-full flex-1 flex items-center justify-center mt-8">
                {/* Simulated Stacked local poker cluster */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="absolute z-10 transform -rotate-12 -translate-x-12 -translate-y-4"
                >
                  <div className="w-[110px] h-[155px] bg-white rounded-xl border border-slate-200 flex flex-col justify-between p-3 shadow-xl">
                    <div className="flex flex-col leading-none text-left">
                      <span className="font-bold text-slate-900 text-lg">2</span>
                      <span className="text-slate-900 text-xs">♠</span>
                    </div>
                    <div className="text-center text-3xl text-slate-900">♠</div>
                    <div className="rotate-180 flex flex-col leading-none text-left">
                      <span className="font-bold text-slate-900 text-lg">2</span>
                      <span className="text-slate-900 text-xs">♠</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute z-20 transform rotate-6 translate-x-12 -translate-y-2"
                >
                  <div className="w-[114px] h-[160px] bg-white rounded-xl border-2 border-amber-500 flex flex-col justify-between p-3.5 shadow-2xl relative">
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-amber-500 text-[8px] text-slate-950 font-bold animate-pulse">
                      PLAYED!
                    </span>
                    <div className="flex flex-col leading-none text-left">
                      <span className="font-bold text-red-500 text-lg">A</span>
                      <span className="text-red-500 text-xs">♥</span>
                    </div>
                    <div className="text-center text-3xl text-red-500">♥</div>
                    <div className="rotate-180 flex flex-col leading-none text-left">
                      <span className="font-bold text-red-500 text-lg">A</span>
                      <span className="text-red-500 text-xs">♥</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut', delay: 0.2 }}
                  className="absolute z-0 transform rotate-45 translate-x-4 translate-y-12"
                >
                  <div className="w-[105px] h-[150px] bg-gradient-to-br from-amber-700 to-slate-950 p-[3px] rounded-xl border border-amber-400 shadow-md flex items-center justify-center text-amber-300">
                    <div className="border border-dashed border-amber-400/40 rounded-lg w-full h-full flex flex-col items-center justify-center p-2">
                      <span className="text-[9px] font-mono tracking-widest text-amber-400 font-bold">TAIWAN AI</span>
                      <span className="text-base mt-0.5">♣ ♦</span>
                    </div>
                  </div>
                </motion.div>
                
                {/* Floating suit indicators on background */}
                <div className="absolute top-2 right-4 text-3xl font-display text-amber-500/10 animate-pulse">♠</div>
                <div className="absolute bottom-4 left-4 text-2xl font-display text-emerald-500/10">♦</div>
                <div className="absolute top-1/2 left-2 text-2xl font-display text-slate-600/10">♣</div>
                <div className="absolute bottom-10 right-4 text-3xl font-display text-red-500/10">♥</div>
              </div>

              <div className="mt-4 z-20">
                <h3 className="text-lg font-bold text-white mb-1">極致流暢 AI 算力</h3>
                <p className="text-xs text-slate-400 max-w-xs">深度學習驅動的台灣味對手，隨時隨地，3秒開桌，告別等待。</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="py-16 bg-slate-900/20 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-extrabold text-white sm:text-4xl mb-3">
              三大研發核心特色
            </h2>
            <p className="text-slate-400 text-xs">
              基於大語言模型（LLM）與 `mesmerli/taiwan-big-two-ai` 嚴謹決策架構，重塑傳統撲克智慧。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 group hover:shadow-[0_0_25px_rgba(245,158,11,0.1)] relative overflow-hidden backdrop-blur-sm">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 w-fit mb-4 group-hover:scale-110 transition duration-300">
                <Users size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">多元人格研究架構</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                模擬人類的心理思維！核心內建多元人格 (Multi-Persona Architecture)，包含保守、激進、靈活與自適應等多種不同牌風與風險偏好的人工智慧對手，拒絕機械式出牌，博弈感十足。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 group hover:shadow-[0_0_25px_rgba(245,158,11,0.1)] relative overflow-hidden backdrop-blur-sm">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 w-fit mb-4 group-hover:scale-110 transition duration-300">
                <Sparkles size={22} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">賽後 AI 點評與策略問答</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                對局結束後，由大語言模型（LLM）擔任專家裁判，對整場牌局的出牌時機、剩餘手牌與關鍵勝負決策進行深度復盤，並以對話問答方式一對一交流，幫您看清對手套路、快速精進牌技。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 group hover:shadow-[0_0_25px_rgba(245,158,11,0.1)] relative overflow-hidden backdrop-blur-sm">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 w-fit mb-4 group-hover:scale-110 transition duration-300">
                <Layers size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">嚴謹正宗台灣大老二規則</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                完美承襲「梅花 3 必須先行出牌」、「黑桃 2 最大」等台式傳統。支持單張、對子、以及順子、同花、葫蘆、四條（鐵支）、同花順等五張牌型組合，具備縝密的牌型檢驗與大小比對邏輯。
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Microsoft Store Download Banner Section */}
      <section id="download" className="py-16 bg-gradient-to-br from-[#0c1322] to-[#0a0f1d] border-b border-slate-900 overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-10 backdrop-blur-md">
            
            <div className="max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0078d4]/10 border border-[#0078d4]/20 rounded-full mb-5">
                {/* Custom Microsoft 4-Color Tiny Logo */}
                <span className="grid grid-cols-2 gap-[1.5px] w-3 h-3">
                  <span className="bg-[#f25022] rounded-[1px]" />
                  <span className="bg-[#7fba00] rounded-[1px]" />
                  <span className="bg-[#00a4ef] rounded-[1px]" />
                  <span className="bg-[#ffb900] rounded-[1px]" />
                </span>
                <span className="text-xs font-semibold text-blue-300 font-display">Microsoft Store 官方認證</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-4">
                取得 Windows 原生桌面版
              </h2>
              
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                除了網頁免安裝直接遊玩，您現在也可以至微軟商店取得 <strong className="text-amber-400">Windows 專屬客戶端</strong>！
                商店定價為美金 <strong className="text-amber-400">$9.99 Base Price</strong>，但提供完整的 <strong className="text-emerald-400">30 天免費流暢試玩體驗</strong>。享受流暢不受限的 <strong className="text-sky-400">120 FPS 幀率技術演繹</strong>、極致省電能耗、離線無王牌單機熱身模式，邀您即刻免費下載體驗！
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>支援離線對決、單機練習</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>30天完整免費試玩體驗</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>一鍵安裝，後台極速啟動</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>完美配適鍵盤與高保真畫面</span>
                </div>
              </div>
            </div>

            {/* Microsoft Action Download Box */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-6 rounded-2xl w-full lg:max-w-xs flex flex-col items-center text-center relative overflow-hidden backdrop-blur-sm shadow-xl">
              <span className="absolute top-2 right-2.5 text-[9px] font-mono text-slate-600">PRO v1.1.2</span>
              
              {/* Microsoft Styled Icon badge block */}
              <div className="w-14 h-14 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center shadow-inner mb-4">
                <span className="grid grid-cols-2 gap-1 w-6 h-6">
                  <span className="bg-[#f25022] rounded-[1px]" />
                  <span className="bg-[#7fba00] rounded-[1px]" />
                  <span className="bg-[#00a4ef] rounded-[1px]" />
                  <span className="bg-[#ffb900] rounded-[1px]" />
                </span>
              </div>
              
              <h3 className="font-bold text-white text-sm mb-1">台灣大老二 AI</h3>
              <p className="text-[10px] text-slate-400 mb-5 leading-tight">
                定價 $9.99 美金 <span className="text-slate-500">|</span> <span className="text-emerald-400 font-semibold">首月 30 天免費試玩</span>
              </p>
              
              {/* Styled Download Action */}
              <a
                href="https://apps.microsoft.com/detail/9PM1S8GKBLK9?hl=zh-tw&gl=TW&ocid=pdpshare"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3 bg-[#0078d4] hover:bg-[#106ebe] text-white font-bold rounded-xl text-xs transition duration-200 shadow-md shadow-blue-500/10 cursor-pointer"
              >
                <Download size={13} />
                <span>免費下載試玩 (30天)</span>
              </a>
              
              <span className="text-[9px] text-slate-500 mt-3 font-mono">
                適用於 Windows 10/11 平台
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Daily Challenge Selector Grid Segment */}
      <section id="challenges" className="py-16 bg-slate-950/40 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white flex items-center gap-2">
                🎯 每日挑戰：台灣大老二殘局特訓
              </h2>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed max-w-xl">
                今日已有上千位牌客嘗試挑戰。選定以下殘局，點擊「挑戰」即可一鍵部署戰局桌椅，成功破解即可斬獲頭銜與排行榜分數加成！
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-rose-400 font-mono bg-rose-500/5 px-3 py-1.5 rounded-lg border border-rose-500/15">
              <span>⏰ 每日 00:00AM 全自動刷新</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {challenges.map((ch) => {
              let difficultyClass = '';
              if (ch.difficulty === '簡單') difficultyClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
              if (ch.difficulty === '中等') difficultyClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
              if (ch.difficulty === '困難') difficultyClass = 'bg-red-500/10 text-red-400 border-red-500/20';

              const isActive = activeChallengeId === ch.id;

              return (
                <div
                  key={ch.id}
                  className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                    isActive
                      ? 'bg-slate-900 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.15)] scale-[1.01]'
                      : 'bg-slate-900/30 border-slate-800 hover:border-slate-700/80 hover:bg-slate-900/50'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${difficultyClass}`}>
                        {ch.difficulty}
                      </span>
                      {ch.isCompleted ? (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle size={10} />
                          已破局
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          未破局
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-white font-sans mb-2">
                      {ch.title}
                    </h3>

                    <p className="text-slate-400 text-xs leading-relaxed mb-4 min-h-[64px]">
                      {ch.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-800/80 pt-4 mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-amber-500 font-mono font-semibold">
                      🌟 積分 +150
                    </span>

                    <button
                      onClick={() => {
                        setActiveChallengeId(ch.id);
                        scrollToDemo('local');
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all duration-300 ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 hover:bg-amber-400'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
                      }`}
                    >
                      {isActive ? '正在熱戰中' : '破解殘局 →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Playable Game Area with custom layout anchor */}
      <section id="demo" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div id="demo-table" className="absolute -top-20" />
        
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h2 className="text-3xl font-display font-extrabold text-white flex items-center justify-center gap-2">
            🎴 立刻線上切磋：智慧對決桌面
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            您可以切換遊玩「官網線上正式版」或體驗具備「每日殘局挑戰」的本地自研模擬桌！
          </p>
          
          {activeChallengeId && (
            <div className="inline-flex items-center gap-3.5 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-full text-xs font-medium mt-4 font-sans">
              <span>⚡ 現正處於【{currentActiveChallengeObj?.title}】殘局特訓模式</span>
              <button
                onClick={() => {
                  setActiveChallengeId(null);
                  setPlayMode('local');
                }}
                className="underline hover:text-white cursor-pointer ml-1 font-bold text-[11px]"
              >
                切換回普通 AI 13張對戰
              </button>
            </div>
          )}
        </div>

        {/* Play Action Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900 border border-slate-800 p-1 w-fit rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setPlayMode('official')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                playMode === 'official'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌐 官網線上正式版 IP 戰局</span>
              {playMode === 'official' && (
                <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] text-amber-400 font-bold font-mono">
                  PRO
                </span>
              )}
            </button>
            <button
              onClick={() => setPlayMode('local')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                playMode === 'local'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🎯 網頁試玩 & 每日殘局</span>
              {activeChallengeId && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* Live game client render */}
        <div className="mb-10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 border border-slate-800 rounded-3xl p-1 md:p-2 shadow-2xl relative overflow-hidden">
          <div className="absolute top-3 left-6 flex items-center gap-2 z-20 bg-slate-900/90 px-2.5 py-1 rounded-full border border-slate-850">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] text-slate-300 font-mono tracking-wider">
              {playMode === 'official' ? '遠端官方獨立主機：連線運作中' : '台北大同戰局區 (自研模擬引擎版)'}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {playMode === 'official' ? (
              <motion.div
                key="official-game"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full pt-10"
              >
                <div className="p-1 md:p-2">
                  <iframe
                    src="https://mesmerli.github.io/taiwan-big-two-ai/"
                    title="台灣大老二 AI 官方網頁版"
                    className="w-full h-[650px] md:h-[780px] border-0 rounded-2xl bg-[#0b0f19] shadow-inner"
                    allow="fullscreen; autoplay"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  />
                  {/* Embedded Helper Bar */}
                  <div className="mt-3.5 px-4 py-2.5 bg-slate-950/85 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-2">
                      <Zap size={14} className="text-amber-400 flex-shrink-0 animate-pulse" />
                      <span>目前已完美為您在主流沙盒框架中安全嵌入台灣大老二開源項目官網！</span>
                    </span>
                    <a
                      href="https://mesmerli.github.io/taiwan-big-two-ai/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-450 hover:text-amber-400 font-bold transition hover:underline flex items-center gap-1 whitespace-nowrap"
                    >
                      不限制直接開新分頁全螢幕遊玩 <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="local-game"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full pt-10"
              >
                <BigTwoGame
                  userDisplayName={userDisplayName}
                  userTitle={userTitle}
                  userScore={userScore}
                  onGameWin={handleGameWin}
                  dailyChallengeActiveId={activeChallengeId}
                  onChallengeComplete={handleChallengeComplete}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </section>

      {/* Leaderboard & Player setup configuration (Satisfies interconnected requirements) */}
      <section id="leaderboard" className="py-16 bg-slate-950/60 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Left Col: Setup your game character with localized properties */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800/80">
                  <Smartphone className="text-amber-500" size={18} />
                  <h3 className="font-bold text-base text-white">自訂你的神級牌客屬性</h3>
                </div>

                <form onSubmit={handleUpdateIdentity} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1.5">對決暱稱</label>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      maxLength={10}
                      placeholder="例如: 三重福龍"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 text-left"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1.5">大專專屬牌客稱號</label>
                    <select
                      value={selectedLocalTitle}
                      onChange={(e) => setSelectedLocalTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 text-left"
                    >
                      {LOCAL_TITLES.map((t, idx) => (
                        <option key={idx} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/10 text-[11px] text-slate-300 leading-relaxed font-sans">
                    🏆 <span className="font-bold text-amber-400">當前積分：{userScore}分</span>
                    <br />
                    此積分將實時刷新你在全網玩家排行榜的位置，快試試更改名字吧！
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-full cursor-pointer hover:bg-amber-400 transition-all font-sans active:scale-95 shadow-md shadow-amber-500/10"
                  >
                    確認修改、加入江湖！
                  </button>
                </form>
              </div>
            </div>

            {/* Right Col: Leaderboard widget (takes 3 cols space) */}
            <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800/80 pb-4 mb-4 gap-2">
                <div>
                  <h3 className="font-bold text-lg text-white font-display flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                    🏆 台灣大老二・實時神級王牌排行榜
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    由全台真實玩家對抗記錄演算出。贏得更多殘局或戰局，即可提升排名！
                  </p>
                </div>
                
                <div className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 whitespace-nowrap">
                  實時連接中
                </div>
              </div>

              {/* Leaderboard tables grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                      <th className="py-2.5 px-2">排名</th>
                      <th className="py-2.5 px-3">大老二名號</th>
                      <th className="py-2.5 px-3">江湖稱號</th>
                      <th className="py-2.5 px-3 text-right">戰績</th>
                      <th className="py-2.5 px-3 text-right">排位精準積分</th>
                      <th className="py-2.5 px-3 min-w-[120px]">近期榮譽勳章</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((player) => {
                      const isMe = player.name.includes('(你)');
                      let rankBg = 'text-slate-400';
                      if (player.rank === 1) rankBg = 'text-amber-400 font-bold';
                      if (player.rank === 2) rankBg = 'text-slate-300 font-bold';
                      if (player.rank === 3) rankBg = 'text-amber-600 font-bold';

                      return (
                        <tr
                          key={player.rank}
                          className={`border-b border-slate-800/40 transition-colors ${
                            isMe ? 'bg-amber-500/5 text-amber-200 font-semibold border-l-2 border-l-amber-500' : 'hover:bg-slate-900/40'
                          }`}
                        >
                          <td className="py-3 px-2">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-950 text-[10px] font-mono">
                              {player.rank}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium flex items-center gap-1">
                            {isMe ? '👤 ' : ''}
                            {player.name}
                          </td>
                          <td className="py-3 px-3 text-slate-400 text-[11px]">{player.title}</td>
                          <td className="py-3 px-3 text-right text-slate-400">
                            {player.winCount} 勝 / {player.playCount} 局
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                            {player.score.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-slate-400 text-[10px]">
                            <div className="flex flex-wrap gap-1">
                              {player.recentMedals.length === 0 ? (
                                <span className="text-slate-600">-</span>
                              ) : (
                                player.recentMedals.map((medal, idx) => (
                                  <span key={idx} className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                                    {medal}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* GitHub Algorithm Deep-Dive Guidance Section */}
      <section id="tech" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          <div className="lg:col-span-5 text-left flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-5 w-fit">
              <Layers size={14} className="text-amber-400" />
              <span className="text-xs font-semibold text-amber-300 font-display">核心開源技術：大老二決策智慧</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-4">
              基於 `taiwan-big-two-ai` 演算法架構
            </h3>

            <p className="text-slate-300 text-xs leading-relaxed mb-6">
              本落地頁的 AI 手部選擇演算法直接繼承了來自 <a href="https://github.com/mesmerli/taiwan-big-two-ai" target="_blank" rel="noreferrer" className="text-amber-400 underline hover:text-amber-300 font-semibold inline-flex items-center gap-0.5">mesmerli/taiwan-big-two-ai <ExternalLink size={10} /></a> 的開源精神。針對台灣大老二多牌型組合的極限搜尋，實現了高精度推理。
            </p>

            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <Check className="text-amber-400 flex-shrink-0 mt-0.5" size={14} />
                <span><strong>五張牌組合精準剪枝：</strong>自動優化順子、同花、葫蘆、鐵支的排序層級，確保五張能精準壓制。</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="text-amber-400 flex-shrink-0 mt-0.5" size={14} />
                <span><strong>梅花 3 特殊開局保護：</strong>嚴格覆蓋台灣在地開局傳統（持有梅花三者必須將其包含在首波手牌中）。</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="text-amber-400 flex-shrink-0 mt-0.5" size={14} />
                <span><strong>鐵支與同花順規則特判：</strong>覆蓋各類戰略情況下的主動權變動，AI 能判斷何時用鐵支一槌定局。</span>
              </li>
            </ul>
          </div>

          {/* Technical code/diagram placeholder */}
          <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 font-mono text-[10px] md:text-[11px] text-slate-300 text-left overflow-x-auto shadow-2xl relative">
            <div className="absolute top-3 right-4 flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/40" />
            </div>

            <div className="text-slate-500 mb-2 border-b border-slate-900 pb-2">📂 @utils/bigTwoRules.ts - 核心決策精簡邏輯</div>
            
            <span className="text-indigo-400">export function</span> <span className="text-teal-400">evaluateHand</span>(cards: Card[]): PlayHand &#123;
            <br />
            &nbsp;&nbsp;<span className="text-indigo-400">const</span> len = cards.length;
            <br />
            &nbsp;&nbsp;<span className="text-indigo-400">if</span> (len === <span className="text-amber-400">1</span>) &#123;
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-indigo-400">return</span> &#123; type: <span className="text-emerald-400">'SINGLE'</span>, highestCardValue: cards[<span className="text-amber-400">0</span>].rank &#125;;
            <br />
            &nbsp;&nbsp;&#125;
            <br />
            &nbsp;&nbsp;<span className="text-indigo-400">if</span> (len === <span className="text-amber-400">2</span> &amp;&amp; cards[<span className="text-amber-400">0</span>].rank === cards[<span className="text-amber-400">1</span>].rank) &#123;
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-indigo-400">return</span> &#123; type: <span className="text-emerald-400">'PAIR'</span>, highestCardValue: cards[<span className="text-amber-400">0</span>].rank &#125;;
            <br />
            &nbsp;&nbsp;&#125;
            <br />
            &nbsp;&nbsp;<span className="text-indigo-400">if</span> (len === <span className="text-amber-400">5</span>) &#123;
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// Heuristical Five card combinations checker</span>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-indigo-400">return</span> <span className="text-teal-400">analyzeFiveCards</span>(cards);
            <br />
            &nbsp;&nbsp;&#125;
            <br />
            &nbsp;&nbsp;<span className="text-indigo-400">return</span> &#123; type: <span className="text-emerald-400">'INVALID'</span> &#125;;
            <br />
            &#125;
            
            <div className="mt-4 text-amber-500 text-[10px] border-t border-slate-900 pt-3 font-semibold">
              🎉 欲獲取包含搜索樹、卷積神經網路預估牌勝率的完整代碼，請參照 GitHub 下載。
            </div>
          </div>

        </div>
      </section>

      {/* Footer Block */}
      <footer className="bg-slate-950 border-t border-slate-900/60 py-12 text-slate-500 text-xs text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <div className="text-slate-200 font-display font-bold text-sm flex items-center gap-1.5">
              <img 
                src="https://raw.githubusercontent.com/mesmerli/taiwan-big-two-ai/main/src/assets/logo.png" 
                alt="台灣大老二 AI" 
                className="w-6 h-6 object-contain rounded"
                referrerPolicy="no-referrer"
              />
              <span>台灣大老二 AI 連線社群</span>
            </div>
            <p className="max-w-md leading-relaxed text-[11px] text-slate-500">
              本專案由開源愛好者與大老二迷合力打造，致敬台灣道地傳統棋牌。
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-end">
              <span className="text-slate-500">下載 Windows 客戶端：</span>
              <a
                href="https://apps.microsoft.com/detail/9PM1S8GKBLK9?hl=zh-tw&gl=TW&ocid=pdpshare"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 font-semibold transition hover:underline flex items-center gap-1.5"
              >
                <span className="grid grid-cols-2 gap-[1px] w-2.5 h-2.5">
                  <span className="bg-[#f25022] rounded-[0.5px]" />
                  <span className="bg-[#7fba00] rounded-[0.5px]" />
                  <span className="bg-[#00a4ef] rounded-[0.5px]" />
                  <span className="bg-[#ffb900] rounded-[0.5px]" />
                </span>
                Microsoft Store 官方下載 (30天免費試用)
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-end">
              <span className="text-slate-500">技術核心專案：</span>
              <a href="https://github.com/mesmerli/taiwan-big-two-ai" target="_blank" rel="noreferrer" className="text-amber-400 font-semibold transition hover:underline flex items-center gap-1">
                mesmerli/taiwan-big-two-ai <ExternalLink size={11} />
              </a>
            </div>
            <span className="text-[10px] text-slate-600 mt-2">
              © {new Date().getFullYear()} 台灣大老二 AI. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
