'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { AuthGuard } from '@/components/AuthGuard';
import { AchievementGallery } from '@/components/AchievementGallery';
import { motion } from 'framer-motion';
import { Trophy, Award, Star, Crown, Sparkles } from 'lucide-react';

export default function AchievementsPage() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-10 h-10 text-yellow-500" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Your <span className="text-gradient">Achievements</span>
              </h1>
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Track your heroic progress and celebrate your epic accomplishments! Each achievement represents a milestone in your journey to becoming a legendary hero.
            </p>
          </motion.div>

          {/* Achievement Tiers Info */}
          <motion.div
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Achievement Tiers</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-orange-600">Bronze</h3>
                <p className="text-xs text-gray-600">Getting Started</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-600">Silver</h3>
                <p className="text-xs text-gray-600">Building Habits</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-yellow-600">Gold</h3>
                <p className="text-xs text-gray-600">Expert Level</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-purple-600">Platinum</h3>
                <p className="text-xs text-gray-600">Master</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-pink-600">Legendary</h3>
                <p className="text-xs text-gray-600">Ultimate Hero</p>
              </div>
            </div>
          </motion.div>

          {/* Main Achievement Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <AchievementGallery userId={user?.id || ''} />
          </motion.div>

          {/* Motivational Footer */}
          <motion.div
            className="text-center mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
            <h3 className="text-2xl font-bold mb-2">Every Hero Has a Story</h3>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Your achievements tell the tale of your journey from ordinary to extraordinary. 
              Each completed quest, each milestone reached, each habit formed - they all contribute 
              to your legendary status. Keep going, hero! 🚀
            </p>
            <div className="mt-6">
              <a
                href="/dashboard"
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors inline-block"
              >
                Continue Your Adventure
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
}