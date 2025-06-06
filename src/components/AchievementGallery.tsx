'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Crown, 
  Sparkles, 
  Lock, 
  Award,
  TrendingUp,
  Calendar,
  Target,
  Users,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';

interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  xp_reward: number;
  stat_bonus_type?: string;
  stat_bonus_amount?: number;
  is_hidden: boolean;
  display_order: number;
  unlocked_at?: string;
  progress?: {
    [key: string]: {
      current: number;
      required: number;
      percentage: number;
    };
  };
}

interface AchievementData {
  total_achievements: number;
  unlocked_achievements: number;
  unlocked_list: Achievement[];
  available_achievements: Achievement[];
  recent_achievements: Array<{
    title: string;
    icon: string;
    tier: string;
    unlocked_at: string;
  }>;
}

interface AchievementGalleryProps {
  userId: string;
  className?: string;
}

export function AchievementGallery({ userId, className = '' }: AchievementGalleryProps) {
  const [achievementData, setAchievementData] = useState<AchievementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'available' | 'hidden'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      
      // This would normally be an API call to get user achievements
      // For now, we'll simulate the data structure
      const response = await fetch('/api/achievements/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setAchievementData(data);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColors = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return {
          gradient: 'from-orange-400 to-amber-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-600'
        };
      case 'silver':
        return {
          gradient: 'from-gray-300 to-gray-500',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-600'
        };
      case 'gold':
        return {
          gradient: 'from-yellow-400 to-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-600'
        };
      case 'platinum':
        return {
          gradient: 'from-purple-400 to-purple-600',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-600'
        };
      case 'legendary':
        return {
          gradient: 'from-pink-500 to-red-500',
          bg: 'bg-pink-50',
          border: 'border-pink-200',
          text: 'text-pink-600'
        };
      default:
        return {
          gradient: 'from-blue-400 to-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-600'
        };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'progression':
        return TrendingUp;
      case 'consistency':
        return Calendar;
      case 'mastery':
        return Target;
      case 'social':
        return Users;
      case 'special':
        return Sparkles;
      default:
        return Award;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'progression':
        return 'text-blue-600 bg-blue-100';
      case 'consistency':
        return 'text-green-600 bg-green-100';
      case 'mastery':
        return 'text-purple-600 bg-purple-100';
      case 'social':
        return 'text-orange-600 bg-orange-100';
      case 'special':
        return 'text-pink-600 bg-pink-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getFilteredAchievements = () => {
    if (!achievementData) return [];
    
    let achievements: Achievement[] = [];
    
    switch (filter) {
      case 'unlocked':
        achievements = achievementData.unlocked_list;
        break;
      case 'available':
        achievements = achievementData.available_achievements.filter(a => !a.is_hidden || showHidden);
        break;
      case 'hidden':
        achievements = achievementData.available_achievements.filter(a => a.is_hidden);
        break;
      default:
        achievements = [
          ...achievementData.unlocked_list,
          ...achievementData.available_achievements.filter(a => !a.is_hidden || showHidden)
        ];
    }
    
    if (selectedCategory !== 'all') {
      achievements = achievements.filter(a => a.category === selectedCategory);
    }
    
    return achievements.sort((a, b) => a.display_order - b.display_order);
  };

  const getUniqueCategories = () => {
    if (!achievementData) return [];
    
    const allAchievements = [
      ...achievementData.unlocked_list,
      ...achievementData.available_achievements
    ];
    
    return Array.from(new Set(allAchievements.map(a => a.category)));
  };

  const formatProgress = (progress: Achievement['progress']) => {
    if (!progress) return null;
    
    const entries = Object.entries(progress);
    if (entries.length === 0) return null;
    
    return entries.map(([key, value]) => (
      <div key={key} className="text-sm">
        <div className="flex justify-between mb-1">
          <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
          <span className="font-medium">{value.current}/{value.required}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, value.percentage)}%` }}
          />
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  if (!achievementData) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Achievements Yet</h3>
          <p className="text-gray-600">Complete quests to start earning achievements!</p>
        </div>
      </div>
    );
  }

  const filteredAchievements = getFilteredAchievements();
  const categories = getUniqueCategories();
  const completionPercentage = Math.round((achievementData.unlocked_achievements / achievementData.total_achievements) * 100);

  return (
    <div className={className}>
      {/* Header Stats */}
      <div className="mb-8">
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Achievement Progress</p>
                <p className="text-3xl font-bold">{completionPercentage}%</p>
                <p className="text-blue-100 text-sm">{achievementData.unlocked_achievements} of {achievementData.total_achievements}</p>
              </div>
              <Trophy className="w-12 h-12 text-blue-200" />
            </div>
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Recent Achievements</p>
                <p className="text-3xl font-bold text-gray-900">{achievementData.recent_achievements.length}</p>
                <p className="text-gray-600 text-sm">This week</p>
              </div>
              <Star className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Available Achievements</p>
                <p className="text-3xl font-bold text-gray-900">{achievementData.available_achievements.length}</p>
                <p className="text-gray-600 text-sm">Ready to unlock</p>
              </div>
              <Zap className="w-12 h-12 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: achievementData.unlocked_achievements + achievementData.available_achievements.length },
              { key: 'unlocked', label: 'Unlocked', count: achievementData.unlocked_achievements },
              { key: 'available', label: 'Available', count: achievementData.available_achievements.filter(a => !a.is_hidden).length },
              { key: 'hidden', label: 'Hidden', count: achievementData.available_achievements.filter(a => a.is_hidden).length }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowHidden(!showHidden)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showHidden
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showHidden ? 'Hide Secret' : 'Show Secret'}
            </button>
          </div>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement, index) => {
          const isUnlocked = !!achievement.unlocked_at;
          const tierColors = getTierColors(achievement.tier);
          const CategoryIcon = getCategoryIcon(achievement.category);
          const categoryColor = getCategoryColor(achievement.category);

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={`bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                isUnlocked
                  ? `${tierColors.border} hover:scale-105`
                  : 'border-gray-200 hover:border-gray-300'
              } ${achievement.is_hidden ? 'ring-2 ring-purple-200' : ''}`}
              onClick={() => setSelectedAchievement(achievement)}
            >
              <div className={`p-6 ${isUnlocked ? tierColors.bg : 'bg-gray-50'} ${isUnlocked ? '' : 'opacity-75'}`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${categoryColor}`}>
                      <CategoryIcon className="w-4 h-4" />
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium uppercase ${tierColors.text} ${tierColors.bg}`}>
                      {achievement.tier}
                    </div>
                  </div>
                  
                  {achievement.is_hidden && (
                    <div className="p-1 bg-purple-100 text-purple-600 rounded">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Icon and Title */}
                <div className="text-center mb-4">
                  <div className={`text-4xl mb-2 ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                    {isUnlocked ? achievement.icon : '🔒'}
                  </div>
                  <h3 className={`font-bold text-lg mb-2 ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>
                </div>

                {/* Progress or Rewards */}
                {isUnlocked ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-yellow-600">+{achievement.xp_reward} XP</span>
                    </div>
                    {achievement.unlocked_at && (
                      <p className="text-xs text-gray-500 text-center">
                        Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {achievement.progress && formatProgress(achievement.progress)}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Sparkles className="w-4 h-4" />
                        <span>Reward: +{achievement.xp_reward} XP</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Achievements Found</h3>
          <p className="text-gray-600">Try adjusting your filters or complete more quests!</p>
        </div>
      )}

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`p-6 bg-gradient-to-r ${getTierColors(selectedAchievement.tier).gradient} text-white rounded-t-lg`}>
                <div className="text-center">
                  <div className="text-5xl mb-3">{selectedAchievement.icon}</div>
                  <h3 className="text-xl font-bold mb-1">{selectedAchievement.title}</h3>
                  <p className="text-white/90 text-sm">{selectedAchievement.description}</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium capitalize">{selectedAchievement.category}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tier:</span>
                    <span className={`font-medium capitalize ${getTierColors(selectedAchievement.tier).text}`}>
                      {selectedAchievement.tier}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">XP Reward:</span>
                    <span className="font-medium text-yellow-600">+{selectedAchievement.xp_reward}</span>
                  </div>
                  
                  {selectedAchievement.unlocked_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Unlocked:</span>
                      <span className="font-medium">
                        {new Date(selectedAchievement.unlocked_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}