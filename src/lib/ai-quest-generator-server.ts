// Server-only AI quest generation (for API routes only)
// This file should NEVER be imported in client components
import OpenAI from 'openai';
import { QuestGenerationResult, generateQuickQuest, determinePrimaryStat } from './quest-utils';

// Only initialize OpenAI on server-side
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  return openai;
}

export async function generateEpicQuest(
  originalTask: string,
  userLevel: number = 1,
  characterClass: string = 'Life Adventurer'
): Promise<QuestGenerationResult> {
  
  const prompt = `Transform this real-world task into an exciting RPG quest:

TASK: "${originalTask}"
USER LEVEL: ${userLevel}
CHARACTER CLASS: ${characterClass}

Create a motivating RPG quest that makes this task feel epic. The quest should:
- Have an exciting, fantasy-themed title (keep it under 60 characters)
- Include a compelling 2-3 sentence description with adventure elements
- Feel appropriately challenging for level ${userLevel}
- Award XP based on task difficulty and user level (10-100 XP)
- Use RPG terminology (defeat, vanquish, master, conquer, etc.)
- Match the difficulty to the task complexity
- Determine which character stat this task would most improve

Character Stats Guide:
- STRENGTH: Physical tasks, cleaning, organizing, building, manual work
- WISDOM: Learning, studying, reading, research, creative work, problem-solving
- ENDURANCE: Exercise, sports, physical fitness, health-related activities
- CHARISMA: Social interactions, meetings, presentations, networking, communication

Return ONLY valid JSON in this exact format:
{
  "title": "Epic quest title with RPG flair",
  "description": "Compelling quest description with fantasy elements and motivation.",
  "xp_reward": 50,
  "difficulty": "medium",
  "category": "daily_life",
  "primary_stat": "strength"
}

Examples:
- "Do laundry" → Title: "Cleanse the Cursed Garments", Category: "home", Primary Stat: "strength"
- "Go grocery shopping" → Title: "Gather Resources from the Merchant's Bazaar", Category: "daily_life", Primary Stat: "strength"
- "Exercise for 30 minutes" → Title: "Train with the Ancient Fitness Masters", Category: "health", Primary Stat: "endurance"
- "Study for exam" → Title: "Unlock the Forbidden Knowledge Scrolls", Category: "education", Primary Stat: "wisdom"
- "Give a presentation" → Title: "Address the Council of Nobles", Category: "career", Primary Stat: "charisma"

Categories: health, education, career, home, social, creative, daily_life, finance
Primary Stats: strength, wisdom, endurance, charisma`;

  try {
    const client = getOpenAIClient();
    
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // Fast and cost-effective
      messages: [
        {
          role: "system",
          content: "You are a creative RPG game master who transforms mundane real-world tasks into exciting fantasy quests. Always return valid JSON. Make the quests feel achievable yet epic. Carefully analyze each task to determine which character stat (strength, wisdom, endurance, charisma) it would most realistically improve."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8, // High creativity
      max_tokens: 400,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    const questData = JSON.parse(content) as QuestGenerationResult;
    
    // Validate the response
    if (!questData.title || !questData.description || !questData.xp_reward) {
      throw new Error('Invalid quest data structure');
    }

    // Ensure we have a primary_stat, fallback to automatic determination
    if (!questData.primary_stat || !['strength', 'wisdom', 'endurance', 'charisma'].includes(questData.primary_stat)) {
      questData.primary_stat = determinePrimaryStat(originalTask, questData.category || 'general');
    }

    // Ensure XP is reasonable and scales with user level
    const baseXP = Math.max(10, Math.min(100, questData.xp_reward));
    const levelMultiplier = Math.max(1, Math.floor(userLevel / 5) + 1);
    questData.xp_reward = Math.min(200, baseXP * levelMultiplier);

    // Ensure title isn't too long
    if (questData.title.length > 60) {
      questData.title = questData.title.substring(0, 57) + '...';
    }

    return questData;

  } catch (error) {
    console.error('Error generating quest with AI:', error);
    
    // Fallback to template-based generation
    return generateQuickQuest(originalTask, userLevel);
  }
}