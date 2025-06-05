export interface User {
  id: string;
  email: string;
  username?: string;
  level: number;
  total_xp: number;
  character_class: string;
  created_at: string;
  updated_at: string;
}

export interface Quest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  original_task: string;
  xp_reward: number;
  status: 'active' | 'completed' | 'failed';
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  category: string;
  completed_at?: string;
  created_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  stat_name: string;
  stat_value: number;
  updated_at: string;
}

export interface QuestGenerationResult {
  title: string;
  description: string;
  xp_reward: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  category: string;
}

// Database Schema SQL for Supabase
export const DATABASE_SCHEMA = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email VARCHAR NOT NULL,
  username VARCHAR UNIQUE,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  character_class VARCHAR DEFAULT 'Life Adventurer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quests table
CREATE TABLE public.quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  original_task VARCHAR NOT NULL,
  xp_reward INTEGER DEFAULT 50,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  difficulty VARCHAR DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'epic')),
  category VARCHAR DEFAULT 'general',
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User stats table (for RPG progression)
CREATE TABLE public.user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  stat_name VARCHAR NOT NULL,
  stat_value INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, stat_name)
);

-- Indexes for better performance
CREATE INDEX idx_quests_user_id ON public.quests(user_id);
CREATE INDEX idx_quests_status ON public.quests(status);
CREATE INDEX idx_quests_created_at ON public.quests(created_at DESC);
CREATE INDEX idx_user_stats_user_id ON public.user_stats(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Quests policies
CREATE POLICY "Users can view own quests" ON public.quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quests" ON public.quests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quests" ON public.quests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quests" ON public.quests FOR DELETE USING (auth.uid() = user_id);

-- Stats policies
CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);

-- Functions for automatic user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'username');
  
  -- Initialize basic stats
  INSERT INTO public.user_stats (user_id, stat_name, stat_value) VALUES
    (new.id, 'strength', 1),
    (new.id, 'wisdom', 1),
    (new.id, 'endurance', 1),
    (new.id, 'charisma', 1);
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update user level based on XP
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple level calculation: level = floor(total_xp / 1000) + 1
  NEW.level = FLOOR(NEW.total_xp / 1000.0) + 1;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update level when XP changes
CREATE TRIGGER update_level_on_xp_change
  BEFORE UPDATE OF total_xp ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.update_user_level();

-- Function to award XP and update stats when quest completed
CREATE OR REPLACE FUNCTION public.complete_quest(quest_id UUID)
RETURNS JSON AS $$
DECLARE
  quest_record public.quests%ROWTYPE;
  user_record public.users%ROWTYPE;
  old_level INTEGER;
  new_level INTEGER;
  level_up BOOLEAN := FALSE;
BEGIN
  -- Get quest details
  SELECT * INTO quest_record FROM public.quests WHERE id = quest_id AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Quest not found or already completed');
  END IF;
  
  -- Get current user stats
  SELECT * INTO user_record FROM public.users WHERE id = quest_record.user_id;
  old_level = user_record.level;
  
  -- Mark quest as completed
  UPDATE public.quests 
  SET status = 'completed', completed_at = NOW()
  WHERE id = quest_id;
  
  -- Award XP to user
  UPDATE public.users 
  SET total_xp = total_xp + quest_record.xp_reward
  WHERE id = quest_record.user_id
  RETURNING level INTO new_level;
  
  -- Check if leveled up
  IF new_level > old_level THEN
    level_up = TRUE;
  END IF;
  
  -- Update relevant stats based on quest category
  CASE quest_record.category
    WHEN 'health' THEN
      UPDATE public.user_stats SET stat_value = stat_value + 1, updated_at = NOW()
      WHERE user_id = quest_record.user_id AND stat_name = 'endurance';
    WHEN 'education' THEN
      UPDATE public.user_stats SET stat_value = stat_value + 1, updated_at = NOW()
      WHERE user_id = quest_record.user_id AND stat_name = 'wisdom';
    WHEN 'career' THEN
      UPDATE public.user_stats SET stat_value = stat_value + 1, updated_at = NOW()
      WHERE user_id = quest_record.user_id AND stat_name = 'charisma';
    ELSE
      UPDATE public.user_stats SET stat_value = stat_value + 1, updated_at = NOW()
      WHERE user_id = quest_record.user_id AND stat_name = 'strength';
  END CASE;
  
  -- Return completion result
  RETURN json_build_object(
    'success', true,
    'xp_awarded', quest_record.xp_reward,
    'new_total_xp', user_record.total_xp + quest_record.xp_reward,
    'old_level', old_level,
    'new_level', new_level,
    'level_up', level_up
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;