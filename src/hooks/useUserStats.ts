import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { db } from '@/lib/supabase';

export interface UserStat {
  name: string;
  value: number;
  icon: string;
  color: string;
}

interface UseUserStatsReturn {
  stats: UserStat[];
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export function useUserStats(): UseUserStatsReturn {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserStats = useCallback(async () => {
    if (!user) {
      setStats([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { user: userProfile, stats: userStats, error: statsError } = await db.getUserProfile(user.id);
      
      if (statsError) {
        throw new Error(statsError.message || 'Failed to load user stats');
      }

      // Create a map of stat values from database
      const statMap = new Map();
      userStats?.forEach(stat => {
        statMap.set(stat.stat_name, stat.stat_value);
      });

      // Define stat configuration with icons and colors
      const statConfigs = [
        {
          name: 'strength',
          icon: '💪',
          color: 'text-red-600 bg-red-100',
          displayName: 'Strength'
        },
        {
          name: 'wisdom',
          icon: '🧠',
          color: 'text-blue-600 bg-blue-100',
          displayName: 'Wisdom'
        },
        {
          name: 'endurance',
          icon: '❤️',
          color: 'text-green-600 bg-green-100',
          displayName: 'Endurance'
        },
        {
          name: 'charisma',
          icon: '✨',
          color: 'text-yellow-600 bg-yellow-100',
          displayName: 'Charisma'
        }
      ];

      // Build stats array with real database values
      const formattedStats: UserStat[] = statConfigs.map(config => ({
        name: config.displayName,
        value: statMap.get(config.name) || 1, // Default to 1 if no value found
        icon: config.icon,
        color: config.color
      }));

      setStats(formattedStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user stats';
      setError(errorMessage);
      console.error('Error loading user stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  const refreshStats = async (): Promise<void> => {
    await loadUserStats();
  };

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
}