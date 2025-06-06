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
  CheckCircle,
  Award,
  Crown,
  Star,
  TrendingUp,
  Zap,
  ArrowRight,
  Play,
  Shield,
  Users
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { QuestCreator } from '@/components/QuestCreator';
import { QuestCard } from '@/components/QuestCard';
import { UserProfile } from '@/components/UserProfile';
import { AuthGuard } from '@/components/AuthGuard';
import { AchievementNotification } from '@/components/AchievementNotification';
import toast from 'react-hot-toast';
import { useQuests } from '@/src/hooks/useQuests';
import { useAchievements } from '@/src/hooks/useAchievements';
import { Suspense } from 'react';
import Link from 'next/link';

function DashboardContent() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };
  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Quest Generation",
      description: "Transform any boring task into an epic RPG quest with the power of AI"
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Level Up System",
      description: "Gain XP and level up your character as you complete real-world achievements"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "RPG Stats",
      description: "Build your Strength, Wisdom, Endurance, and Charisma through different quest types"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Social Quests",
      description: "Share your adventures and compete with friends on epic leaderboards"
    }
  ];
  const searchParams = useSearchParams();
  const { 
    quests, 
    loading: questsLoading, 
    createQuest,
    completeQuest,
    deleteQuest,
    getQuestsByFilter 
  } = useQuests();

  // 🎉 NEW: Achievement system integration
  const { 
    achievementData, 
    loading: achievementsLoading, 
    newAchievements, 
    checkForNewAchievements, 
    clearNewAchievements 
  } = useAchievements();

  const [showCreator, setShowCreator] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  
  // 🎉 NEW: Achievement notification state
  const [showAchievementNotification, setShowAchievementNotification] = useState(false);
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Developer",
      content: "Herofy turned my boring daily routine into an epic adventure. I actually look forward to doing chores now!",
      avatar: "👩‍💻"
    },
    {
      name: "Marcus Rodriguez",
      role: "Student",
      content: "Finally, a productivity app that doesn't feel like work. My study sessions are now legendary quests!",
      avatar: "🧙‍♂️"
    },
    {
      name: "Lisa Johnson",
      role: "Entrepreneur",
      content: "The gamification is brilliant. I've completed more goals in 3 months than I did all last year.",
      avatar: "⚡"
    }
  ];
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };
  
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return isSameDay(date, today);
  };
  
  const parseUTCDate = (dateString: string): Date => {
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

  // 🎉 NEW: Show achievement notifications when new achievements arrive
  useEffect(() => {
    if (newAchievements.length > 0) {
      setShowAchievementNotification(true);
    }
  }, [newAchievements]);

  const handleQuestCreated = async (newQuest: any) => {
    const createdQuest = await createQuest(newQuest);
    if (createdQuest) {
      setShowCreator(false);
      toast.success('🎉 New quest added to your adventure!');
      
      // 🎉 NEW: Check for achievements after quest creation
      setTimeout(async () => {
        await checkForNewAchievements();
      }, 1000);
    }
  };

  const handleQuestCompleted = async (questId: string) => {
    const success = await completeQuest(questId);
    if (success) {
      // 🎉 NEW: Check for achievements after quest completion
      setTimeout(async () => {
        const newAchievements = await checkForNewAchievements();
        if (newAchievements.length > 0) {
          toast.success(`🏆 ${newAchievements.length} Achievement${newAchievements.length > 1 ? 's' : ''} Unlocked!`, {
            duration: 6000
          });
        }
      }, 2000);

      setTimeout(() => {
        if (window.location.pathname === '/dashboard') {
          window.location.reload();
        }
      }, 4000);
    }
  };

  const handleQuestDeleted = async (questId: string) => {
    await deleteQuest(questId);
  };

  // 🎉 NEW: Achievement notification close handler
  const handleAchievementNotificationClose = () => {
    setShowAchievementNotification(false);
    setTimeout(() => {
      clearNewAchievements();
    }, 300);
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
        <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
            <motion.div
              className="text-center"
              {...fadeInUp}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Transform Your Life Into an Epic Adventure
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                Turn Tasks Into
                <span className="text-gradient block">Epic Quests</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Stop struggling with boring to-do lists. Herofy transforms your daily tasks into exciting RPG quests, 
                complete with XP, leveling, and character progression. Become the hero of your own life story.
              </p>
  
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Link
                  href="/signup"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 inline-flex items-center justify-center shadow-lg"
                >
                  Start Your Adventure
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                
                <button className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg border border-gray-300 transition-colors inline-flex items-center justify-center">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </button>
              </motion.div>
  
              {/* Hero Demo */}
              <motion.div
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">See the Magic in Action:</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2">❌ Boring Task:</h4>
                      <p className="text-gray-600">"Do laundry"</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-4 rounded-lg text-white">
                      <h4 className="font-medium mb-2">⚔️ Epic Quest:</h4>
                      <p className="text-sm opacity-90">"Cleanse the Cursed Garments of Chaos"</p>
                      <div className="flex items-center mt-2">
                        <Star className="w-4 h-4 text-yellow-300 mr-1" />
                        <span className="text-yellow-300 font-semibold">+50 XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
  
        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Heroes Choose Herofy
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                More than just gamification - it's a complete system for turning your life into an epic adventure
              </p>
            </motion.div>
  
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow"
                  variants={fadeInUp}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
  
        {/* How It Works Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Your Journey to Heroism
              </h2>
              <p className="text-xl text-gray-600">
                Four simple steps to transform your life into an epic adventure
              </p>
            </motion.div>
  
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "1", icon: <Sword className="w-8 h-8" />, title: "Add Your Task", desc: "Enter any boring task or goal" },
                { step: "2", icon: <Sparkles className="w-8 h-8" />, title: "AI Transforms It", desc: "Watch it become an epic quest" },
                { step: "3", icon: <Trophy className="w-8 h-8" />, title: "Complete & Level Up", desc: "Gain XP and improve your stats" },
                { step: "4", icon: <Crown className="w-8 h-8" />, title: "Become a Hero", desc: "Build habits that last forever" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                      {item.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center text-sm font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Join Thousands of Heroes
              </h2>
              <p className="text-xl text-gray-600">
                See how Herofy is transforming lives around the world
              </p>
            </motion.div>
  
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-50 p-6 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{testimonial.avatar}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
  
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Become a Hero?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of people who have transformed their lives with Herofy. 
                Your epic adventure starts with a single quest.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
                >
                  Start Free Adventure
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-white hover:bg-white hover:text-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center justify-center"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
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
        const completedDate = parseUTCDate(q.completed_at);
        return isToday(completedDate);
    })
    .reduce((total, quest) => total + quest.xp_reward, 0);
    
  const completedTodayCount = completedQuests.filter(q => {
    if (!q.completed_at) return false;
    const completedDate = parseUTCDate(q.completed_at);
    return isToday(completedDate);
  }).length;

  // 🎉 NEW: Achievement summary component for sidebar
  const AchievementSummaryWidget = () => {
    if (achievementsLoading || !achievementData) {
      return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <div className="animate-pulse">
            <div className="h-5 bg-gray-200 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }

    const completionPercentage = Math.round(
      (achievementData.unlocked_achievements / achievementData.total_achievements) * 100
    );

    return (
      <motion.div
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Achievements
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">
                {achievementData.unlocked_achievements}/{achievementData.total_achievements}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {completionPercentage}% Complete
            </div>
          </div>

          {achievementData.recent_achievements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Unlocks</h4>
              <div className="space-y-2">
                {achievementData.recent_achievements.slice(0, 3).map((achievement, index) => {
                  const tierColors = {
                    bronze: 'text-orange-600',
                    silver: 'text-gray-600', 
                    gold: 'text-yellow-600',
                    platinum: 'text-purple-600',
                    legendary: 'text-pink-600'
                  };
                  
                  return (
                    <motion.div 
                      key={index} 
                      className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + (index * 0.1) }}
                    >
                      <span className="text-lg">{achievement.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{achievement.title}</div>
                        <div className={`text-xs ${tierColors[achievement.tier as keyof typeof tierColors]} font-medium uppercase`}>
                          {achievement.tier}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          <a
            href="/achievements"
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium text-center inline-block transition-all duration-200"
          >
            View All Achievements
          </a>
        </div>
      </motion.div>
    );
  };

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

              {/* 🎉 NEW: Achievement Summary Widget */}
              <AchievementSummaryWidget />

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

                  {/* 🎉 NEW: Achievement link */}
                  <a
                    href="/achievements"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-200"
                  >
                    <Award className="w-4 h-4" />
                    View Achievements
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
                  {/* 🎉 NEW: Achievement progress */}
                  {achievementData && (
                    <div className="flex justify-between items-center pt-2 border-t border-purple-400/30">
                      <span className="text-purple-100">Achievements</span>
                      <span className="font-bold">{achievementData.unlocked_achievements}/{achievementData.total_achievements}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 🎉 NEW: Achievement Notification Overlay */}
      <AnimatePresence>
        {showAchievementNotification && newAchievements.length > 0 && (
          <AchievementNotification
            achievements={newAchievements as any[]}
            onClose={handleAchievementNotificationClose}
          />
        )}
      </AnimatePresence>
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