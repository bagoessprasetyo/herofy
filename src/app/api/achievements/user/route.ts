// src/app/api/achievements/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/src/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client with cookies for auth
    const supabase = createServerSupabaseClient();

    // Get user session to verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user can access this data (own data only)
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Call our database function to get user achievements
    const { data: achievementData, error: achievementError } = await supabase
      .rpc('get_user_achievements', { p_user_id: userId });

    if (achievementError) {
      console.error('Error fetching achievements:', achievementError);
      return NextResponse.json(
        { error: 'Failed to fetch achievements' },
        { status: 500 }
      );
    }

    return NextResponse.json(achievementData);

  } catch (error) {
    console.error('Achievement API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Alternative endpoint for checking and awarding achievements
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client with cookies for auth
    const supabase = createServerSupabaseClient();

    // Get user session to verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user can access this data (own data only)
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check and award achievements
    const { data: result, error: awardError } = await supabase
      .rpc('check_and_award_achievements', { p_user_id: userId });

    if (awardError) {
      console.error('Error checking achievements:', awardError);
      return NextResponse.json(
        { error: 'Failed to check achievements' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Achievement check API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}