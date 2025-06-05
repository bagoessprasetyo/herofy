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
  primary_stat: 'strength' | 'wisdom' | 'endurance' | 'charisma';
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
  primary_stat: 'strength' | 'wisdom' | 'endurance' | 'charisma';
}

// Quest completion result from database function
export interface QuestCompletionResult {
  success: boolean;
  xp_awarded: number;
  new_total_xp: number;
  old_level: number;
  new_level: number;
  level_up: boolean;
  stat_improved: 'strength' | 'wisdom' | 'endurance' | 'charisma';
}

// Quest creation result from database function
export interface QuestCreationResult {
  success: boolean;
  quest: Quest;
  was_existing: boolean;
  message: string;
}

// Character stat types
export type CharacterStat = 'strength' | 'wisdom' | 'endurance' | 'charisma';

export interface StatInfo {
  icon: string;
  color: string;
  name: string;
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
  primary_stat VARCHAR(20) DEFAULT 'strength' CHECK (primary_stat IN ('strength', 'wisdom', 'endurance', 'charisma')),
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
CREATE INDEX idx_quests_primary_stat ON public.quests(primary_stat);
CREATE INDEX idx_user_stats_user_id ON public.user_stats(user_id);
CREATE UNIQUE INDEX idx_user_original_task_unique ON public.quests(user_id, original_task) WHERE status = 'active';

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
  -- Lock the quest row to prevent concurrent completion
  SELECT * INTO quest_record 
  FROM public.quests 
  WHERE id = quest_id AND status = 'active'
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Quest not found or already completed'
    );
  END IF;
  
  -- Get current user stats with row lock
  SELECT * INTO user_record 
  FROM public.users 
  WHERE id = quest_record.user_id
  FOR UPDATE;
  
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
  
  -- Update the specific stat based on primary_stat field
  UPDATE public.user_stats 
  SET stat_value = stat_value + 1, updated_at = NOW()
  WHERE user_id = quest_record.user_id 
    AND stat_name = quest_record.primary_stat;
  
  -- If no rows were updated, create the stat entry
  IF NOT FOUND THEN
    INSERT INTO public.user_stats (user_id, stat_name, stat_value)
    VALUES (quest_record.user_id, quest_record.primary_stat, 1)
    ON CONFLICT (user_id, stat_name) DO UPDATE SET
      stat_value = user_stats.stat_value + 1,
      updated_at = NOW();
  END IF;
  
  -- Return completion result
  RETURN json_build_object(
    'success', true,
    'xp_awarded', quest_record.xp_reward,
    'new_total_xp', user_record.total_xp + quest_record.xp_reward,
    'old_level', old_level,
    'new_level', new_level,
    'level_up', level_up,
    'stat_improved', quest_record.primary_stat
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely create quests (prevents duplicates)
CREATE OR REPLACE FUNCTION public.create_quest_safe(
  p_user_id UUID,
  p_title VARCHAR,
  p_description TEXT,
  p_original_task VARCHAR,
  p_xp_reward INTEGER DEFAULT 50,
  p_difficulty VARCHAR DEFAULT 'medium',
  p_category VARCHAR DEFAULT 'general',
  p_primary_stat VARCHAR DEFAULT 'strength'
)
RETURNS JSON AS $$
DECLARE
  new_quest_id UUID;
  existing_quest_id UUID;
  result_quest JSON;
BEGIN
  -- Check if user already has active quest with same original task
  SELECT id INTO existing_quest_id 
  FROM public.quests 
  WHERE user_id = p_user_id 
    AND original_task = p_original_task 
    AND status = 'active';
  
  IF existing_quest_id IS NOT NULL THEN
    -- Return existing quest instead of creating duplicate
    SELECT row_to_json(q) INTO result_quest
    FROM (
      SELECT * FROM public.quests WHERE id = existing_quest_id
    ) q;
    
    RETURN json_build_object(
      'success', true,
      'quest', result_quest,
      'was_existing', true,
      'message', 'Quest already exists'
    );
  END IF;
  
  -- Create new quest
  INSERT INTO public.quests (
    user_id, title, description, original_task, 
    xp_reward, difficulty, category, status, primary_stat
  ) VALUES (
    p_user_id, p_title, p_description, p_original_task,
    p_xp_reward, p_difficulty, p_category, 'active', p_primary_stat
  ) RETURNING id INTO new_quest_id;
  
  -- Get the created quest
  SELECT row_to_json(q) INTO result_quest
  FROM (
    SELECT * FROM public.quests WHERE id = new_quest_id
  ) q;
  
  RETURN json_build_object(
    'success', true,
    'quest', result_quest,
    'was_existing', false,
    'message', 'Quest created successfully'
  );
  
EXCEPTION 
  WHEN unique_violation THEN
    -- Handle race condition - try to get existing quest
    SELECT id INTO existing_quest_id 
    FROM public.quests 
    WHERE user_id = p_user_id 
      AND original_task = p_original_task 
      AND status = 'active';
    
    IF existing_quest_id IS NOT NULL THEN
      SELECT row_to_json(q) INTO result_quest
      FROM (
        SELECT * FROM public.quests WHERE id = existing_quest_id
      ) q;
      
      RETURN json_build_object(
        'success', true,
        'quest', result_quest,
        'was_existing', true,
        'message', 'Quest already exists (race condition handled)'
      );
    ELSE
      -- If we still can't find it, re-raise the error
      RAISE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.complete_quest TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_quest_safe TO authenticated;
`;