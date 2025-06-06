'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  BarChart3,
  Plus,
  Target,
  Trophy,
  Star,
  Sword,
  Brain,
  Heart,
  Users,
  Zap,
  Flame,
  Crown,
  CheckCircle,
  Clock,
  TrendingUp,
  X,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { AuthGuard } from '@/components/AuthGuard';
import { QuestCard } from '@/components/QuestCard';
import { QuestCreator } from '@/components/QuestCreator';
import { useQuests } from '@/src/hooks/useQuests';
import { Quest } from '@/src/types/database';
import { getDifficultyColor, getStatInfo } from '@/lib/quest-utils';
import toast from 'react-hot-toast';

// Types for filtering and sorting
type FilterOptions = {
  status: 'all' | 'active' | 'completed';
  category: string;
  difficulty: string;
  primaryStat: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
  search: string;
};

type SortOptions = {
  field: 'created_at' | 'xp_reward' | 'title' | 'difficulty' | 'completed_at';
  direction: 'asc' | 'desc';
};

export default function QuestsPage() {
  const { user, userProfile } = useAuth();
  const { 
    quests, 
    loading, 
    activeQuests, 
    completedQuests,
    createQuest,
    completeQuest,
    deleteQuest,
    refreshQuests
  } = useQuests();

  // UI State
  const [showCreator, setShowCreator] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Filter and Sort State
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    category: 'all',
    difficulty: 'all',
    primaryStat: 'all',
    dateRange: 'all',
    search: ''
  });

  const [sort, setSort] = useState<SortOptions>({
    field: 'created_at',
    direction: 'desc'
  });

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = Array.from(new Set(quests.map(q => q.category))).filter(Boolean);
    const difficulties = Array.from(new Set(quests.map(q => q.difficulty)));
    const stats = Array.from(new Set(quests.map(q => q.primary_stat))).filter(Boolean);
    
    return {
      categories: categories.length > 0 ? categories : ['health', 'education', 'career', 'home', 'social', 'creative', 'daily_life', 'finance'],
      difficulties,
      stats
    };
  }, [quests]);

  // Filter and sort quests
  const filteredAndSortedQuests = useMemo(() => {
    let filtered = [...quests];

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(q => q.status === filters.status);
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(q => q.category === filters.category);
    }

    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === filters.difficulty);
    }

    if (filters.primaryStat !== 'all') {
      filtered = filtered.filter(q => q.primary_stat === filters.primaryStat);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchLower) ||
        q.description?.toLowerCase().includes(searchLower) ||
        q.original_task.toLowerCase().includes(searchLower)
      );
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setDate(now.getDate());
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(q => {
        const questDate = new Date(q.created_at);
        return questDate >= filterDate;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sort.field) {
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'completed_at':
          aValue = a.completed_at ? new Date(a.completed_at) : new Date(0);
          bValue = b.completed_at ? new Date(b.completed_at) : new Date(0);
          break;
        case 'xp_reward':
          aValue = a.xp_reward;
          bValue = b.xp_reward;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3, epic: 4 };
          aValue = difficultyOrder[a.difficulty];
          bValue = difficultyOrder[b.difficulty];
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [quests, filters, sort]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalQuests = quests.length;
    const activeCount = activeQuests.length;
    const completedCount = completedQuests.length;
    const completionRate = totalQuests > 0 ? Math.round((completedCount / totalQuests) * 100) : 0;
    
    const totalXPEarned = completedQuests.reduce((sum, quest) => sum + quest.xp_reward, 0);
    
    // XP by category
    const xpByCategory = completedQuests.reduce((acc, quest) => {
      acc[quest.category] = (acc[quest.category] || 0) + quest.xp_reward;
      return acc;
    }, {} as Record<string, number>);

    // Quests by difficulty
    const questsByDifficulty = quests.reduce((acc, quest) => {
      acc[quest.difficulty] = (acc[quest.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentQuests = completedQuests.filter(q => 
      q.completed_at && new Date(q.completed_at) >= weekAgo
    );

    return {
      totalQuests,
      activeCount,
      completedCount,
      completionRate,
      totalXPEarned,
      xpByCategory,
      questsByDifficulty,
      recentActivity: recentQuests.length,
      averageXPPerQuest: completedCount > 0 ? Math.round(totalXPEarned / completedCount) : 0
    };
  }, [quests, activeQuests, completedQuests]);

  // Handler functions
  const handleQuestCreated = async (newQuest: any) => {
    const createdQuest = await createQuest(newQuest);
    if (createdQuest) {
      setShowCreator(false);
      toast.success('🎉 New quest added to your adventure!');
    }
  };

  const handleQuestCompleted = async (questId: string) => {
    const success = await completeQuest(questId);
    if (success) {
      // Refresh will happen automatically through the hook
    }
  };

  const handleQuestDeleted = async (questId: string) => {
    await deleteQuest(questId);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      category: 'all',
      difficulty: 'all',
      primaryStat: 'all',
      dateRange: 'all',
      search: ''
    });
  };

  const exportQuests = () => {
    const data = filteredAndSortedQuests.map(quest => ({
      title: quest.title,
      description: quest.description,
      originalTask: quest.original_task,
      category: quest.category,
      difficulty: quest.difficulty,
      xpReward: quest.xp_reward,
      status: quest.status,
      primaryStat: quest.primary_stat,
      createdAt: quest.created_at,
      completedAt: quest.completed_at
    }));

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `herofy-quests-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    toast.success('Quests exported successfully!');
  };

  if (!user || !userProfile) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your quest archive...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <Sword className="w-8 h-8 text-blue-500" />
                  Quest Archive
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage your heroic adventures and track your epic journey
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                    showStats 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </button>
                
                <button
                  onClick={() => setShowCreator(!showCreator)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Quest
                </button>
              </div>
            </div>
          </motion.div>

          {/* Statistics Panel */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Quest Analytics
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Target className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{statistics.totalQuests}</div>
                      <div className="text-sm text-gray-600">Total Quests</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Sword className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{statistics.activeCount}</div>
                      <div className="text-sm text-gray-600">Active</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{statistics.completedCount}</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Trophy className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{statistics.completionRate}%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{statistics.totalXPEarned}</div>
                      <div className="text-sm text-gray-600">Total XP</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{statistics.recentActivity}</div>
                      <div className="text-sm text-gray-600">This Week</div>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* XP by Category */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">XP by Category</h4>
                      <div className="space-y-2">
                        {Object.entries(statistics.xpByCategory)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 5)
                          .map(([category, xp]) => (
                            <div key={category} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 capitalize">{category.replace('_', ' ')}</span>
                              <span className="font-medium text-gray-900">{xp} XP</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>

                    {/* Quests by Difficulty */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Quests by Difficulty</h4>
                      <div className="space-y-2">
                        {Object.entries(statistics.questsByDifficulty).map(([difficulty, count]) => (
                          <div key={difficulty} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 capitalize flex items-center gap-2">
                              {difficulty === 'easy' && <Zap className="w-3 h-3" />}
                              {difficulty === 'medium' && <Star className="w-3 h-3" />}
                              {difficulty === 'hard' && <Flame className="w-3 h-3" />}
                              {difficulty === 'epic' && <Crown className="w-3 h-3" />}
                              {difficulty}
                            </span>
                            <span className="font-medium text-gray-900">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quest Creator */}
          <AnimatePresence>
            {showCreator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <QuestCreator
                  userId={user.id}
                  userLevel={userProfile.level}
                  characterClass={userProfile.character_class}
                  onQuestCreated={handleQuestCreated}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters and Search */}
          <motion.div
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Search and Quick Actions */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search quests by title, description, or original task..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                    showFilters 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                
                <button
                  onClick={exportQuests}
                  className="px-4 py-3 rounded-lg font-medium flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                
                <button
                  onClick={() => refreshQuests()}
                  className="px-4 py-3 rounded-lg font-medium flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-200 pt-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Categories</option>
                        {filterOptions.categories.map(cat => (
                          <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>

                    {/* Difficulty Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                      <select
                        value={filters.difficulty}
                        onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Difficulties</option>
                        {filterOptions.difficulties.map(diff => (
                          <option key={diff} value={diff}>{diff}</option>
                        ))}
                      </select>
                    </div>

                    {/* Primary Stat Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Stat</label>
                      <select
                        value={filters.primaryStat}
                        onChange={(e) => setFilters(prev => ({ ...prev, primaryStat: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Stats</option>
                        {filterOptions.stats.map(stat => {
                          const statInfo = getStatInfo(stat);
                          return (
                            <option key={stat} value={stat}>
                              {statInfo.icon} {statInfo.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                      <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>

                    {/* Sort Options */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                      <div className="flex gap-1">
                        <select
                          value={sort.field}
                          onChange={(e) => setSort(prev => ({ ...prev, field: e.target.value as any }))}
                          className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="created_at">Created Date</option>
                          <option value="completed_at">Completed Date</option>
                          <option value="xp_reward">XP Reward</option>
                          <option value="title">Title</option>
                          <option value="difficulty">Difficulty</option>
                        </select>
                        <button
                          onClick={() => setSort(prev => ({ 
                            ...prev, 
                            direction: prev.direction === 'asc' ? 'desc' : 'asc' 
                          }))}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg transition-colors"
                        >
                          {sort.direction === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Showing {filteredAndSortedQuests.length} of {quests.length} quests
                    </p>
                    
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Quest List */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your epic quests...</p>
              </div>
            ) : filteredAndSortedQuests.length === 0 ? (
              <motion.div
                className="text-center py-12 bg-white rounded-lg border border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="max-w-md mx-auto">
                  {filters.search || filters.status !== 'all' || filters.category !== 'all' ? (
                    <>
                      <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No Quests Match Your Filters
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your search criteria or filters to find more quests.
                      </p>
                      <button
                        onClick={clearFilters}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </>
                  ) : (
                    <>
                      <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No Quests Yet
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Ready to start your heroic journey? Create your first quest and begin your adventure!
                      </p>
                      <button
                        onClick={() => setShowCreator(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Create Your First Quest
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {filteredAndSortedQuests.map((quest, index) => (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                  >
                    <QuestCard
                      quest={quest}
                      onComplete={handleQuestCompleted}
                      onDelete={quest.status === 'active' ? handleQuestDeleted : undefined}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}