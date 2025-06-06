import { useState, useEffect, useCallback } from 'react';
import { Quest } from '@/types/database';
import { db } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { getStatInfo } from '@/lib/quest-utils';
import toast from 'react-hot-toast';

interface UseQuestsReturn {
  quests: Quest[];
  loading: boolean;
  error: string | null;
  activeQuests: Quest[];
  completedQuests: Quest[];
  createQuest: (questData: Omit<Quest, 'id' | 'created_at'>) => Promise<Quest | null>;
  completeQuest: (questId: string) => Promise<boolean>;
  deleteQuest: (questId: string) => Promise<boolean>;
  refreshQuests: () => Promise<void>;
  getQuestsByFilter: (filter: 'all' | 'active' | 'completed') => Quest[];
}

export function useQuests(): UseQuestsReturn {
  const { user, loading: authLoading } = useAuth(); // 🔧 Track auth loading state
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuests = useCallback(async () => {
    // 🔧 KEY FIX: Don't clear quests if auth is still loading
    if (!user) {
      if (!authLoading) {
        // Only clear quests if auth has finished loading and there's no user
        setQuests([]);
        setLoading(false);
      }
      // If auth is still loading, keep current loading state
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { quests: userQuests, error: questError } = await db.getUserQuests(user.id);
      
      if (questError) {
        throw new Error(questError.message || 'Failed to load quests');
      }

      setQuests(userQuests || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load quests';
      setError(errorMessage);
      console.error('Error loading quests:', err);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]); // 🔧 Add authLoading as dependency

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  const createQuest = async (questData: Omit<Quest, 'id' | 'created_at'>): Promise<Quest | null> => {
    if (!user) {
      toast.error('You must be logged in to create quests');
      return null;
    }

    try {
      const { quest, error } = await db.createQuest({
        ...questData,
        user_id: user.id,
      });

      if (error) {
        // Handle specific error cases
        if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
          toast.error('You already have a quest for this task!');
          // Refresh quests to show the existing one
          await loadQuests();
          return null;
        }
        throw error;
      }

      if (quest) {
        // Add the new quest to the local state
        setQuests(prev => [quest, ...prev]);
        return quest;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create quest';
      toast.error(errorMessage);
      console.error('Error creating quest:', err);
      return null;
    }
  };

  const completeQuest = async (questId: string): Promise<boolean> => {
    try {
      const { result, error } = await db.completeQuest(questId);

      if (error) {
        throw new Error(error.message || 'Failed to complete quest');
      }

      if (result?.success) {
        // Update local state
        setQuests(prev =>
          prev.map(quest =>
            quest.id === questId
              ? { ...quest, status: 'completed' as const, completed_at: new Date().toISOString() }
              : quest
          )
        );

        // Show appropriate success message with stat info
        const xpGained = result.xp_awarded;
        const leveledUp = result.level_up;
        const statImproved = result.stat_improved;
        const statInfo = getStatInfo(statImproved);

        if (leveledUp) {
          toast.success(
            `🎊 LEVEL UP! You're now level ${result.new_level}! (+${xpGained} XP, +1 ${statInfo.name} ${statInfo.icon})`, 
            { duration: 8000 }
          );
        } else {
          toast.success(
            `⚡ Quest Complete! +${xpGained} XP, +1 ${statInfo.name} ${statInfo.icon}`, 
            { duration: 5000 }
          );
        }

        return true;
      }

      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete quest';
      toast.error(errorMessage);
      console.error('Error completing quest:', err);
      return false;
    }
  };

  const deleteQuest = async (questId: string): Promise<boolean> => {
    try {
      const { error } = await db.deleteQuest(questId);
       
      if (error) {
        throw new Error(error.message || 'Failed to delete quest');
      }

      setQuests(prev => prev.filter(quest => quest.id !== questId));
      toast.success('Quest removed from your adventure');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete quest';
      toast.error(errorMessage);
      console.error('Error deleting quest:', err);
      return false;
    }
  };

  const refreshQuests = async (): Promise<void> => {
    await loadQuests();
  };

  const getQuestsByFilter = (filter: 'all' | 'active' | 'completed'): Quest[] => {
    switch (filter) {
      case 'active':
        return quests.filter(q => q.status === 'active');
      case 'completed':
        return quests.filter(q => q.status === 'completed');
      default:
        return quests;
    }
  };

  // Computed values
  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');

  return {
    quests,
    loading,
    error,
    activeQuests,
    completedQuests,
    createQuest,
    completeQuest,
    deleteQuest,
    refreshQuests,
    getQuestsByFilter,
  };
}