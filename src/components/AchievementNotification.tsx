'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, X, Sparkles, Crown } from 'lucide-react';

interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  xp_reward: number;
  stat_bonus_type?: string;
  stat_bonus_amount?: number;
  unlocked_at: string;
}

interface AchievementNotificationProps {
  achievements: Achievement[];
  onClose: () => void;
}

export function AchievementNotification({ achievements, onClose }: AchievementNotificationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const currentAchievement = achievements[currentIndex];

  useEffect(() => {
    if (!isVisible || !currentAchievement) return;

    // Auto advance to next achievement after 4 seconds
    const timer = setTimeout(() => {
      if (currentIndex < achievements.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        handleClose();
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentIndex, achievements.length, currentAchievement, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const getTierColors = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return {
          gradient: 'from-orange-400 to-amber-600',
          glow: 'shadow-orange-500/50',
          ring: 'ring-orange-400/30',
          text: 'text-orange-600'
        };
      case 'silver':
        return {
          gradient: 'from-gray-300 to-gray-500',
          glow: 'shadow-gray-400/50',
          ring: 'ring-gray-400/30',
          text: 'text-gray-600'
        };
      case 'gold':
        return {
          gradient: 'from-yellow-400 to-yellow-600',
          glow: 'shadow-yellow-500/50',
          ring: 'ring-yellow-400/30',
          text: 'text-yellow-600'
        };
      case 'platinum':
        return {
          gradient: 'from-purple-400 to-purple-600',
          glow: 'shadow-purple-500/50',
          ring: 'ring-purple-400/30',
          text: 'text-purple-600'
        };
      case 'legendary':
        return {
          gradient: 'from-pink-500 to-red-500',
          glow: 'shadow-pink-500/50',
          ring: 'ring-pink-400/30',
          text: 'text-pink-600'
        };
      default:
        return {
          gradient: 'from-blue-400 to-blue-600',
          glow: 'shadow-blue-500/50',
          ring: 'ring-blue-400/30',
          text: 'text-blue-600'
        };
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return Trophy;
      case 'silver':
        return Star;
      case 'gold':
        return Crown;
      case 'platinum':
        return Sparkles;
      case 'legendary':
        return Crown;
      default:
        return Trophy;
    }
  };

  const getStatIcon = (statType?: string) => {
    switch (statType) {
      case 'strength':
        return '💪';
      case 'wisdom':
        return '🧠';
      case 'endurance':
        return '❤️';
      case 'charisma':
        return '✨';
      default:
        return '';
    }
  };

  if (!currentAchievement || !isVisible) return null;

  const tierColors = getTierColors(currentAchievement.tier);
  const TierIcon = getTierIcon(currentAchievement.tier);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`relative bg-white rounded-2xl shadow-2xl ${tierColors.glow} max-w-md w-full mx-4 overflow-hidden ring-4 ${tierColors.ring}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* Achievement Header */}
            <div className={`bg-gradient-to-r ${tierColors.gradient} p-6 text-white relative overflow-hidden`}>
              {/* Animated background particles */}
              <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/30 rounded-full"
                    initial={{
                      x: Math.random() * 400,
                      y: Math.random() * 200,
                      opacity: 0
                    }}
                    animate={{
                      y: [null, -50],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="text-center mb-4"
                >
                  <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <TierIcon className="w-10 h-10 text-white" />
                  </div>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-2xl font-bold mb-1"
                  >
                    🎉 Achievement Unlocked!
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className={`inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium uppercase tracking-wide`}
                  >
                    {currentAchievement.tier} Tier
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Achievement Content */}
            <div className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-3xl">{currentAchievement.icon}</span>
                  <h3 className="text-xl font-bold text-gray-900">
                    {currentAchievement.title}
                  </h3>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {currentAchievement.description}
                </p>

                {/* Rewards */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Rewards Earned:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-yellow-600">
                        +{currentAchievement.xp_reward} XP
                      </span>
                    </div>
                    {currentAchievement.stat_bonus_type && currentAchievement.stat_bonus_amount && (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">{getStatIcon(currentAchievement.stat_bonus_type)}</span>
                        <span className={`font-bold ${tierColors.text}`}>
                          +{currentAchievement.stat_bonus_amount} {currentAchievement.stat_bonus_type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress indicator if multiple achievements */}
                {achievements.length > 1 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-sm text-gray-600">
                        {currentIndex + 1} of {achievements.length}
                      </span>
                    </div>
                    <div className="flex gap-1 justify-center">
                      {achievements.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentIndex ? tierColors.gradient.replace('from-', 'bg-').split(' ')[0] : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  {currentIndex < achievements.length - 1 ? (
                    <button
                      onClick={handleNext}
                      className={`flex-1 bg-gradient-to-r ${tierColors.gradient} text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
                    >
                      Next Achievement
                    </button>
                  ) : (
                    <button
                      onClick={handleClose}
                      className={`flex-1 bg-gradient-to-r ${tierColors.gradient} text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
                    >
                      Continue Your Journey
                    </button>
                  )}
                  
                  <button
                    onClick={handleClose}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}