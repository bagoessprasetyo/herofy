import { NextRequest, NextResponse } from 'next/server';
import { generateEpicQuest, generateQuickQuest } from '@/lib/ai-quest-generator';
import { createServerSupabaseClient } from '@/lib/supabase';

interface GenerateQuestRequest {
  task: string;
  userLevel?: number;
  characterClass?: string;
  useAI?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerateQuestRequest = await request.json();
    const { task, userLevel = 1, characterClass = 'Life Adventurer', useAI = true } = body;

    // Validate input
    if (!task || task.trim().length === 0) {
      return NextResponse.json(
        { error: 'Task description is required' },
        { status: 400 }
      );
    }

    if (task.length > 500) {
      return NextResponse.json(
        { error: 'Task description is too long (max 500 characters)' },
        { status: 400 }
      );
    }

    // Verify authentication
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Generate quest
    let questData;
    try {
      if (useAI && process.env.OPENAI_API_KEY) {
        // Use AI generation
        questData = await generateEpicQuest(task, userLevel, characterClass);
      } else {
        // Use quick template generation
        questData = generateQuickQuest(task, userLevel);
      }
    } catch (aiError) {
      console.error('AI generation failed:', aiError);
      // Fallback to quick generation
      questData = generateQuickQuest(task, userLevel);
    }

    // Return the generated quest
    return NextResponse.json({
      success: true,
      quest: questData,
      originalTask: task,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in quest generation API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate quest',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Quest Generation API',
      version: '1.0.0',
      endpoints: {
        'POST /api/quests/generate': 'Generate a new quest from a task description'
      }
    },
    { status: 200 }
  );
}