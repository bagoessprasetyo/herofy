import { createClient } from '@supabase/supabase-js';
// import type { Database } from '@/types/supabase';

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

// Server-side client for API routes
export const createServerSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Enhanced types for our application
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
        };
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

  // Create a new quest
  createQuest: async (quest: Database['public']['Tables']['quests']['Insert']) => {
    const { data, error } = await supabase
      .from('quests')
      .insert(quest)
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