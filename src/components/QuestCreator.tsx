'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Sparkles, Plus, Loader2, Zap } from 'lucide-react';
import { db } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface QuestCreatorProps {
  userId: string;
  userLevel: number;
  characterClass: string;
  onQuestCreated: (quest: any) => void;
}

export function QuestCreator({ userId, userLevel, characterClass, onQuestCreated }: QuestCreatorProps) {
  const [task, setTask] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [preview, setPreview] = useState<any>(null);

  const handleTaskChange = (value: string) => {
    setTask(value);
    setPreview(null);
  };

  const generatePreview = async () => {
    if (!task.trim()) return;
    
    setIsGenerating(true);
    try {
      // Call the API endpoint for quest generation
      const response = await fetch('/api/quests/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: task.trim(),
          userLevel,
          characterClass,
          useAI,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate quest');
      }

      const data = await response.json();
      setPreview(data.quest);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate quest preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const createQuest = async () => {
    if (!preview) return;
    
    setIsGenerating(true);
    try {
      const questData = {
        user_id: userId,
        title: preview.title,
        description: preview.description,
        original_task: task,
        xp_reward: preview.xp_reward,
        difficulty: preview.difficulty,
        category: preview.category,
      };

      const { quest, error } = await db.createQuest(questData);
      
      if (error) {
        throw error;
      }

      toast.success('Quest created! Time to become a hero! 🎉');
      onQuestCreated(quest);
      
      // Reset form
      setTask('');
      setPreview(null);
      
    } catch (error) {
      console.error('Error creating quest:', error);
      toast.error('Failed to create quest');
    } finally {
      setIsGenerating(false);
    }
  };

  const quickSuggestions = [
    'Do laundry',
    'Exercise for 30 minutes', 
    'Read 20 pages',
    'Clean my room',
    'Call a friend',
    'Cook dinner',
    'Study for 1 hour',
    'Go grocery shopping'
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ✨ Transform Your Tasks Into Epic Quests
        </h2>
        <p className="text-gray-600">
          Turn boring to-dos into heroic adventures that motivate you to action!
        </p>
      </div>

      {/* AI Toggle */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => setUseAI(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            useAI 
              ? 'bg-purple-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          AI Magic
        </button>
        
        <button
          onClick={() => setUseAI(false)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            !useAI 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          Quick Transform
        </button>
      </div>

      {/* Task Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What do you need to accomplish?
        </label>
        <div className="relative">
          <textarea
            value={task}
            onChange={(e) => handleTaskChange(e.target.value)}
            placeholder="Enter any task... (e.g., 'clean my room', 'exercise', 'study for exam')"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
          />
          
          {task && !preview && (
            <motion.button
              onClick={generatePreview}
              disabled={isGenerating}
              className="absolute bottom-3 right-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white p-2 rounded-lg flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isGenerating ? 'Transforming...' : 'Transform'}
            </motion.button>
          )}
        </div>
      </div>

      {/* Quick Suggestions */}
      {!task && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Or try one of these:</p>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setTask(suggestion)}
                className="px-3 py-1 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-full text-sm transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quest Preview */}
      {preview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-6 rounded-lg text-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⚔️</span>
              <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                {preview.category}
              </span>
              <span className="text-sm bg-yellow-500/20 px-2 py-1 rounded-full">
                {preview.difficulty}
              </span>
            </div>
            
            <h3 className="text-xl font-bold mb-2">{preview.title}</h3>
            <p className="text-sm opacity-90 mb-4">{preview.description}</p>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="font-bold text-yellow-300">+{preview.xp_reward} XP</span>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setPreview(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Edit Task
                </button>
                
                <button
                  onClick={createQuest}
                  disabled={isGenerating}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {isGenerating ? 'Creating...' : 'Create Quest'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pro Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Pro Tips for Better Quests:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Be specific: "Exercise for 30 minutes" vs "Exercise"</li>
          <li>• Include context: "Study for math exam" vs "Study"</li>
          <li>• Try different quest types: daily tasks, creative projects, social activities</li>
          <li>• Use AI Magic for more creative and personalized quest descriptions</li>
        </ul>
      </div>
    </div>
  );
}