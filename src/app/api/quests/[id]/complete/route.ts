import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

interface CompleteQuestParams {
  params: {
    id: string;
  };
}

// POST /api/quests/[id]/complete - Complete a quest
export async function POST(
  request: NextRequest,
  { params }: CompleteQuestParams
) {
  try {
    const supabase = createServerSupabaseClient();
    const questId = params.id;

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate quest ID
    if (!questId) {
      return NextResponse.json(
        { error: 'Quest ID is required' },
        { status: 400 }
      );
    }

    // Parse optional reflection from request body
    const body = await request.json().catch(() => ({}));
    const reflection = body.reflection || '';

    // Call the complete_quest database function
    const { data: result, error } = await supabase.rpc('complete_quest', {
      quest_id: questId,
    });

    if (error) {
      console.error('Error completing quest:', error);
      
      // Check if quest doesn't exist or already completed
      if (error.message?.includes('not found')) {
        return NextResponse.json(
          { error: 'Quest not found or already completed' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to complete quest' },
        { status: 500 }
      );
    }

    // Check if there was an error in the database function
    if (result?.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // If reflection was provided, store it (optional feature)
    if (reflection && reflection.trim().length > 0) {
      try {
        await supabase
          .from('quest_reflections')
          .insert({
            quest_id: questId,
            user_id: user.id,
            reflection: reflection.trim(),
          });
      } catch (reflectionError) {
        // Don't fail the quest completion if reflection storage fails
        console.warn('Failed to store quest reflection:', reflectionError);
      }
    }

    // Return success result
    return NextResponse.json({
      success: true,
      result: {
        xp_awarded: result.xp_awarded,
        new_total_xp: result.new_total_xp,
        old_level: result.old_level,
        new_level: result.new_level,
        level_up: result.level_up,
      },
      quest_id: questId,
      completed_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in quest completion API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/quests/[id]/complete - Get completion status
export async function GET(
  request: NextRequest,
  { params }: CompleteQuestParams
) {
  try {
    const supabase = createServerSupabaseClient();
    const questId = params.id;

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get quest completion status
    const { data: quest, error } = await supabase
      .from('quests')
      .select('id, status, completed_at, xp_reward')
      .eq('id', questId)
      .eq('user_id', user.id)
      .single();

    if (error || !quest) {
      return NextResponse.json(
        { error: 'Quest not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quest: {
        id: quest.id,
        status: quest.status,
        completed_at: quest.completed_at,
        xp_reward: quest.xp_reward,
        is_completed: quest.status === 'completed',
      },
    });

  } catch (error) {
    console.error('Error checking quest completion status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}