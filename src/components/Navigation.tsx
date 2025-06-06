'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Sword, 
  Trophy,
  BarChart3,
  Home,
  Plus,
  Award // 🎉 NEW: Import for achievements icon
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, userProfile, signOut } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setShowUserMenu(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary nav */}
          <div className="flex">
            {/* Logo */}
            <Link href="/" className="flex items-center px-2 py-2 text-xl font-bold">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Sword className="w-5 h-5 text-white" />
              </div>
              <span className="text-gradient">Herofy</span>
            </Link>

            {/* Primary Navigation - Desktop */}
            {user && (
              <div className="hidden md:ml-8 md:flex md:space-x-8">
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    isActive('/dashboard')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                
                <Link
                  href="/quests"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    isActive('/quests')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Sword className="w-4 h-4 mr-2" />
                  Quests
                </Link>

                {/* 🎉 NEW: Achievements Navigation Link */}
                <Link
                  href="/achievements"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    isActive('/achievements')
                      ? 'border-yellow-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Award className="w-4 h-4 mr-2" />
                  Achievements
                </Link>
                
                <Link
                  href="/profile"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    isActive('/profile')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Profile
                </Link>
                
                <Link
                  href="/leaderboard"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    isActive('/leaderboard')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </Link>
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center">
            {user ? (
              <>
                {/* User Level Badge - Desktop */}
                {userProfile && (
                  <div className="hidden md:flex items-center mr-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    <Trophy className="w-4 h-4 mr-1" />
                    Level {userProfile.level}
                  </div>
                )}

                {/* Quick Add Quest Button - Desktop */}
                <Link
                  href="/dashboard?create=true"
                  className="hidden md:flex items-center mr-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Quest
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center text-sm rounded-full bg-gray-100 hover:bg-gray-200 p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <User className="w-5 h-5 text-gray-600" />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {userProfile?.username || user.email?.split('@')[0]}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {userProfile && (
                            <p className="text-xs text-blue-600 mt-1">
                              Level {userProfile.level} • {userProfile.total_xp} XP
                            </p>
                          )}
                        </div>
                        
                        <Link
                          href="/profile"
                          onClick={closeMenu}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <User className="w-4 h-4 mr-3" />
                          Profile & Stats
                        </Link>

                        {/* 🎉 NEW: Achievements in user menu */}
                        <Link
                          href="/achievements"
                          onClick={closeMenu}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Award className="w-4 h-4 mr-3" />
                          Achievements
                        </Link>
                        
                        <Link
                          href="/settings"
                          onClick={closeMenu}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </Link>
                        
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  {/* User info - Mobile */}
                  {userProfile && (
                    <div className="px-3 py-2 border-b border-gray-100 mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        {userProfile.username || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-blue-600">
                        Level {userProfile.level} • {userProfile.total_xp} XP
                      </p>
                    </div>
                  )}

                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Home className="w-5 h-5 mr-3" />
                    Dashboard
                  </Link>
                  
                  <Link
                    href="/quests"
                    onClick={closeMenu}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/quests')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Sword className="w-5 h-5 mr-3" />
                    Quests
                  </Link>

                  {/* 🎉 NEW: Achievements in mobile menu */}
                  <Link
                    href="/achievements"
                    onClick={closeMenu}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/achievements')
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Award className="w-5 h-5 mr-3" />
                    Achievements
                  </Link>
                  
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/profile')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="w-5 h-5 mr-3" />
                    Profile
                  </Link>
                  
                  <Link
                    href="/leaderboard"
                    onClick={closeMenu}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/leaderboard')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Trophy className="w-5 h-5 mr-3" />
                    Leaderboard
                  </Link>

                  {/* Quick Actions - Mobile */}
                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <Link
                      href="/dashboard?create=true"
                      onClick={closeMenu}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium bg-blue-500 text-white"
                    >
                      <Plus className="w-5 h-5 mr-3" />
                      Create New Quest
                    </Link>
                  </div>

                  {/* Account Actions - Mobile */}
                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <Link
                      href="/settings"
                      onClick={closeMenu}
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Settings className="w-5 h-5 mr-3" />
                      Settings
                    </Link>
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-500 text-white"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}