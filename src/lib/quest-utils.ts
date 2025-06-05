// Client-safe quest utilities (no OpenAI dependency)
// This file can be safely imported in client components
export interface QuestGenerationResult {
    title: string;
    description: string;
    xp_reward: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'epic';
    category: string;
    primary_stat: 'strength' | 'wisdom' | 'endurance' | 'charisma';
  }
  
  // Determine the primary stat based on task content and category
  export function determinePrimaryStat(task: string, category: string): 'strength' | 'wisdom' | 'endurance' | 'charisma' {
    const taskLower = task.toLowerCase();
    
    // Physical activities -> Endurance
    if (taskLower.includes('exercise') || 
        taskLower.includes('workout') || 
        taskLower.includes('gym') || 
        taskLower.includes('run') || 
        taskLower.includes('jog') || 
        taskLower.includes('swim') || 
        taskLower.includes('bike') || 
        taskLower.includes('yoga') || 
        taskLower.includes('fitness') ||
        taskLower.includes('sport') ||
        category === 'health') {
      return 'endurance';
    }
    
    // Learning/Study activities -> Wisdom
    if (taskLower.includes('study') || 
        taskLower.includes('read') || 
        taskLower.includes('learn') || 
        taskLower.includes('research') || 
        taskLower.includes('book') || 
        taskLower.includes('course') || 
        taskLower.includes('exam') || 
        taskLower.includes('homework') ||
        taskLower.includes('practice') ||
        taskLower.includes('skill') ||
        category === 'education') {
      return 'wisdom';
    }
    
    // Social/Communication activities -> Charisma
    if (taskLower.includes('call') || 
        taskLower.includes('meet') || 
        taskLower.includes('presentation') || 
        taskLower.includes('interview') || 
        taskLower.includes('networking') || 
        taskLower.includes('social') || 
        taskLower.includes('friend') || 
        taskLower.includes('family') ||
        taskLower.includes('date') ||
        taskLower.includes('party') ||
        taskLower.includes('collaborate') ||
        category === 'social' ||
        category === 'career') {
      return 'charisma';
    }
    
    // Physical tasks/chores -> Strength
    if (taskLower.includes('clean') || 
        taskLower.includes('organize') || 
        taskLower.includes('build') || 
        taskLower.includes('fix') || 
        taskLower.includes('repair') || 
        taskLower.includes('move') || 
        taskLower.includes('lift') || 
        taskLower.includes('carry') ||
        taskLower.includes('install') ||
        taskLower.includes('construct') ||
        category === 'home') {
      return 'strength';
    }
    
    // Creative tasks -> Wisdom (creativity is a form of mental exercise)
    if (taskLower.includes('write') || 
        taskLower.includes('draw') || 
        taskLower.includes('paint') || 
        taskLower.includes('design') || 
        taskLower.includes('create') || 
        taskLower.includes('compose') ||
        category === 'creative') {
      return 'wisdom';
    }
    
    // Work/Professional tasks -> Charisma (most work involves communication)
    if (taskLower.includes('work') || 
        taskLower.includes('project') || 
        taskLower.includes('meeting') || 
        taskLower.includes('email') ||
        taskLower.includes('report') ||
        category === 'career') {
      return 'charisma';
    }
    
    // Financial tasks -> Wisdom (requires planning and knowledge)
    if (taskLower.includes('budget') || 
        taskLower.includes('bank') || 
        taskLower.includes('money') || 
        taskLower.includes('invest') ||
        taskLower.includes('finance') ||
        category === 'finance') {
      return 'wisdom';
    }
    
    // Default fallback based on category
    switch (category) {
      case 'health': return 'endurance';
      case 'education': return 'wisdom';
      case 'social': case 'career': return 'charisma';
      case 'home': case 'daily_life': return 'strength';
      case 'creative': return 'wisdom';
      case 'finance': return 'wisdom';
      default: return 'strength'; // Default fallback
    }
  }
  
  // Get stat icon and color
  export function getStatInfo(stat: string) {
    switch (stat) {
      case 'strength':
        return { icon: '💪', color: 'text-red-600 bg-red-100', name: 'Strength' };
      case 'wisdom':
        return { icon: '🧠', color: 'text-blue-600 bg-blue-100', name: 'Wisdom' };
      case 'endurance':
        return { icon: '❤️', color: 'text-green-600 bg-green-100', name: 'Endurance' };
      case 'charisma':
        return { icon: '✨', color: 'text-yellow-600 bg-yellow-100', name: 'Charisma' };
      default:
        return { icon: '💪', color: 'text-gray-600 bg-gray-100', name: 'Strength' };
    }
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
  
  // Quick quest generation for instant feedback (uses templates, no AI delay)
  export function generateQuickQuest(originalTask: string, userLevel: number = 1): QuestGenerationResult {
    return generateTemplateQuest(originalTask, userLevel);
  }
  
  // Fast template-based quest generation (backup when AI fails)
  function generateTemplateQuest(originalTask: string, userLevel: number): QuestGenerationResult {
    const taskLower = originalTask.toLowerCase();
    let category = 'general';
    let difficulty: 'easy' | 'medium' | 'hard' | 'epic' = 'medium';
    let title = '';
    let description = '';
    
    // Detect task category and generate appropriate quest
    if (taskLower.includes('exercise') || taskLower.includes('gym') || taskLower.includes('run') || taskLower.includes('workout')) {
      category = 'health';
      title = "Train with the Ancient Fitness Masters";
      description = "Channel your inner warrior and strengthen your body through the sacred rituals of physical training. Your muscles shall become as strong as dragon scales!";
      difficulty = 'medium';
    } else if (taskLower.includes('clean') || taskLower.includes('tidy') || taskLower.includes('organize')) {
      category = 'home';
      title = "Purge the Chaos Demons from Your Domain";
      description = "Wield the legendary tools of cleansing to banish the forces of disorder from your sacred space. Restore harmony and claim victory!";
      difficulty = 'medium';
    } else if (taskLower.includes('study') || taskLower.includes('read') || taskLower.includes('learn') || taskLower.includes('exam')) {
      category = 'education';
      title = "Unlock the Forbidden Knowledge Scrolls";
      description = "Delve deep into the ancient texts to gain wisdom that will elevate your mind to new heights. Each page brings you closer to mastery!";
      difficulty = 'hard';
    } else if (taskLower.includes('work') || taskLower.includes('meeting') || taskLower.includes('presentation') || taskLower.includes('project')) {
      category = 'career';
      title = "Complete the Professional Guild Mission";
      description = "Your expertise is needed to tackle this important quest for the Professional Guild. Show your mastery and earn the respect of your peers!";
      difficulty = 'medium';
    } else if (taskLower.includes('cook') || taskLower.includes('meal') || taskLower.includes('recipe') || taskLower.includes('food')) {
      category = 'daily_life';
      title = "Craft the Legendary Feast";
      description = "Channel the power of the ancient culinary arts to create sustenance worthy of heroes. Your kitchen shall become a temple of nourishment!";
      difficulty = 'easy';
    } else {
      // Generic fallback
      const genericTitles = [
        "Conquer the Challenge of Destiny",
        "Master the Art of Achievement", 
        "Complete the Sacred Mission",
        "Triumph Over the Task of Power",
        "Fulfill the Quest of Heroes"
      ];
      
      title = genericTitles[Math.floor(Math.random() * genericTitles.length)];
      description = `Brave adventurer, your quest awaits! Use your skills and determination to complete this important mission. Victory will bring great rewards and advance your heroic journey!`;
    }
    
    const primary_stat = determinePrimaryStat(originalTask, category);
    const xp_reward = Math.min(100, calculateXPReward(difficulty, userLevel));
    
    return {
      title,
      description,
      xp_reward,
      difficulty,
      category,
      primary_stat
    };
  }