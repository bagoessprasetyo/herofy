'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Calendar,
  Target,
  CheckCircle,
  TrendingUp,
  Award,
  Sword,
  Brain,
  Heart,
  Users,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { AuthGuard } from '@/components/AuthGuard';
// import { useQuests } from '@/hooks/useQuests';
import { db } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useQuests } from '@/src/hooks/useQuests';

export default function ProfilePage() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const { quests, completedQuests, activeQuests } = useQuests();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    character_class: '',
  });

  useEffect(() => {
    if (userProfile) {
      setEditData({
        username: userProfile.username || '',
        character_class: userProfile.character_class || '',
      });
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!user || !userProfile) return;

    try {
      const { error } = await db.updateUserProfile(user.id, {
        username: editData.username || null,
        character_class: editData.character_class || 'Life Adventurer',
      });

      if (error) {
        toast.error('Failed to update profile');
        return;
      }

      await refreshUserProfile();
      setIsEditing(false);
      toast.success('Profile updated successfully! 🎉');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    if (userProfile) {
      setEditData({
        username: userProfile.username || '',
        character_class: userProfile.character_class || '',
      });
    }
    setIsEditing(false);
  };

  if (!userProfile) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your hero profile...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  // Calculate statistics
  const totalQuests = quests.length;
  const completionRate = totalQuests > 0 ? Math.round((completedQuests.length / totalQuests) * 100) : 0;
  
  const questsThisWeek = completedQuests.filter(quest => {
    const completedDate = new Date(quest.completed_at || '');
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return completedDate >= weekAgo;
  }).length;

  const totalXPEarned = userProfile.total_xp;
  const currentLevel = userProfile.level;
  
  // Calculate next level progress
  const currentLevelXP = (currentLevel - 1) * 1000;
  const nextLevelXP = currentLevel * 1000;
  const progressXP = totalXPEarned - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const progressPercentage = Math.min((progressXP / neededXP) * 100, 100);

  // Calculate character stats
  const characterStats = [
    {
      name: 'Strength',
      value: currentLevel + Math.floor(totalXPEarned / 500),
      icon: <Sword className="w-5 h-5" />,
      color: 'text-red-600 bg-red-100',
      description: 'Physical challenges and endurance quests'
    },
    {
      name: 'Wisdom',
      value: currentLevel + Math.floor(totalXPEarned / 600),
      icon: <Brain className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-100',
      description: 'Learning, studying, and knowledge quests'
    },
    {
      name: 'Endurance',
      value: currentLevel + Math.floor(totalXPEarned / 700),
      icon: <Heart className="w-5 h-5" />,
      color: 'text-green-600 bg-green-100',
      description: 'Health, fitness, and wellness quests'
    },
    {
      name: 'Charisma',
      value: currentLevel + Math.floor(totalXPEarned / 800),
      icon: <Users className="w-5 h-5" />,
      color: 'text-yellow-600 bg-yellow-100',
      description: 'Social interactions and career quests'
    }
  ];

  const achievements = [
    {
      title: 'First Steps',
      description: 'Complete your first quest',
      unlocked: completedQuests.length >= 1,
      icon: '🏃‍♂️'
    },
    {
      title: 'Quest Master',
      description: 'Complete 10 quests',
      unlocked: completedQuests.length >= 10,
      icon: '⚔️'
    },
    {
      title: 'Level Up!',
      description: 'Reach level 5',
      unlocked: currentLevel >= 5,
      icon: '📈'
    },
    {
      title: 'Consistent Hero',
      description: 'Complete quests 7 days in a row',
      unlocked: questsThisWeek >= 7,
      icon: '🔥'
    },
    {
      title: 'XP Collector',
      description: 'Earn 5,000 total XP',
      unlocked: totalXPEarned >= 5000,
      icon: '💎'
    },
    {
      title: 'Epic Adventurer',
      description: 'Complete 50 quests',
      unlocked: completedQuests.length >= 50,
      icon: '👑'
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Hero Profile
            </h1>
            <p className="text-gray-600 text-lg">
              Track your progress and view your legendary achievements
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1">
              <motion.div
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-blue-100 mb-1">Username</label>
                        <input
                          type="text"
                          value={editData.username}
                          onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
                          placeholder="Enter username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-blue-100 mb-1">Character Class</label>
                        <select
                          value={editData.character_class}
                          onChange={(e) => setEditData(prev => ({ ...prev, character_class: e.target.value }))}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                        >
                          <option value="Life Adventurer">Life Adventurer</option>
                          <option value="Productivity Warrior">Productivity Warrior</option>
                          <option value="Wellness Guardian">Wellness Guardian</option>
                          <option value="Knowledge Seeker">Knowledge Seeker</option>
                          <option value="Creative Mage">Creative Mage</option>
                          <option value="Social Champion">Social Champion</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveProfile}
                          className="flex-1 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        {userProfile.username || user?.email?.split('@')[0] || 'Hero'}
                      </h2>
                      <p className="text-blue-100 mb-3">{userProfile.character_class}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-300" />
                          <span className="font-bold text-lg">Level {currentLevel}</span>
                        </div>
                        <div className="text-blue-100 text-sm">
                          {totalXPEarned} Total XP
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* XP Progress */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Level Progress</span>
                    <span className="text-sm text-gray-600">
                      {progressXP} / {neededXP} XP
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {Math.max(0, nextLevelXP - totalXPEarned)} XP to level {currentLevel + 1}
                  </p>
                </div>

                {/* Member Since */}
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Member since
                    </span>
                    <span className="font-medium text-gray-900">
                      {new Date(userProfile.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Stats and Achievements */}
            <div className="lg:col-span-2 space-y-8">
              {/* Statistics */}
              <motion.div
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quest Statistics
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{totalQuests}</div>
                    <div className="text-sm text-gray-600">Total Quests</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{completedQuests.length}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{questsThisWeek}</div>
                    <div className="text-sm text-gray-600">This Week</div>
                  </div>
                </div>
              </motion.div>

              {/* Character Stats */}
              <motion.div
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Sword className="w-5 h-5" />
                  Character Stats
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {characterStats.map((stat, index) => (
                    <motion.div
                      key={stat.name}
                      className="bg-gray-50 rounded-lg p-4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index, duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${stat.color}`}>
                            {stat.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{stat.name}</h4>
                            <p className="text-xs text-gray-600">{stat.description}</p>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Achievements */}
              <motion.div
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements ({unlockedAchievements.length}/{achievements.length})
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.title}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        achievement.unlocked
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.3 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <h4 className={`font-semibold ${
                            achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {achievement.title}
                          </h4>
                          <p className={`text-sm ${
                            achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {achievement.description}
                          </p>
                        </div>
                        {achievement.unlocked && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}