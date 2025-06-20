'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Sword, 
  Trophy, 
  Target,
  Sparkles,
  Calendar,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { QuestCreator } from '@/components/QuestCreator';
import { QuestCard } from '@/components/QuestCard';
import { UserProfile } from '@/components/UserProfile';
import { AuthGuard } from '@/components/AuthGuard';
import toast from 'react-hot-toast';
import { useQuests } from '@/src/hooks/useQuests';
import { Suspense } from 'react';

function DashboardContent() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const { 
    quests, 
    loading: questsLoading, 
    createQuest,
    completeQuest,
    deleteQuest,
    getQuestsByFilter 
  } = useQuests();

  const [showCreator, setShowCreator] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };
  
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return isSameDay(date, today);
  };
  
  // 🔧 NEW: Add this UTC-aware date parser
  const parseUTCDate = (dateString: string): Date => {
    // If the date string doesn't end with 'Z', it's stored as UTC but doesn't specify timezone
    // We need to append 'Z' to tell JavaScript it's UTC
    if (!dateString.endsWith('Z') && !dateString.includes('+')) {
      return new Date(dateString + 'Z');
    }
    return new Date(dateString);
  };
  // Check if we should show creator from URL params
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowCreator(true);
    }
  }, [searchParams]);

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
      setTimeout(() => {
        if (window.location.pathname === '/dashboard') {
          window.location.reload();
        }
      }, 2000);
    }
  };

  const handleQuestDeleted = async (questId: string) => {
    await deleteQuest(questId);
  };

  

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your heroic dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Your Adventure?
          </h1>
          <p className="text-gray-600 mb-6">
            Sign in to access your heroic dashboard and manage your quests.
          </p>
          <a
            href="/login"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Sign In to Continue
          </a>
        </div>
      </div>
    );
  }

  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');
  
  const filteredQuests = filter === 'all' ? quests : 
                        filter === 'active' ? activeQuests : 
                        completedQuests;

    const totalXPToday = completedQuests
    .filter(q => {
        if (!q.completed_at) return false;
        const completedDate = parseUTCDate(q.completed_at); // 🔧 Use parseUTCDate
        return isToday(completedDate);
    })
    .reduce((total, quest) => total + quest.xp_reward, 0);
    
    const completedTodayCount = completedQuests.filter(q => {
    if (!q.completed_at) return false;
    const completedDate = parseUTCDate(q.completed_at); // 🔧 Use parseUTCDate
    return isToday(completedDate);
    }).length;

    // console.log('Debug - Quest times:', completedQuests.map(q => ({
    //     title: q.title,
    //     completed_at: q.completed_at,
    //     isToday: q.completed_at ? isToday(new Date(q.completed_at)) : false
    //   })));
    //   console.log('Debug - Today counts:', { completedTodayCount, totalXPToday });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome back, <span className="text-gradient">Hero</span>! 🎯
            </h1>
            <p className="text-gray-600 text-lg">
              Ready to conquer today's quests and level up your life?
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats Cards */}
            <motion.div
              className="grid md:grid-cols-3 gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Quests</p>
                    <p className="text-3xl font-bold text-gray-900">{activeQuests.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Sword className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Today</p>
                    <p className="text-3xl font-bold text-gray-900">{completedTodayCount}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">XP Today</p>
                    <p className="text-3xl font-bold text-gray-900">{totalXPToday}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Sparkles className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quest Creation */}
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
                    userId={user?.id || ''}
                    userLevel={userProfile?.level || 1}
                    characterClass={userProfile?.character_class || 'Life Adventurer'}
                    onQuestCreated={handleQuestCreated}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quest Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Quests</h2>
                <p className="text-gray-600">Manage your heroic adventures</p>
              </div>

              <div className="flex items-center gap-4">
                {/* Filter Tabs */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {[
                    { key: 'active', label: 'Active', count: activeQuests.length },
                    { key: 'completed', label: 'Completed', count: completedQuests.length },
                    { key: 'all', label: 'All', count: quests.length }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key as any)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        filter === tab.key
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>

                {/* Add Quest Button */}
                {!showCreator && (
                  <button
                    onClick={() => setShowCreator(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Quest
                  </button>
                )}
              </div>
            </div>

            {/* Quest List */}
            <div className="space-y-6">
              {questsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your quests...</p>
                </div>
              ) : filteredQuests.length === 0 ? (
                <motion.div
                  className="text-center py-12 bg-white rounded-lg border border-gray-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="max-w-md mx-auto">
                    {filter === 'active' ? (
                      <>
                        <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          No Active Quests
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Ready to start your heroic journey? Create your first quest and begin leveling up your life!
                        </p>
                        <button
                          onClick={() => setShowCreator(true)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                          Create Your First Quest
                        </button>
                      </>
                    ) : (
                      <>
                        <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          No {filter === 'completed' ? 'Completed' : ''} Quests Yet
                        </h3>
                        <p className="text-gray-600">
                          {filter === 'completed' 
                            ? 'Complete some quests to see your achievements here!'
                            : 'Start creating quests to see them here!'
                          }
                        </p>
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
                  {filteredQuests.map((quest, index) => (
                    <motion.div
                      key={quest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {userProfile && (
                <UserProfile 
                  user={userProfile}
                  className="mb-6"
                />
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCreator(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Quest
                  </button>
                  
                  <a
                    href="/profile"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Full Stats
                  </a>
                </div>
              </div>

              {/* Daily Progress */}
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Today's Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-100">Quests Completed</span>
                    <span className="font-bold">{completedTodayCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-100">XP Earned</span>
                    <span className="font-bold">+{totalXPToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-100">Level</span>
                    <span className="font-bold">{userProfile?.level || 1}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}