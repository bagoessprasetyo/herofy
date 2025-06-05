import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface QuestGenerationResult {
  title: string;
  description: string;
  xp_reward: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  category: string;
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

Return ONLY valid JSON in this exact format:
{
  "title": "Epic quest title with RPG flair",
  "description": "Compelling quest description with fantasy elements and motivation.",
  "xp_reward": 50,
  "difficulty": "medium",
  "category": "daily_life"
}

Examples:
- "Do laundry" → Title: "Cleanse the Cursed Garments", Category: "home"
- "Go grocery shopping" → Title: "Gather Resources from the Merchant's Bazaar", Category: "daily_life"
- "Exercise for 30 minutes" → Title: "Train with the Ancient Fitness Masters", Category: "health"
- "Study for exam" → Title: "Unlock the Forbidden Knowledge Scrolls", Category: "education"
- "Complete work presentation" → Title: "Craft the Legendary Presentation Artifact", Category: "career"

Categories: health, education, career, home, social, creative, daily_life, finance`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and cost-effective
      messages: [
        {
          role: "system",
          content: "You are a creative RPG game master who transforms mundane real-world tasks into exciting fantasy quests. Always return valid JSON. Make the quests feel achievable yet epic."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8, // High creativity
      max_tokens: 300,
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
    return generateTemplateQuest(originalTask, userLevel);
  }
}

// Fast template-based quest generation (backup when AI fails)
function generateTemplateQuest(originalTask: string, userLevel: number): QuestGenerationResult {
  const taskLower = originalTask.toLowerCase();
  
  // Detect task category and generate appropriate quest
  if (taskLower.includes('exercise') || taskLower.includes('gym') || taskLower.includes('run') || taskLower.includes('workout')) {
    return {
      title: "Train with the Ancient Fitness Masters",
      description: "Channel your inner warrior and strengthen your body through the sacred rituals of physical training. Your muscles shall become as strong as dragon scales!",
      xp_reward: Math.min(100, 60 + (userLevel * 5)),
      difficulty: 'medium',
      category: 'health'
    };
  }
  
  if (taskLower.includes('clean') || taskLower.includes('tidy') || taskLower.includes('organize')) {
    return {
      title: "Purge the Chaos Demons from Your Domain",
      description: "Wield the legendary tools of cleansing to banish the forces of disorder from your sacred space. Restore harmony and claim victory!",
      xp_reward: Math.min(100, 50 + (userLevel * 4)),
      difficulty: 'medium',
      category: 'home'
    };
  }
  
  if (taskLower.includes('study') || taskLower.includes('read') || taskLower.includes('learn') || taskLower.includes('exam')) {
    return {
      title: "Unlock the Forbidden Knowledge Scrolls",
      description: "Delve deep into the ancient texts to gain wisdom that will elevate your mind to new heights. Each page brings you closer to mastery!",
      xp_reward: Math.min(120, 70 + (userLevel * 6)),
      difficulty: 'hard',
      category: 'education'
    };
  }
  
  if (taskLower.includes('work') || taskLower.includes('meeting') || taskLower.includes('presentation') || taskLower.includes('project')) {
    return {
      title: "Complete the Professional Guild Mission",
      description: "Your expertise is needed to tackle this important quest for the Professional Guild. Show your mastery and earn the respect of your peers!",
      xp_reward: Math.min(110, 65 + (userLevel * 5)),
      difficulty: 'medium',
      category: 'career'
    };
  }
  
  if (taskLower.includes('cook') || taskLower.includes('meal') || taskLower.includes('recipe') || taskLower.includes('food')) {
    return {
      title: "Craft the Legendary Feast",
      description: "Channel the power of the ancient culinary arts to create sustenance worthy of heroes. Your kitchen shall become a temple of nourishment!",
      xp_reward: Math.min(90, 45 + (userLevel * 4)),
      difficulty: 'easy',
      category: 'daily_life'
    };
  }
  
  // Generic fallback
  const genericTitles = [
    "Conquer the Challenge of Destiny",
    "Master the Art of Achievement", 
    "Complete the Sacred Mission",
    "Triumph Over the Task of Power",
    "Fulfill the Quest of Heroes"
  ];
  
  const randomTitle = genericTitles[Math.floor(Math.random() * genericTitles.length)];
  
  return {
    title: randomTitle,
    description: `Brave adventurer, your quest awaits! Use your skills and determination to complete this important mission. Victory will bring great rewards and advance your heroic journey!`,
    xp_reward: Math.min(100, 50 + (userLevel * 3)),
    difficulty: 'medium',
    category: 'general'
  };
}

// Quick quest generation for instant feedback (uses templates, no AI delay)
export function generateQuickQuest(originalTask: string, userLevel: number = 1): QuestGenerationResult {
  return generateTemplateQuest(originalTask, userLevel);
}

// Difficulty-based XP calculation
export function calculateXPReward(difficulty: string, userLevel: number): number {
  const baseXP = {
    easy: 30,
    medium: 50,
    hard: 75,
    epic: 100
  };
  
  const base = baseXP[difficulty as keyof typeof baseXP] || 50;
  const levelBonus = Math.floor(userLevel / 3) * 10;
  
  return Math.min(200, base + levelBonus);
}

// Get difficulty color for UI
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'from-green-500 to-emerald-600';
    case 'medium': return 'from-blue-500 to-purple-600';
    case 'hard': return 'from-purple-500 to-pink-600';
    case 'epic': return 'from-red-500 to-orange-600';
    default: return 'from-blue-500 to-purple-600';
  }
}

// Get difficulty icon for UI
export function getDifficultyIcon(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return '⚡';
    case 'medium': return '⭐';
    case 'hard': return '🔥';
    case 'epic': return '👑';
    default: return '⭐';
  }
}