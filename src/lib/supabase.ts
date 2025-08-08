// src/lib/supabase.ts - Updated server client function
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for browser usage
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Server-side client for API routes - FIXED VERSION
export const createServerSupabaseClient = () => {
  const cookieStore = cookies();

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};

// Rest of your existing Database interface and helper functions...
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          level: number;
          total_xp: number;
          character_class: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username?: string | null;
          level?: number;
          total_xp?: number;
          character_class?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          level?: number;
          total_xp?: number;
          character_class?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      quests: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          original_task: string;
          xp_reward: number;
          status: 'active' | 'completed' | 'failed';
          difficulty: 'easy' | 'medium' | 'hard' | 'epic';
          category: string;
          primary_stat: 'strength' | 'wisdom' | 'endurance' | 'charisma';
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          original_task: string;
          xp_reward?: number;
          status?: 'active' | 'completed' | 'failed';
          difficulty?: 'easy' | 'medium' | 'hard' | 'epic';
          category?: string;
          primary_stat?: 'strength' | 'wisdom' | 'endurance' | 'charisma';
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          original_task?: string;
          xp_reward?: number;
          status?: 'active' | 'completed' | 'failed';
          difficulty?: 'easy' | 'medium' | 'hard' | 'epic';
          category?: string;
          primary_stat?: 'strength' | 'wisdom' | 'endurance' | 'charisma';
          completed_at?: string | null;
          created_at?: string;
        };
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          stat_name: string;
          stat_value: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stat_name: string;
          stat_value?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stat_name?: string;
          stat_value?: number;
          updated_at?: string;
        };
      };
      // Add achievements tables
      achievements: {
        Row: {
          id: string;
          key: string;
          title: string;
          description: string;
          icon: string;
          category: string;
          tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
          xp_reward: number;
          stat_bonus_type: string | null;
          stat_bonus_amount: number | null;
          is_hidden: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          title: string;
          description: string;
          icon: string;
          category: string;
          tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
          xp_reward: number;
          stat_bonus_type?: string | null;
          stat_bonus_amount?: number | null;
          is_hidden?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          title?: string;
          description?: string;
          icon?: string;
          category?: string;
          tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
          xp_reward?: number;
          stat_bonus_type?: string | null;
          stat_bonus_amount?: number | null;
          is_hidden?: boolean;
          display_order?: number;
          created_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
          progress: any; // JSON field
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
          progress?: any;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
          progress?: any;
        };
      };
    };
    Functions: {
      complete_quest: {
        Args: {
          quest_id: string;
        };
        Returns: {
          success: boolean;
          xp_awarded: number;
          new_total_xp: number;
          old_level: number;
          new_level: number;
          level_up: boolean;
          stat_improved: string;
        };
      };
      create_quest_safe: {
        Args: {
          p_user_id: string;
          p_title: string;
          p_description: string;
          p_original_task: string;
          p_xp_reward?: number;
          p_difficulty?: string;
          p_category?: string;
          p_primary_stat?: string;
        };
        Returns: {
          success: boolean;
          quest: any;
          was_existing: boolean;
          message: string;
        };
      };
      get_user_achievements: {
        Args: {
          p_user_id: string;
        };
        Returns: any; // JSON response
      };
      check_and_award_achievements: {
        Args: {
          p_user_id: string;
        };
        Returns: any; // JSON response
      };
    };
  };
}

// Utility functions for common operations
export const auth = {
  signUp: async (email: string, password: string, username?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
        },
      },
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },
};

// Database helper functions
export const db = {
  // Get user profile with stats
  getUserProfile: async (userId: string) => {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) return { user: null, stats: null, error: userError };

    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId);

    return { user, stats, error: statsError };
  },

  // Get user's quests
  getUserQuests: async (userId: string, status?: string) => {
    let query = supabase
      .from('quests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    return { quests: data, error };
  },

  // Create a new quest using the safe database function
  createQuest: async (quest: Database['public']['Tables']['quests']['Insert']) => {
    try {
      const { data, error } = await supabase.rpc('create_quest_safe', {
        p_user_id: quest.user_id,
        p_title: quest.title,
        p_description: quest.description || '',
        p_original_task: quest.original_task,
        p_xp_reward: quest.xp_reward || 50,
        p_difficulty: quest.difficulty || 'medium',
        p_category: quest.category || 'general',
        p_primary_stat: quest.primary_stat || 'strength'
      });

      if (error) {
        console.error('Database function error:', error);
        return { quest: null, error };
      }

      if (data?.success) {
        return { quest: data.quest, error: null };
      } else {
        return { quest: null, error: new Error(data?.message || 'Failed to create quest') };
      }
    } catch (err) {
      console.error('Quest creation error:', err);
      return { quest: null, error: err as Error };
    }
  },

  // Fallback: Direct insert (only use if the function fails)
  createQuestDirect: async (quest: Database['public']['Tables']['quests']['Insert']) => {
    // Remove any id field to let database generate it
    const { id, ...questWithoutId } = quest;
    
    const { data, error } = await supabase
      .from('quests')
      .insert(questWithoutId)
      .select()
      .single();

    return { quest: data, error };
  },

  // Complete a quest using the database function
  completeQuest: async (questId: string) => {
    const { data, error } = await supabase.rpc('complete_quest', {
      quest_id: questId,
    });

    return { result: data, error };
  },

  deleteQuest: async (questId: string) => {
    const { error } = await supabase
      .from('quests')
      .delete()
      .eq('id', questId);

    return { error };
  },

  // Update user profile
  updateUserProfile: async (userId: string, updates: Database['public']['Tables']['users']['Update']) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { user: data, error };
  },
};

export default supabase;