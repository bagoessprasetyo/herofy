'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sword, Star, CheckCircle, Clock, Zap, Crown, Flame, Trophy, TrendingUp } from 'lucide-react';
import { Quest } from '@/src/types/database';
import { getDifficultyColor, getStatInfo } from '@/lib/quest-utils';

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: string) => void;
  onDelete?: (questId: string) => void;
}

export function QuestCard({ quest, onComplete, onDelete }: QuestCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState('');

  const handleComplete = async () => {
    setIsCompleting(true);
    
    // Show reflection prompt for higher XP quests
    if (quest.xp_reward >= 60) {
      setShowReflection(true);
      return;
    }
    
    await completeQuest();
  };

  const completeQuest = async () => {
    try {
      await onComplete(quest.id);
      setIsCompleting(false);
      setShowReflection(false);
      setReflection('');
    } catch (error) {
      console.error('Error completing quest:', error);
      setIsCompleting(false);
    }
  };

  const getDifficultyIconLocal = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <Zap className="w-4 h-4" />;
      case 'medium': return <Star className="w-4 h-4" />;
      case 'hard': return <Flame className="w-4 h-4" />;
      case 'epic': return <Crown className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health': return '💪';
      case 'education': return '📚';
      case 'career': return '💼';
      case 'home': return '🏠';
      case 'social': return '👥';
      case 'creative': return '🎨';
      case 'finance': return '💰';
      default: return '⚔️';
    }
  };

  const difficultyColor = getDifficultyColor(quest.difficulty);
  const statInfo = getStatInfo(quest.primary_stat || 'strength');

  if (showReflection) {
    return (
      <motion.div 
        className={`bg-gradient-to-r ${difficultyColor} p-6 rounded-lg shadow-lg border border-white/20`}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        <div className="text-white">
          <h3 className="text-lg font-bold mb-4">🎯 Quest Reflection</h3>
          <p className="mb-4 text-sm opacity-90">
            Before claiming your victory, take a moment to reflect on your accomplishment:
          </p>
          
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="How did completing this quest make you feel? What did you learn or accomplish?"
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
            rows={3}
          />
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={completeQuest}
              disabled={isCompleting}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              {isCompleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  Claim Victory (+{quest.xp_reward} XP + {statInfo.icon})
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowReflection(false)}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 font-semibold"
            >
              Skip
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`bg-gradient-to-r ${difficultyColor} p-6 rounded-lg shadow-lg border border-white/20 hover:shadow-xl transition-shadow`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="text-white">
        {/* Header with category, difficulty, and stat */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">{getCategoryIcon(quest.category)}</span>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
              {quest.category}
            </span>
            <span className="text-xs font-medium bg-green-500/20 px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {statInfo.icon} {statInfo.name}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-yellow-300">
            {getDifficultyIconLocal(quest.difficulty)}
            <span className="text-xs font-medium capitalize">{quest.difficulty}</span>
          </div>
        </div>

        {/* Quest Title */}
        <h3 className="text-xl font-bold mb-2 leading-tight">
          {quest.title}
        </h3>

        {/* Quest Description */}
        <p className="text-sm opacity-90 mb-4 leading-relaxed">
          {quest.description}
        </p>

        {/* Original Task (smaller text) */}
        <p className="text-xs opacity-70 mb-4 italic border-l-2 border-white/30 pl-3">
          Original task: {quest.original_task}
        </p>

        {/* Stat Improvement Info */}
        {quest.status === 'active' && (
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-300" />
              <span className="text-green-300 font-medium">
                Completing this quest will improve your {statInfo.name} {statInfo.icon}
              </span>
            </div>
          </div>
        )}

        {/* Completion Info for completed quests */}
        {quest.status === 'completed' && quest.completed_at && (
          <div className="bg-green-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span className="text-green-300 font-medium">
                Completed! Your {statInfo.name} {statInfo.icon} increased by +1
              </span>
            </div>
            <div className="text-xs text-green-200 mt-1">
              Completed on {new Date(quest.completed_at).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Action Area */}
        <div className="flex justify-between items-center">
          {/* XP Reward */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="font-bold text-yellow-300">+{quest.xp_reward} XP</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {onDelete && quest.status === 'active' && (
              <button
                onClick={() => onDelete(quest.id)}
                className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white transition-colors text-sm"
              >
                Delete
              </button>
            )}
            
            {quest.status === 'active' && (
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                {isCompleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Complete Quest
                  </>
                )}
              </button>
            )}

            {quest.status === 'completed' && (
              <div className="bg-green-500/20 px-6 py-2 rounded-lg font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-green-300" />
                <span className="text-green-300">Completed!</span>
              </div>
            )}
          </div>
        </div>

        {/* Time indicator */}
        <div className="flex items-center gap-1 mt-3 text-xs opacity-60">
          <Clock className="w-3 h-3" />
          <span>Created {new Date(quest.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
}