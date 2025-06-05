import { NextRequest, NextResponse } from 'next/server';
import { generateEpicQuest } from '@/lib/ai-quest-generator-server';
import { generateQuickQuest } from '@/lib/quest-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task, userLevel = 1, characterClass = 'Life Adventurer', useAI = true } = body;

    if (!task || typeof task !== 'string' || task.trim().length === 0) {
      return NextResponse.json(
        { error: 'Task is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    let quest;

    if (useAI) {
      try {
        // Try AI generation first
        quest = await generateEpicQuest(task.trim(), userLevel, characterClass);
      } catch (error) {
        console.error('AI generation failed, falling back to template:', error);
        // Fallback to template generation
        quest = generateQuickQuest(task.trim(), userLevel);
      }
    } else {
      // Use quick template generation
      quest = generateQuickQuest(task.trim(), userLevel);
    }

    return NextResponse.json({
      success: true,
      quest,
    });

  } catch (error) {
    console.error('Quest generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate quest',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}