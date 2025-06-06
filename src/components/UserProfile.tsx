'use client';

import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Sword, 
  Shield, 
  Brain, 
  Heart, 
  Users,
  TrendingUp
} from 'lucide-react';
import { User } from '../types/database';
import { useUserStats } from '@/src/hooks/useUserStats';

interface UserProfileProps {
  user: User;
  className?: string;
}

export function UserProfile({ user, className = '' }: UserProfileProps) {
  const { stats, loading: statsLoading } = useUserStats();

  // Calculate XP progress to next level
  const currentLevelXP = (user.level - 1) * 1000;
  const nextLevelXP = user.level * 1000;
  const progressXP = user.total_xp - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const progressPercentage = (progressXP / neededXP) * 100;

  // Map stats to include icons for display
  const statsWithIcons = stats.map(stat => {
    let icon;
    switch (stat.name) {
      case 'Strength':
        icon = <Sword className="w-4 h-4" />;
        break;
      case 'Wisdom':
        icon = <Brain className="w-4 h-4" />;
        break;
      case 'Endurance':
        icon = <Heart className="w-4 h-4" />;
        break;
      case 'Charisma':
        icon = <Users className="w-4 h-4" />;
        break;
      default:
        icon = <TrendingUp className="w-4 h-4" />;
    }
    return { ...stat, iconComponent: icon };
  });

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {user.username || user.email?.split('@')[0] || 'Hero'}
            </h3>
            <p className="text-blue-100 text-sm">{user.character_class}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-300" />
                <span className="font-semibold">Level {user.level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">XP Progress</span>
          <span className="text-sm text-gray-600">
            {progressXP} / {neededXP} XP
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-600">
            {nextLevelXP - user.total_xp} XP to level {user.level + 1}
          </span>
          <span className="text-xs text-green-600 font-medium">
            {user.total_xp} Total XP
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Character Stats
        </h4>
        
        {statsLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 animate-pulse">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-gray-300 rounded"></div>
                  <div className="w-16 h-3 bg-gray-300 rounded"></div>
                </div>
                <div className="w-8 h-6 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {statsWithIcons.map((stat, index) => (
              <motion.div
                key={stat.name}
                className="bg-gray-50 rounded-lg p-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`p-1 rounded ${stat.color}`}>
                    {stat.iconComponent}
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {stat.name}
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900 flex items-center gap-1">
                  {stat.value}
                  <span className="text-sm">{stat.icon}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Member since</span>
          <span className="font-medium text-gray-900">
            {new Date(user.created_at).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}