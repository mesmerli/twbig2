import { motion } from 'motion/react';
import { Card, Suit } from '../types';
import { getRankLabel } from '../utils/bigTwoRules';
import { gameAudio } from '../utils/audio';

interface CardViewProps {
  key?: string | number;
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isBack?: boolean;
  animateIndex?: number;
}

export default function CardView({
  card,
  selected = false,
  onClick,
  disabled = false,
  size = 'md',
  isBack = false,
  animateIndex = 0,
}: CardViewProps) {
  const getSuitSymbol = (suit: Suit) => {
    return suit;
  };

  const getSuitStyles = (suit: Suit) => {
    switch (suit) {
      case Suit.SPADE:
        return { color: 'text-slate-900', bg: 'bg-slate-50' };
      case Suit.HEART:
        return { color: 'text-red-500', bg: 'bg-red-50' };
      case Suit.CLUB:
        return { color: 'text-emerald-700', bg: 'bg-emerald-50' }; // Traditional green-tint clubs look superb!
      case Suit.DIAMOND:
        return { color: 'text-blue-500', bg: 'bg-blue-50' }; // Standard tournament colors or beautiful blue diamonds
    }
  };

  const info = getSuitStyles(card.suit);

  // Size configurations
  const sizeClasses = {
    sm: 'w-[48px] h-[72px] text-xs rouded',
    md: 'w-[72px] h-[104px] text-sm rounded-lg',
    lg: 'w-[88px] h-[128px] text-base rounded-xl',
  };

  const handleCardClick = () => {
    if (disabled || isBack || !onClick) return;
    gameAudio.playCardSelect();
    onClick();
  };

  // Render hidden card back
  if (isBack) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: animateIndex * 0.03, type: 'spring', stiffness: 260, damping: 20 }}
        className={`${sizeClasses[size]} border-2 border-emerald-400 bg-gradient-to-br from-emerald-800 to-emerald-950 p-[4px] shadow-md flex items-center justify-center relative cursor-not-allowed`}
      >
        <div className="w-full h-full border border-dashed border-emerald-300 rounded flex items-center justify-center opacity-70">
          {/* Elegant card back detail */}
          <div className="text-center">
            <div className="text-[10px] font-mono text-emerald-300 font-semibold tracking-widest uppercase">AI</div>
            <div className="text-[12px] text-emerald-300 font-bold mt-1">♠ ♥</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{
        scale: selected ? 1.05 : 1,
        opacity: 1,
        y: selected ? -16 : 0, // Traditional lifting logic
        boxShadow: selected
          ? '0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.2)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
      whileHover={disabled ? {} : { scale: 1.05, y: selected ? -20 : -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      onClick={handleCardClick}
      className={`${sizeClasses[size]} select-none border-2 relative cursor-pointer bg-white transition-colors duration-200 ${
        selected ? 'border-emerald-500' : 'border-slate-200'
      } flex flex-col justify-between p-2 font-sans`}
    >
      {/* Top Left */}
      <div className="flex flex-col items-start leading-none">
        <span className={`font-bold ${info.color} select-none`}>
          {getRankLabel(card.rank)}
        </span>
        <span className={`${info.color} text-xs select-none mt-0.5`}>
          {getSuitSymbol(card.suit)}
        </span>
      </div>

      {/* Central Emblem */}
      <div className="flex justify-center items-center my-auto">
        <span className={`text-2xl select-none ${info.color}`}>
          {getSuitSymbol(card.suit)}
        </span>
      </div>

      {/* Bottom Right (Rotated) */}
      <div className="flex flex-col items-end leading-none rotate-180">
        <span className={`font-bold ${info.color} select-none`}>
          {getRankLabel(card.rank)}
        </span>
        <span className={`${info.color} text-xs select-none mt-0.5`}>
          {getSuitSymbol(card.suit)}
        </span>
      </div>

      {/* Selection Glow Indicator */}
      {selected && (
        <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
      )}
    </motion.div>
  );
}
