'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  Users, 
  Settings, 
  Eye, 
  EyeOff,
  Sword,
  Shield,
  Sparkles,
  TrendingUp,
  RefreshCw,
  User,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { AuthGuard } from '@/components/AuthGuard';
import { useLeaderboard, LeaderboardEntry } from '@/src/hooks/useLeaderboard';
import toast from 'react-hot-toast';

export default function LeaderboardPage() {
  const { user, userProfile } = useAuth();
  const { 
    leaderboard, 
    userSettings, 
    loading, 
    error, 
    refreshLeaderboard, 
    updateUserSettings 
  } = useLeaderboard();

  const [showSettings, setShowSettings] = useState(false);
  const [viewLimit, setViewLimit] = useState(50);
  const [editingSettings, setEditingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    is_public: false,
    display_name: '',
    show_real_name: false
  });

  // Initialize settings form when userSettings loads
  useEffect(() => {
    if (userSettings) {
      setSettingsForm({
        is_public: userSettings.is_public,
        display_name: userSettings.display_name || '',
        show_real_name: userSettings.show_real_name
      });
    }
  }, [userSettings]);

  const handleUpdateSettings = async () => {
    try {
      const success = await updateUserSettings(settingsForm);
      if (success) {
        toast.success('🎉 Leaderboard settings updated!');
        setEditingSettings(false);
        setShowSettings(false);
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      toast.error('Failed to update settings');
      console.error('Settings update error:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-amber-400 to-amber-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  const getClassIcon = (characterClass: string) => {
    switch (characterClass) {
      case 'Life Adventurer':
        return '🌟';
      case 'Productivity Warrior':
        return '⚔️';
      case 'Wellness Guardian':
        return '🛡️';
      case 'Knowledge Seeker':
        return '📚';
      case 'Creative Mage':
        return '✨';
      case 'Social Champion':
        return '👑';
      default:
        return '🎯';
    }
  };

  const displayedLeaderboard = leaderboard.slice(0, viewLimit);

  if (!user || !userProfile) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

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
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-10 h-10 text-yellow-500" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Global <span className="text-gradient">Leaderboard</span>
              </h1>
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Witness the legendary heroes who have conquered the most epic quests and earned their place in the Hall of Fame!
            </p>
          </motion.div>

          {/* Controls */}
          <motion.div
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Show:</span>
                <select
                  value={viewLimit}
                  onChange={(e) => setViewLimit(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={10}>Top 10</option>
                  <option value={25}>Top 25</option>
                  <option value={50}>Top 50</option>
                  <option value={100}>Top 100</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{userSettings?.total_participants || 0} Heroes Competing</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={refreshLeaderboard}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </motion.div>

          {/* User's Current Position */}
          {userSettings?.is_public && userSettings.current_rank && (
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 text-white mb-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">Your Heroic Rank</h3>
                  <p className="text-purple-100">Keep climbing the ladder of legends!</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">#{userSettings.current_rank}</div>
                  <div className="text-purple-200 text-sm">of {userSettings.total_participants}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Leaderboard Privacy Settings
                  </h3>
                  
                  {editingSettings ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="is_public"
                          checked={settingsForm.is_public}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, is_public: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="is_public" className="font-medium text-gray-700">
                          Show me on the public leaderboard
                        </label>
                      </div>

                      {settingsForm.is_public && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Display Name (optional)
                            </label>
                            <input
                              type="text"
                              value={settingsForm.display_name}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, display_name: e.target.value }))}
                              placeholder="Enter a hero name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              maxLength={50}
                            />
                          </div>

                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id="show_real_name"
                              checked={settingsForm.show_real_name}
                              onChange={(e) => setSettingsForm(prev => ({ ...prev, show_real_name: e.target.checked }))}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="show_real_name" className="text-sm text-gray-700">
                              Use my real username instead of display name
                            </label>
                          </div>
                        </>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={handleUpdateSettings}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save Settings
                        </button>
                        <button
                          onClick={() => setEditingSettings(false)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Public Visibility:</span>
                        <div className="flex items-center gap-2">
                          {userSettings?.is_public ? (
                            <>
                              <Eye className="w-4 h-4 text-green-600" />
                              <span className="text-green-600 font-medium">Visible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-500 font-medium">Hidden</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {userSettings?.is_public && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Display Name:</span>
                          <span className="font-medium text-gray-900">
                            {userSettings.display_name || 'Anonymous Hero'}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => setEditingSettings(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Settings
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Leaderboard */}
          <motion.div
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Hall of Heroes
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading legendary heroes...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="text-red-500 mb-4">⚠️ Error loading leaderboard</div>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={refreshLeaderboard}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : displayedLeaderboard.length === 0 ? (
              <div className="p-12 text-center">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Heroes Yet</h3>
                <p className="text-gray-600 mb-4">
                  Be the first to join the leaderboard! Complete quests and enable public visibility in settings.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {displayedLeaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50' : ''
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getRankBadgeColor(entry.rank)} flex items-center justify-center`}>
                          {getRankIcon(entry.rank)}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-gray-900 text-lg">
                              {entry.display_name}
                            </h3>
                            <span className="text-2xl">{getClassIcon(entry.character_class)}</span>
                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                              {entry.character_class}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-blue-500" />
                              <span>Level {entry.level}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-4 h-4 text-purple-500" />
                              <span>{entry.total_xp} XP</span>
                            </div>
                            <div className="text-gray-500">
                              Hero since {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {entry.total_xp.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total XP</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Load More Button */}
          {leaderboard.length > viewLimit && (
            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <button
                onClick={() => setViewLimit(prev => Math.min(prev + 25, leaderboard.length))}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Load More Heroes
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}