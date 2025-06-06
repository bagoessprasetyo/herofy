// src/app/api/achievements/user/route.ts - FIXED WITH PROPER SSR AUTH
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Create the proper server client with SSR cookie handling
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Handle case where we can't set cookies (in API route)
              console.log('Cannot set cookie in API route:', name);
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // Handle case where we can't remove cookies (in API route)
              console.log('Cannot remove cookie in API route:', name);
            }
          },
        },
      }
    );

    // Get user session to verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('Auth check result:', { 
      hasUser: !!user, 
      userId: user?.id, 
      authError: authError?.message,
      requestedUserId: userId 
    });

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in again' },
        { status: 401 }
      );
    }

    // Verify user can access this data (own data only)
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only access your own achievements' },
        { status: 403 }
      );
    }

    console.log('✅ Auth successful for user:', user.id);

    // Return comprehensive mock achievement data
    const mockAchievementData = {
      total_achievements: 50,
      unlocked_achievements: 8,
      unlocked_list: [
        {
          id: '1',
          key: 'first_quest',
          title: 'First Steps',
          description: 'Complete your very first quest and begin your heroic journey',
          icon: '🎯',
          category: 'progression',
          tier: 'bronze',
          xp_reward: 100,
          is_hidden: false,
          display_order: 1,
          unlocked_at: new Date().toISOString()
        },
        {
          id: '2',
          key: 'early_bird',
          title: 'Early Bird',
          description: 'Complete a quest before 9 AM - the early hero catches the quest!',
          icon: '🌅',
          category: 'consistency',
          tier: 'silver',
          xp_reward: 150,
          is_hidden: false,
          display_order: 2,
          unlocked_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          key: 'level_up',
          title: 'Level Up!',
          description: 'Reach level 5 and prove your growing strength',
          icon: '⬆️',
          category: 'progression',
          tier: 'gold',
          xp_reward: 200,
          is_hidden: false,
          display_order: 3,
          unlocked_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '8',
          key: 'task_slayer',
          title: 'Task Slayer',
          description: 'Complete 5 quests in a single day',
          icon: '⚔️',
          category: 'mastery',
          tier: 'silver',
          xp_reward: 175,
          is_hidden: false,
          display_order: 8,
          unlocked_at: new Date(Date.now() - 259200000).toISOString()
        }
      ],
      available_achievements: [
        {
          id: '4',
          key: 'quest_master',
          title: 'Quest Master',
          description: 'Complete 10 quests and become a true adventurer',
          icon: '🏆',
          category: 'progression',
          tier: 'gold',
          xp_reward: 250,
          is_hidden: false,
          display_order: 4,
          progress: {
            quests_completed: {
              current: 7,
              required: 10,
              percentage: 70
            }
          }
        },
        {
          id: '5',
          key: 'strength_warrior',
          title: 'Strength Warrior',
          description: 'Reach 25 Strength and become a physical powerhouse',
          icon: '💪',
          category: 'mastery',
          tier: 'gold',
          xp_reward: 300,
          is_hidden: false,
          display_order: 5,
          progress: {
            strength_stat: {
              current: 18,
              required: 25,
              percentage: 72
            }
          }
        },
        {
          id: '6',
          key: 'consistency_king',
          title: 'Consistency King',
          description: 'Complete quests for 7 days in a row - persistence pays!',
          icon: '📅',
          category: 'consistency',
          tier: 'platinum',
          xp_reward: 400,
          is_hidden: false,
          display_order: 6,
          progress: {
            consecutive_days: {
              current: 4,
              required: 7,
              percentage: 57
            }
          }
        },
        {
          id: '9',
          key: 'wisdom_sage',
          title: 'Wisdom Sage',
          description: 'Reach 30 Wisdom and unlock the secrets of knowledge',
          icon: '🧠',
          category: 'mastery',
          tier: 'platinum',
          xp_reward: 350,
          is_hidden: false,
          display_order: 9,
          progress: {
            wisdom_stat: {
              current: 22,
              required: 30,
              percentage: 73
            }
          }
        },
        {
          id: '10',
          key: 'social_butterfly',
          title: 'Social Butterfly',
          description: 'Share your achievements with friends 3 times',
          icon: '🦋',
          category: 'social',
          tier: 'silver',
          xp_reward: 200,
          is_hidden: false,
          display_order: 10,
          progress: {
            shares_completed: {
              current: 1,
              required: 3,
              percentage: 33
            }
          }
        },
        {
          id: '7',
          key: 'secret_achievement',
          title: '???',
          description: 'Complete a quest at exactly midnight to unlock this mysterious reward...',
          icon: '🔒',
          category: 'special',
          tier: 'legendary',
          xp_reward: 500,
          is_hidden: true,
          display_order: 99
        }
      ],
      recent_achievements: [
        {
          title: 'First Steps',
          icon: '🎯',
          tier: 'bronze',
          unlocked_at: new Date().toISOString()
        },
        {
          title: 'Early Bird',
          icon: '🌅',
          tier: 'silver',
          unlocked_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          title: 'Level Up!',
          icon: '⬆️',
          tier: 'gold',
          unlocked_at: new Date(Date.now() - 172800000).toISOString()
        }
      ]
    };

    return NextResponse.json(mockAchievementData);

  } catch (error) {
    console.error('Achievement API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Create the proper server client with SSR cookie handling
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              console.log('Cannot set cookie in API route:', name);
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              console.log('Cannot remove cookie in API route:', name);
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in again' },
        { status: 401 }
      );
    }

    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only check your own achievements' },
        { status: 403 }
      );
    }

    // Mock response - no new achievements found this time
    const mockResult = {
      achievements_awarded: 0,
      new_achievements: []
    };

    return NextResponse.json(mockResult);

  } catch (error) {
    console.error('Achievement check API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}