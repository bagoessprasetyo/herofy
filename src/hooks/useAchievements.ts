// src/hooks/useAchievements.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

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

interface NewAchievementResult {
  achievements_awarded: number;
  new_achievements: Achievement[];
}

interface UseAchievementsReturn {
  achievementData: AchievementData | null;
  loading: boolean;
  error: string | null;
  newAchievements: Achievement[];
  loadAchievements: () => Promise<void>;
  checkForNewAchievements: () => Promise<Achievement[]>;
  clearNewAchievements: () => void;
  refreshAchievements: () => Promise<void>;
}

export function useAchievements(): UseAchievementsReturn {
  const { user } = useAuth();
  const [achievementData, setAchievementData] = useState<AchievementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  const loadAchievements = useCallback(async () => {
    if (!user?.id) {
      setAchievementData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/achievements/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error(`Failed to load achievements: ${response.statusText}`);
      }

      const data = await response.json();
      setAchievementData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load achievements';
      setError(errorMessage);
      console.error('Error loading achievements:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const checkForNewAchievements = useCallback(async (): Promise<Achievement[]> => {
    if (!user?.id) {
      return [];
    }

    try {
      const response = await fetch('/api/achievements/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error(`Failed to check achievements: ${response.statusText}`);
      }

      const result: NewAchievementResult = await response.json();
      
      if (result.achievements_awarded > 0 && result.new_achievements) {
        setNewAchievements(prev => [...prev, ...result.new_achievements]);
        // Refresh achievement data to reflect new unlocks
        await loadAchievements();
        return result.new_achievements;
      }

      return [];
    } catch (err) {
      console.error('Error checking for new achievements:', err);
      return [];
    }
  }, [user?.id, loadAchievements]);

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  const refreshAchievements = useCallback(async () => {
    await loadAchievements();
  }, [loadAchievements]);

  // Load achievements when user changes
  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  // Auto-check for achievements periodically (optional)
  useEffect(() => {
    if (!user?.id) return;

    // Check for new achievements every 30 seconds
    const interval = setInterval(() => {
      checkForNewAchievements();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id, checkForNewAchievements]);

  return {
    achievementData,
    loading,
    error,
    newAchievements,
    loadAchievements,
    checkForNewAchievements,
    clearNewAchievements,
    refreshAchievements,
  };
}

// Helper hook for achievement notifications
export function useAchievementNotifications() {
  const { newAchievements, clearNewAchievements } = useAchievements();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (newAchievements.length > 0) {
      setShowNotification(true);
    }
  }, [newAchievements]);

  const handleNotificationClose = useCallback(() => {
    setShowNotification(false);
    // Clear after animation completes
    setTimeout(() => {
      clearNewAchievements();
    }, 300);
  }, [clearNewAchievements]);

  return {
    achievements: newAchievements,
    showNotification,
    onClose: handleNotificationClose,
  };
}

// Helper functions for achievement data
export const achievementHelpers = {
  getTierColor: (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'text-orange-600';
      case 'silver':
        return 'text-gray-600';
      case 'gold':
        return 'text-yellow-600';
      case 'platinum':
        return 'text-purple-600';
      case 'legendary':
        return 'text-pink-600';
      default:
        return 'text-blue-600';
    }
  },

  getCategoryIcon: (category: string) => {
    switch (category) {
      case 'progression':
        return '📈';
      case 'consistency':
        return '📅';
      case 'mastery':
        return '🎯';
      case 'social':
        return '👥';
      case 'special':
        return '✨';
      default:
        return '🏆';
    }
  },

  getCompletionPercentage: (data: AchievementData | null) => {
    if (!data || data.total_achievements === 0) return 0;
    return Math.round((data.unlocked_achievements / data.total_achievements) * 100);
  },

  sortAchievements: (achievements: Achievement[], sortBy: 'date' | 'tier' | 'category' = 'date') => {
    return [...achievements].sort((a, b) => {
      switch (sortBy) {
        case 'tier':
          const tierOrder = { bronze: 0, silver: 1, gold: 2, platinum: 3, legendary: 4 };
          return tierOrder[b.tier] - tierOrder[a.tier];
        case 'category':
          return a.category.localeCompare(b.category);
        case 'date':
        default:
          if (!a.unlocked_at || !b.unlocked_at) return 0;
          return new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime();
      }
    });
  },
};