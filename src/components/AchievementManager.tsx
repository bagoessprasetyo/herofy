'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { AchievementNotification } from '@/components/AchievementNotification';
import { useAchievements } from '../hooks/useAchievements';
// import { useAchievements } from '@/hooks/useAchievements';

interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  xp_reward: number;
  stat_bonus_type?: string;
  stat_bonus_amount?: number;
  unlocked_at: string;
}

/**
 * Global Achievement Manager Component
 * 
 * This component should be added to your main layout (e.g., src/app/layout.tsx)
 * to handle achievement notifications throughout the entire application.
 * 
 * It automatically listens for new achievements and displays beautiful
 * unlock animations when they're earned.
 */
export function AchievementManager() {
  const { user } = useAuth();
  const { newAchievements, clearNewAchievements } = useAchievements();
  const [showNotification, setShowNotification] = useState(false);
  const [currentAchievements, setCurrentAchievements] = useState<Achievement[]>([]);

  // Show notification when new achievements are earned
  useEffect(() => {
    if (newAchievements.length > 0 && user) {
      setCurrentAchievements(newAchievements as any[]);
      setShowNotification(true);
    }
  }, [newAchievements, user]);

  // Handle notification close
  const handleNotificationClose = () => {
    setShowNotification(false);
    
    // Clear achievements after animation completes
    setTimeout(() => {
      setCurrentAchievements([]);
      clearNewAchievements();
    }, 300);
  };

  // Don't render if no user or no achievements to show
  if (!user || !showNotification || currentAchievements.length === 0) {
    return null;
  }

  return (
    <AchievementNotification
      achievements={currentAchievements}
      onClose={handleNotificationClose}
    />
  );
}