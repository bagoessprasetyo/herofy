import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

export interface LeaderboardEntry {
  id: string;
  display_name: string;
  level: number;
  total_xp: number;
  character_class: string;
  created_at: string;
  rank: number;
}

export interface UserLeaderboardSettings {
  is_public: boolean;
  display_name?: string;
  show_real_name: boolean;
  current_rank?: number;
  total_participants: number;
}

interface UseLeaderboardReturn {
  leaderboard: LeaderboardEntry[];
  userSettings: UserLeaderboardSettings | null;
  loading: boolean;
  error: string | null;
  refreshLeaderboard: () => Promise<void>;
  updateUserSettings: (settings: {
    is_public: boolean;
    display_name?: string;
    show_real_name?: boolean;
  }) => Promise<boolean>;
}

export function useLeaderboard(): UseLeaderboardReturn {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userSettings, setUserSettings] = useState<UserLeaderboardSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch leaderboard data
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('leaderboard_view')
        .select('*')
        .order('rank', { ascending: true })
        .limit(100); // Top 100 players

      if (leaderboardError) {
        throw new Error(leaderboardError.message);
      }

      setLeaderboard(leaderboardData || []);

      // If user is logged in, fetch their settings
      if (user) {
        const { data: settingsData, error: settingsError } = await supabase
          .rpc('get_user_leaderboard_settings', { p_user_id: user.id });

        if (settingsError) {
          console.error('Error fetching user settings:', settingsError);
        } else if (settingsData && settingsData.length > 0) {
          setUserSettings(settingsData[0]);
        } else {
          // Default settings for new user
          setUserSettings({
            is_public: false,
            show_real_name: false,
            total_participants: leaderboardData?.length || 0
          });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load leaderboard';
      setError(errorMessage);
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const updateUserSettings = async (settings: {
    is_public: boolean;
    display_name?: string;
    show_real_name?: boolean;
  }): Promise<boolean> => {
    if (!user) {
      throw new Error('User must be logged in to update settings');
    }

    try {
      const { data, error } = await supabase.rpc('update_leaderboard_settings', {
        p_user_id: user.id,
        p_is_public: settings.is_public,
        p_display_name: settings.display_name || null,
        p_show_real_name: settings.show_real_name || false
      });

      if (error) {
        throw new Error(error.message);
      }

      // Refresh leaderboard and user settings
      await loadLeaderboard();
      return true;
    } catch (err) {
      console.error('Error updating leaderboard settings:', err);
      return false;
    }
  };

  const refreshLeaderboard = async (): Promise<void> => {
    await loadLeaderboard();
  };

  return {
    leaderboard,
    userSettings,
    loading,
    error,
    refreshLeaderboard,
    updateUserSettings,
  };
}