'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Sparkles, Plus, Loader2, Zap, AlertCircle, TrendingUp } from 'lucide-react';
import { db } from '@/lib/supabase';
import { getStatInfo } from '@/lib/quest-utils';
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
  const [error, setError] = useState<string | null>(null);
  
  // Prevent duplicate submissions
  const isCreatingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleTaskChange = useCallback((value: string) => {
    setTask(value);
    setPreview(null);
    setError(null);
  }, []);

  const generatePreview = async () => {
    if (!task.trim() || isGenerating) return;
    
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setIsGenerating(true);
    setError(null);
    
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
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate quest');
      }

      const data = await response.json();
      setPreview(data.quest);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }
      
      console.error('Error generating preview:', error);
      setError(error.message || 'Failed to generate quest preview');
      toast.error('Failed to generate quest preview');
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const createQuest = async () => {
    if (!preview || isCreatingRef.current || !userId) return;
    
    // Prevent duplicate submissions
    isCreatingRef.current = true;
    setIsGenerating(true);
    setError(null);
    
    try {
      const questData = {
        user_id: userId,
        title: preview.title,
        description: preview.description,
        original_task: task.trim(),
        xp_reward: preview.xp_reward,
        difficulty: preview.difficulty,
        category: preview.category,
        primary_stat: preview.primary_stat,
        status: 'active' as const,
      };

      const { quest, error } = await db.createQuest(questData);
      
      if (error) {
        throw error;
      }

      if (quest) {
        const statInfo = getStatInfo(preview.primary_stat);
        toast.success(`🎉 Quest created! This will improve your ${statInfo.name} ${statInfo.icon}`);
        onQuestCreated(quest);
        
        // Reset form
        setTask('');
        setPreview(null);
        setError(null);
      }
      
    } catch (error: any) {
      console.error('Error creating quest:', error);
      
      // Handle specific error types
      if (error.message?.includes('already exists')) {
        setError('You already have an active quest for this task!');
        toast.error('Quest already exists for this task');
      } else if (error.message?.includes('duplicate key')) {
        setError('This quest was already created. Please refresh the page.');
        toast.error('Quest already exists');
      } else {
        setError(error.message || 'Failed to create quest');
        toast.error('Failed to create quest. Please try again.');
      }
    } finally {
      setIsGenerating(false);
      // Allow new submissions after a brief delay to prevent rapid-fire clicking
      setTimeout(() => {
        isCreatingRef.current = false;
      }, 1000);
    }
  };

  const quickSuggestions = [
    { task: 'Do laundry', stat: 'strength' },
    { task: 'Exercise for 30 minutes', stat: 'endurance' }, 
    { task: 'Read 20 pages', stat: 'wisdom' },
    { task: 'Clean my room', stat: 'strength' },
    { task: 'Call a friend', stat: 'charisma' },
    { task: 'Cook dinner', stat: 'strength' },
    { task: 'Study for 1 hour', stat: 'wisdom' },
    { task: 'Go grocery shopping', stat: 'strength' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ✨ Transform Your Tasks Into Epic Quests
        </h2>
        <p className="text-gray-600">
          Turn boring to-dos into heroic adventures that boost your character stats!
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* AI Toggle */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => setUseAI(true)}
          disabled={isGenerating}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
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
          disabled={isGenerating}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
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
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:bg-gray-50"
            rows={3}
            disabled={isGenerating}
            maxLength={200}
          />
          
          {task && !preview && (
            <motion.button
              onClick={generatePreview}
              disabled={isGenerating || task.trim().length < 3}
              className="absolute bottom-3 right-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg flex items-center gap-2"
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
        
        {task && (
          <div className="mt-1 text-xs text-gray-500">
            {task.length}/200 characters
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      {!task && !isGenerating && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Or try one of these (hover to see which stat they improve):</p>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, index) => {
              const statInfo = getStatInfo(suggestion.stat);
              return (
                <button
                  key={index}
                  onClick={() => handleTaskChange(suggestion.task)}
                  className="group px-3 py-1 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-full text-sm transition-colors relative"
                  title={`Improves ${statInfo.name} ${statInfo.icon}`}
                >
                  {suggestion.task}
                  <span className="ml-1 opacity-50 group-hover:opacity-100 transition-opacity">
                    {statInfo.icon}
                  </span>
                </button>
              );
            })}
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
              {preview.primary_stat && (
                <span className="text-sm bg-green-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {getStatInfo(preview.primary_stat).icon} {getStatInfo(preview.primary_stat).name}
                </span>
              )}
            </div>
            
            <h3 className="text-xl font-bold mb-2">{preview.title}</h3>
            <p className="text-sm opacity-90 mb-4">{preview.description}</p>
            
            {/* Stat Improvement Preview */}
            {preview.primary_stat && (
              <div className="bg-white/10 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-300" />
                  <span className="text-green-300 font-medium">
                    Completing this quest will improve your {getStatInfo(preview.primary_stat).name} {getStatInfo(preview.primary_stat).icon}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="font-bold text-yellow-300">+{preview.xp_reward} XP</span>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPreview(null);
                    setError(null);
                    isCreatingRef.current = false;
                  }}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  Edit Task
                </button>
                
                <button
                  onClick={createQuest}
                  disabled={isGenerating || isCreatingRef.current}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
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

      {/* Character Stats Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Character Stats Guide:
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-red-600">💪 Strength:</span>
            <span className="text-gray-700">Physical tasks, cleaning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600">🧠 Wisdom:</span>
            <span className="text-gray-700">Learning, studying</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">❤️ Endurance:</span>
            <span className="text-gray-700">Exercise, fitness</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-600">✨ Charisma:</span>
            <span className="text-gray-700">Social, communication</span>
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Pro Tips for Better Quests:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Be specific: "Exercise for 30 minutes" vs "Exercise"</li>
          <li>• Include context: "Study for math exam" vs "Study"</li>
          <li>• Different task types improve different stats automatically</li>
          <li>• Use AI Magic for more creative and personalized quest descriptions</li>
        </ul>
      </div>
    </div>
  );
}