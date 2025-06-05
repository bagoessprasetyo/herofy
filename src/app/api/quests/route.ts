import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type QuestInsert = Database['public']['Tables']['quests']['Insert'];
type QuestUpdate = Database['public']['Tables']['quests']['Update'];

// GET /api/quests - Get user's quests
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('quests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add status filter if provided
    if (status && ['active', 'completed', 'failed'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: quests, error } = await query;

    if (error) {
      console.error('Error fetching quests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quests: quests || [],
      count: quests?.length || 0,
    });

  } catch (error) {
    console.error('Error in GET /api/quests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/quests - Create a new quest
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const questData: QuestInsert = {
      user_id: user.id,
      title: body.title,
      description: body.description,
      original_task: body.original_task,
      xp_reward: body.xp_reward || 50,
      status: 'active',
      difficulty: body.difficulty || 'medium',
      category: body.category || 'general',
    };

    // Validate required fields
    if (!questData.title || !questData.original_task) {
      return NextResponse.json(
        { error: 'Title and original task are required' },
        { status: 400 }
      );
    }

    // Create quest
    const { data: quest, error } = await supabase
      .from('quests')
      .insert(questData)
      .select()
      .single();

    if (error) {
      console.error('Error creating quest:', error);
      return NextResponse.json(
        { error: 'Failed to create quest' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quest,
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/quests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/quests - Update a quest
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { id, ...updateData }: { id: string } & QuestUpdate = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Quest ID is required' },
        { status: 400 }
      );
    }

    // Update quest (only if user owns it)
    const { data: quest, error } = await supabase
      .from('quests')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating quest:', error);
      return NextResponse.json(
        { error: 'Failed to update quest' },
        { status: 500 }
      );
    }

    if (!quest) {
      return NextResponse.json(
        { error: 'Quest not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quest,
    });

  } catch (error) {
    console.error('Error in PATCH /api/quests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/quests - Delete a quest
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const questId = searchParams.get('id');

    if (!questId) {
      return NextResponse.json(
        { error: 'Quest ID is required' },
        { status: 400 }
      );
    }

    // Delete quest (only if user owns it)
    const { error } = await supabase
      .from('quests')
      .delete()
      .eq('id', questId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting quest:', error);
      return NextResponse.json(
        { error: 'Failed to delete quest' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Quest deleted successfully',
    });

  } catch (error) {
    console.error('Error in DELETE /api/quests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}