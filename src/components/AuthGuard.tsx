'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

export function AuthGuard({ children, fallback, loadingComponent }: AuthGuardProps) {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      loadingComponent || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading your heroic dashboard...
            </h2>
            <p className="text-gray-600">
              Preparing your quests and character stats
            </p>
          </motion.div>
        </div>
      )
    );
  }

  // Show authentication required state
  if (!user) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <motion.div
            className="max-w-md w-full mx-auto bg-white rounded-lg shadow-lg p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Start Your Adventure?
            </h1>
            
            <p className="text-gray-600 mb-8">
              Sign in to access your heroic dashboard and transform your daily tasks into epic quests.
            </p>
            
            <div className="space-y-4">
              <Link
                href="/login"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In to Continue
              </Link>
              
              <Link
                href="/signup"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Create New Account
              </Link>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <Link
                href="/"
                className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      )
    );
  }

  // User is authenticated, show protected content
  return <>{children}</>;
}