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
  Share2,
  Globe,
} from 'lucide-react';

import { Card, LeaderboardEntry, DailyChallenge } from './types';
import { INITIAL_LEADERBOARD, DAILY_CHALLENGES, LOCAL_TITLES } from './data/mockData';
import BigTwoGame from './components/BigTwoGame';
import { TRANSLATIONS, Language } from './utils/lang';

export default function App() {
  // Localization setup & personal identity
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('twbig2_lang') as Language) || 'zh');
  const t = TRANSLATIONS[lang];

  const [userDisplayName, setUserDisplayName] = useState(() => lang === 'en' ? 'Master Dragon' : '萬華牌王阿強');
  const [userTitle, setUserTitle] = useState(() => lang === 'en' ? 'Eastern Sovereign' : '東區大老二至尊');
  const [userScore, setUserScore] = useState(4800);
  const [tempName, setTempName] = useState(() => lang === 'en' ? 'Master Dragon' : '萬華牌王阿強');
  const [selectedLocalTitle, setSelectedLocalTitle] = useState(() => lang === 'en' ? 'Wanhua Wind Rider' : '萬華牌局一陣風');

  const toggleLanguage = () => {
    const nextLang: Language = lang === 'zh' ? 'en' : 'zh';
    setLang(nextLang);
    localStorage.setItem('twbig2_lang', nextLang);
  };

  useEffect(() => {
    const defaultsZh = ['萬華牌王阿強', '東區大老二至尊', '萬華牌局一陣風'];
    const defaultsEn = ['Master Dragon', 'Eastern Sovereign', 'Wanhua Wind Rider'];
    
    if (lang === 'en') {
      if (defaultsZh.includes(userDisplayName)) {
        setUserDisplayName('Master Dragon');
        setTempName('Master Dragon');
      }
      if (defaultsZh.includes(userTitle)) {
        setUserTitle('Eastern Sovereign');
      }
      if (defaultsZh.includes(selectedLocalTitle)) {
        setSelectedLocalTitle('Wanhua Wind Rider');
      }
    } else {
      if (defaultsEn.includes(userDisplayName)) {
        setUserDisplayName('萬華牌王阿強');
        setTempName('萬華牌王阿強');
      }
      if (defaultsEn.includes(userTitle)) {
        setUserTitle('東區大老二至尊');
      }
      if (defaultsEn.includes(selectedLocalTitle)) {
        setSelectedLocalTitle('萬華牌局一陣風');
      }
    }
  }, [lang]);

  // Play Mode: 'official' (the embedded website) or 'local' (hand puzzles / web trial React engine)
  const [playMode, setPlayMode] = useState<'official' | 'local'>('official');

  // Daily Challenge setup list
  const [challenges, setChallenges] = useState<DailyChallenge[]>(DAILY_CHALLENGES);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

  // Custom live sorting leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Share website configuration
  const [showShareToast, setShowShareToast] = useState(false);

  const handleShare = async () => {
    const shareUrl = 'https://mesmerli.github.io/twbig2/';
    const shareData = {
      title: lang === 'en' ? 'Taiwan Big Two AI - Ultimate Card Duel' : '台灣大老二 AI - 全台最強對戰平台',
      text: lang === 'en' 
        ? 'Challenge the ultimate neural network-based Taiwan Big Two AI simulator! Play online instantly.'
        : '快來挑戰全台最強的台灣大老二 AI 殘局與對戰 Demo！網頁版免下載，極限牌型搜尋高精度推理！',
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      } catch (err) {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      })
      .catch((err) => {
        const tempInput = document.createElement('input');
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        try {
          document.execCommand('copy');
          setShowShareToast(true);
          setTimeout(() => setShowShareToast(false), 3000);
        } catch (e) {
          console.error(e);
        }
        document.body.removeChild(tempInput);
      });
  };

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
      <header className="fixed top-4 left-0 right-0 mx-auto max-w-7xl z-50 px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://raw.githubusercontent.com/mesmerli/taiwan-big-two-ai/main/src/assets/logo.png" 
              alt={t.brandName} 
              className="w-10 h-10 object-contain rounded-lg drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="font-display font-extrabold text-white text-base tracking-wider block">{t.brandName}</span>
              <span className="text-[10px] text-slate-400 font-mono hidden xl:block -mt-1">{t.brandSub}</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-3 xl:gap-5">
            <a href="#features" className="text-[11px] xl:text-xs font-semibold tracking-normal xl:tracking-wider text-slate-300 hover:text-amber-400 transition-colors uppercase">{t.navFeatures}</a>
            <a href="#download" className="text-[11px] xl:text-xs font-semibold tracking-normal xl:tracking-wider text-sky-400 hover:text-amber-400 transition-colors uppercase">{t.navMsStore}</a>
            <a href="#challenges" className="text-[11px] xl:text-xs font-semibold tracking-normal xl:tracking-wider text-slate-300 hover:text-amber-400 transition-colors uppercase">{t.navChallenges}</a>
            <a href="#demo" className="text-[11px] xl:text-xs font-semibold tracking-normal xl:tracking-wider text-slate-300 hover:text-amber-400 transition-colors uppercase">{t.navDemo}</a>
            <a href="#leaderboard" className="text-[11px] xl:text-xs font-semibold tracking-normal xl:tracking-wider text-slate-300 hover:text-amber-400 transition-colors uppercase">{t.navLeaderboard}</a>
            <a href="#tech" className="text-[11px] xl:text-xs font-semibold tracking-normal xl:tracking-wider text-slate-300 hover:text-amber-400 transition-colors uppercase">{t.navAlgorithm}</a>
          </nav>

          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            <a
              href="https://apps.microsoft.com/detail/9PM1S8GKBLK9?hl=zh-tw&gl=TW&ocid=pdpshare"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] xl:text-xs font-semibold bg-blue-950/40 hover:bg-blue-900/60 text-blue-200 border border-blue-800/40 transition shrink-0"
            >
              <span className="grid grid-cols-2 gap-[1px] w-2.5 h-2.5">
                <span className="bg-[#f25022] rounded-[0.5px]" />
                <span className="bg-[#7fba00] rounded-[0.5px]" />
                <span className="bg-[#00a4ef] rounded-[0.5px]" />
                <span className="bg-[#ffb900] rounded-[0.5px]" />
              </span>
              {t.btnMsStoreDownload}
            </a>
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-amber-400 border border-slate-700 hover:border-slate-600 transition cursor-pointer"
              title={lang === 'zh' ? 'Switch to English / 切換至英文' : '切換至繁體中文 / Switch to Chinese'}
            >
              <Globe size={14} className="text-amber-400" />
            </button>
            <button
              id="desktop-share-btn"
              onClick={handleShare}
              className="flex items-center justify-center p-2.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:border-amber-500/50 transition cursor-pointer"
              title={t.btnShareTooltip}
            >
              <Share2 size={14} />
            </button>
            <button
              onClick={() => scrollToDemo('official')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-full font-bold transition-all shadow-lg text-[11px] xl:text-xs cursor-pointer shrink-0"
            >
              {t.btnPlayNowHeader}
            </button>
          </div>

          {/* Mobile menu triggers */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center p-2 rounded-full bg-slate-800/80 text-slate-200 border border-slate-700 text-[10px] font-bold"
              title="Toggle Language / 切換語言"
            >
              <Globe size={14} className="text-amber-400" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white"
            >
              <div className="space-y-1.5">
                <span className={`block w-6 h-0.5 bg-current transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-6 h-0.5 bg-current transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-6 h-0.5 bg-current transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu list */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#070e17] border-b border-slate-800 px-4 py-4 space-y-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-300 py-1"
            >
              {t.navFeatures}
            </a>
            <a
              href="#download"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-blue-450 py-1 font-semibold"
            >
              {t.navMsStore}
            </a>
            <a
              href="#challenges"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-300 py-1"
            >
              {t.navChallenges}
            </a>
            <a
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-300 py-1"
            >
              {t.navDemo}
            </a>
            <a
              href="#leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-300 py-1"
            >
              {t.navLeaderboard}
            </a>
            <a
              href="#tech"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-slate-300 py-1"
            >
              {t.navAlgorithm}
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
                {t.btnMsStoreDownload}
              </a>
              <button
                id="mobile-share-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleShare();
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400 font-semibold cursor-pointer"
              >
                <Share2 size={14} />
                分享網站給朋友
              </button>
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
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden border-b border-slate-900">
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
                  <span className="text-xs font-semibold text-amber-300 font-display">{t.heroSubtitle}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                  {t.heroTitlePart1} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500">
                    {t.heroTitlePart2}
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 max-w-xl mb-8 leading-relaxed">
                  {t.heroDesc}
                </p>
              </div>

              {/* Stats badges inside Hero */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-lg mb-8 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 backdrop-blur-sm">
                <div>
                  <div className="text-2xl font-bold font-display text-white">{t.statBadge1Val}<span className="text-amber-500 text-sm">{t.statBadge1Unit}</span></div>
                  <div className="text-[10px] text-slate-400 mt-1">{t.statBadge1Lbl}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-white">{t.statBadge2Val}<span className="text-amber-500 text-sm">{t.statBadge2Unit}</span></div>
                  <div className="text-[10px] text-slate-400 mt-1">{t.statBadge2Lbl}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-white">{t.statBadge3Val}<span className="text-amber-500 text-sm">{t.statBadge3Unit}</span></div>
                  <div className="text-[10px] text-slate-400 mt-1">{t.statBadge3Lbl}</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-wrap">
                <button
                  onClick={() => scrollToDemo('official')}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95 transition text-center cursor-pointer whitespace-nowrap"
                >
                  {t.btnStartWebPlay}
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
                  {t.btnMsStoreTrial}
                  <ExternalLink size={11} className="opacity-60" />
                </a>
                <a
                  href="https://github.com/mesmerli/taiwan-big-two-ai"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 transition"
                >
                  <Github size={14} />
                  {t.btnVisitGithub}
                  <ExternalLink size={12} className="opacity-60" />
                </a>
              </div>
            </div>

            {/* Right Visual Bento Box */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl min-h-[420px] lg:min-h-full">
              <div className="absolute top-4 left-6 flex items-center gap-2 z-30">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-slate-300">{lang === 'zh' ? '流暢即時對戰體驗' : 'Highly Responsive Live Play'}</span>
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
                <h3 className="text-lg font-bold text-white mb-1">{t.visualTitle}</h3>
                <p className="text-xs text-slate-400 max-w-xs">{t.visualDesc}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="py-16 bg-slate-900/20 border-b border-slate-900 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-extrabold text-white sm:text-4xl mb-3">
              {t.featuresTitle}
            </h2>
            <p className="text-slate-400 text-xs">
              {t.featuresSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 group hover:shadow-[0_0_25px_rgba(245,158,11,0.1)] relative overflow-hidden backdrop-blur-sm">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 w-fit mb-4 group-hover:scale-110 transition duration-300">
                <Users size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t.feat1Title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {t.feat1Desc}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 group hover:shadow-[0_0_25px_rgba(245,158,11,0.1)] relative overflow-hidden backdrop-blur-sm">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 w-fit mb-4 group-hover:scale-110 transition duration-300">
                <Sparkles size={22} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t.feat2Title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {t.feat2Desc}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 group hover:shadow-[0_0_25px_rgba(245,158,11,0.1)] relative overflow-hidden backdrop-blur-sm">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 w-fit mb-4 group-hover:scale-110 transition duration-300">
                <Layers size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t.feat3Title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {t.feat3Desc}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Microsoft Store Download Banner Section */}
      <section id="download" className="py-16 bg-gradient-to-br from-[#0c1322] to-[#0a0f1d] border-b border-slate-900 overflow-hidden relative scroll-mt-24">
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
                <span className="text-xs font-semibold text-blue-300 font-display">{t.msStoreBannerTag}</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-4">
                {t.msStoreBannerTitle}
              </h2>
              
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                {t.msStoreBannerDesc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>{t.msStoreBannerBullet1}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>{t.msStoreBannerBullet2}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>{t.msStoreBannerBullet3}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>{t.msStoreBannerBullet4}</span>
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
              
              <h3 className="font-bold text-white text-sm mb-1">{t.brandName}</h3>
              <p className="text-[10px] text-slate-400 mb-5 leading-tight">
                {t.msStoreTrialText}
              </p>
              
              {/* Styled Download Action */}
              <a
                href="https://apps.microsoft.com/detail/9PM1S8GKBLK9?hl=zh-tw&gl=TW&ocid=pdpshare"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3 bg-[#0078d4] hover:bg-[#106ebe] text-white font-bold rounded-xl text-xs transition duration-200 shadow-md shadow-blue-500/10 cursor-pointer"
              >
                <Download size={13} />
                <span>{t.btnMsStoreTrialBanner}</span>
              </a>
              
              <span className="text-[9px] text-slate-500 mt-3 font-mono">
                {t.msStoreFooterText}
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Daily Challenge Selector Grid Segment */}
      <section id="challenges" className="py-16 bg-slate-950/40 border-b border-slate-900 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white flex items-center gap-2">
                {t.challengesTitle}
              </h2>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed max-w-xl">
                {t.challengesDesc}
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-rose-400 font-mono bg-rose-500/5 px-3 py-1.5 rounded-lg border border-rose-500/15">
              <span>{t.challengesAutoRefresh}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {challenges.map((ch) => {
              // Difficulty values can be translated based on difficulty dict mapping or direct static
              const difficultyText = lang === 'en' 
                ? (ch.difficulty === '簡單' ? 'Easy' : ch.difficulty === '中等' ? 'Medium' : 'Hard')
                : ch.difficulty;

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
                        {difficultyText}
                      </span>
                      {ch.isCompleted ? (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle size={10} />
                          {t.challengesStatusCompleted}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          {t.challengesStatusPending}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-white font-sans mb-2">
                      {lang === 'en' ? TRANSLATIONS.en.challengesData[ch.id as keyof typeof TRANSLATIONS.en.challengesData]?.title || ch.title : ch.title}
                    </h3>

                    <p className="text-slate-400 text-xs leading-relaxed mb-4 min-h-[64px]">
                      {lang === 'en' ? TRANSLATIONS.en.challengesData[ch.id as keyof typeof TRANSLATIONS.en.challengesData]?.description || ch.description : ch.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-800/80 pt-4 mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-amber-500 font-mono font-semibold">
                      {t.challengesScore} +150
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
                      {isActive ? t.challengesActionActive : t.challengesActionStart}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Playable Game Area with custom layout anchor */}
      <section id="demo" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative scroll-mt-24">
        <div id="demo-table" className="absolute -top-20" />
        
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h2 className="text-3xl font-display font-extrabold text-white flex items-center justify-center gap-2">
            {t.demoTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            {t.demoSubtitle}
          </p>
          
          {activeChallengeId && (
            <div className="inline-flex items-center gap-3.5 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-full text-xs font-medium mt-4 font-sans">
              <span>{t.demoActiveChallengePrefix}{lang === 'en' ? TRANSLATIONS.en.challengesData[activeChallengeId as keyof typeof TRANSLATIONS.en.challengesData]?.title || currentActiveChallengeObj?.title : currentActiveChallengeObj?.title}{t.demoActiveChallengeSuffix}</span>
              <button
                onClick={() => {
                  setActiveChallengeId(null);
                  setPlayMode('local');
                }}
                className="underline hover:text-white cursor-pointer ml-1 font-bold text-[11px]"
              >
                {t.demoSwitchNormalPlay}
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
              <span>{t.demoModeOfficial}</span>
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
              <span>{t.demoModeLocal}</span>
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
              {playMode === 'official' ? t.demoStatusOfficial : t.demoStatusLocal}
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
                      <span>{t.iframeSandboxNotice}</span>
                    </span>
                    <a
                      href="https://mesmerli.github.io/taiwan-big-two-ai/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-450 hover:text-amber-400 font-bold transition hover:underline flex items-center gap-1 whitespace-nowrap"
                    >
                      {t.iframeFullWidthBtn} <ExternalLink size={12} />
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
                  currentLanguage={lang}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </section>

      {/* Leaderboard & Player setup configuration (Satisfies interconnected requirements) */}
      <section id="leaderboard" className="py-16 bg-slate-950/60 border-t border-slate-900 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Left Col: Setup your game character with localized properties */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800/80">
                  <Smartphone className="text-amber-500" size={18} />
                  <h3 className="font-bold text-base text-white">{t.custTitle}</h3>
                </div>

                <form onSubmit={handleUpdateIdentity} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1.5">{t.custLabelNickname}</label>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      maxLength={10}
                      placeholder={t.custPlaceholder}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 text-left"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1.5">{t.custLabelTitle}</label>
                    <select
                      value={selectedLocalTitle}
                      onChange={(e) => setSelectedLocalTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 text-left"
                    >
                      {LOCAL_TITLES.map((tVal, idx) => {
                        const tTranslated = lang === 'en'
                          ? (tVal === '萬華牌局一陣風' ? 'Wanhua Wind Rider'
                             : tVal === '大安炒牌大宗師' ? 'Daan Shuffler Grandmaster'
                             : tVal === '板橋鐵支狂熱者' ? 'Banqiao Quad Lover'
                             : tVal === '信義梭哈黃金右手' ? 'Xinyi Golden Hand'
                             : tVal)
                          : tVal;
                        return (
                          <option key={idx} value={tVal}>
                            {tTranslated}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/10 text-[11px] text-slate-300 leading-relaxed font-sans">
                    🏆 <span className="font-bold text-amber-400">{t.custScoreText}：{userScore}</span>
                    <br />
                    {t.custDescText}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-full cursor-pointer hover:bg-amber-400 transition-all font-sans active:scale-95 shadow-md shadow-amber-500/10"
                  >
                    {t.custConfirmBtn}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Col: Leaderboard widget (takes 3 cols space) */}
            <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800/80 pb-4 mb-4 gap-2">
                <div>
                  <h3 className="font-bold text-lg text-white font-display flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                    {t.leaderboardTitle}
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {t.leaderboardDesc}
                  </p>
                </div>
                
                <div className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 whitespace-nowrap">
                  {t.leaderboardStatus}
                </div>
              </div>

              {/* Leaderboard tables grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                      <th className="py-2.5 px-2">{t.leaderboardThRank}</th>
                      <th className="py-2.5 px-3">{t.leaderboardThName}</th>
                      <th className="py-2.5 px-3">{t.leaderboardThTitle}</th>
                      <th className="py-2.5 px-3 text-right">{t.leaderboardThRecord}</th>
                      <th className="py-2.5 px-3 text-right">{t.leaderboardThScore}</th>
                      <th className="py-2.5 px-3 min-w-[120px]">{t.leaderboardThMedals}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((player) => {
                      const isMe = player.name.includes('(你)') || player.name.includes('(You)');
                      let rankBg = 'text-slate-400';
                      if (player.rank === 1) rankBg = 'text-amber-400 font-bold';
                      if (player.rank === 2) rankBg = 'text-slate-300 font-bold';
                      if (player.rank === 3) rankBg = 'text-amber-600 font-bold';

                      // Translate name (You)
                      let playerName = player.name;
                      if (isMe) {
                        playerName = lang === 'en' ? `${userDisplayName} (You)` : `${userDisplayName} (你)`;
                      } else {
                        // Translate player names / titles in English leaderboard beautifully
                        if (lang === 'en') {
                          playerName = playerName
                            .replace('三重福龍', 'Sanchong Fortune Dragon')
                            .replace('基隆王爺牌客', 'Keelung Royal Cardmaster')
                            .replace('北投順子狂人', 'Beitou Straight Fanatic')
                            .replace('台中鐵八牌神', 'Taichung Quad God')
                            .replace('台南連環神算', 'Tainan Combo Calculator')
                            .replace('高雄絕情老二', 'Kaohsiung Ace Ruler');
                        }
                      }

                      // Translate static titles
                      let playerTitle = player.title;
                      if (lang === 'en') {
                        playerTitle = playerTitle
                          .replace('東區大老二至尊', 'Eastern Sovereign')
                          .replace('蘆洲葫蘆至尊', 'Luzhou FullHouse Lord')
                          .replace('九份鐵支神捕', 'Jiufen Quad Hunter')
                          .replace('士林順子狂殺手', 'Shilin Straight Slasher')
                          .replace('萬華牌局一陣風', 'Wanhua Wind Rider')
                          .replace('大安炒牌大宗師', 'Daan Shuffler Grandmaster')
                          .replace('板橋鐵支狂熱者', 'Banqiao Quad Lover')
                          .replace('信義梭哈黃金右手', 'Xinyi Golden Hand');
                      }

                      // Translate medals
                      const translatedMedals = player.recentMedals.map(m => {
                        if (lang === 'en') {
                          return m
                            .replace('🔥 當日挑戰獲勝者', '🔥 Daily Champ')
                            .replace('🍀 運氣爆棚', '🍀 Blessed Luck')
                            .replace('🧠 完美心流推理', '🧠 Perfect Focus')
                            .replace('⚡ 高速破局先鋒', '⚡ Blitz Solver')
                            .replace('💎 絕地葫蘆大逆轉', '💎 FullHouse Reversal')
                            .replace('🛡️ 防撞大師十連勝', '🛡️ Defend Grandmaster');
                        }
                        return m;
                      });

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
                            {playerName}
                          </td>
                          <td className="py-3 px-3 text-slate-400 text-[11px]">{playerTitle}</td>
                          <td className="py-3 px-3 text-right text-slate-400">
                            {player.winCount} {lang === 'en' ? 'W' : '勝'} / {player.playCount} {lang === 'en' ? 'G' : '局'}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                            {player.score.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-slate-400 text-[10px]">
                            <div className="flex flex-wrap gap-1">
                              {translatedMedals.length === 0 ? (
                                <span className="text-slate-600">-</span>
                              ) : (
                                translatedMedals.map((medal, idx) => (
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
      <section id="tech" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          <div className="lg:col-span-5 text-left flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-5 w-fit">
              <Layers size={14} className="text-amber-400" />
              <span className="text-xs font-semibold text-amber-300 font-display">{t.techBadge}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-4">
              {t.techTitle}
            </h3>

            <p className="text-slate-300 text-xs leading-relaxed mb-6">
              {t.techDesc}{' '}
              <a href="https://github.com/mesmerli/taiwan-big-two-ai" target="_blank" rel="noreferrer" className="text-amber-400 underline hover:text-amber-300 font-semibold inline-flex items-center gap-1">
                <Github size={12} className="shrink-0 text-amber-400" />
                mesmerli/taiwan-big-two-ai <ExternalLink size={10} />
              </a>
              {lang === 'en' ? ' open-source spirit. Extremely high-precision heuristics for Taiwanese-specific card weights.' : ' 的開源精神。針對台灣大老二多牌型組合的極限搜尋，實現了高精度推理。'}
            </p>

            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <Check className="text-amber-400 flex-shrink-0 mt-0.5" size={14} />
                <span>{t.techLi1}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="text-amber-400 flex-shrink-0 mt-0.5" size={14} />
                <span>{t.techLi2}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="text-amber-400 flex-shrink-0 mt-0.5" size={14} />
                <span>{t.techLi3}</span>
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

            <div className="text-slate-500 mb-2 border-b border-slate-900 pb-2">📂 @utils/bigTwoRules.ts - {lang === 'en' ? 'Core Rule Evaluation logic' : '核心決策精簡邏輯'}</div>
            
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
              {t.techFooterNotice}
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
                alt={t.brandName} 
                className="w-6 h-6 object-contain rounded"
                referrerPolicy="no-referrer"
              />
              <span>{t.footerTitle}</span>
            </div>
            <p className="max-w-md leading-relaxed text-[11px] text-slate-500">
              {t.footerDesc}
            </p>
            <p className="leading-relaxed text-[11px] text-slate-400 flex items-center gap-1">
              <span>{t.footerContact}</span>
              <a href="mailto:mesmerli@hotmail.com" className="text-amber-500/90 hover:text-amber-400 transition hover:underline font-mono">
                mesmerli@hotmail.com
              </a>
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-end">
              <span className="text-slate-500">{t.footerDownloadText}</span>
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
                {t.footerPlatformText}
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-end">
              <span className="text-slate-500">{t.footerRepoText}</span>
              <a href="https://github.com/mesmerli/taiwan-big-two-ai" target="_blank" rel="noreferrer" className="text-amber-400 font-semibold transition hover:underline flex items-center gap-1">
                <Github size={13} className="shrink-0 text-amber-400" />
                mesmerli/taiwan-big-two-ai <ExternalLink size={11} />
              </a>
            </div>
            <span className="text-[10px] text-slate-600 mt-2">
              © {new Date().getFullYear()} {t.brandName}. All rights reserved.
            </span>
          </div>
        </div>
      </footer>

      {/* Share Toast Notification Feedback */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900/95 border border-amber-500/40 text-amber-400 font-medium text-xs shadow-[0_8px_30px_rgb(0,0,0,0.5)] backdrop-blur-md whitespace-nowrap"
          >
            <CheckCircle size={15} className="text-amber-500 shrink-0" />
            <span>{t.shareToastText} (https://mesmerli.github.io/twbig2/)</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
