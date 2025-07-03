'use client';

import { useState } from 'react';
import { Sparkles, X, RotateCw, ChevronDown } from 'lucide-react';
import { ConversationTodo, Team } from '@/lib/types';

interface TodoItemProps {
  todo: ConversationTodo;
  team: Team;
  onUpdate: (todo: ConversationTodo) => void;
  onGenerateIdea: (todo: ConversationTodo, team: Team) => Promise<void>;
}

const statusOptions = [
  { value: 'not-started', label: 'Not Started', color: 'bg-gray-100 text-gray-700' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'review', label: 'Review', color: 'bg-blue-100 text-blue-700' },
  { value: 'complete', label: 'Complete', color: 'bg-green-100 text-green-700' },
];

export function TodoItem({ todo, team, onUpdate, onGenerateIdea }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(todo.content || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const handleSave = () => {
    onUpdate({ ...todo, content: editedContent });
    setIsEditing(false);
  };

  const handleGenerateIdea = async () => {
    setIsGenerating(true);
    await onGenerateIdea(todo, team);
    setIsGenerating(false);
  };

  const handleDismissIdea = () => {
    onUpdate({ ...todo, aiIdea: undefined });
  };

  const handleStatusChange = (newStatus: string) => {
    onUpdate({ ...todo, status: newStatus as ConversationTodo['status'] });
    setShowStatusDropdown(false);
  };

  const currentStatus = statusOptions.find(s => s.value === todo.status);

  return (
    <div className="border-b border-gray-200 pb-6 last:border-0">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-base font-medium text-gray-900">{todo.title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateIdea}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate Ideas'}
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className={`px-3 py-1.5 text-sm rounded-lg ${currentStatus?.color}`}
            >
              {currentStatus?.label}
            </button>
            
            {showStatusDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Idea Display */}
      {todo.aiIdea && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg relative">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-blue-700">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">Idea</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleGenerateIdea}
                className="p-1 hover:bg-blue-100 rounded transition-colors"
                title="Regenerate"
              >
                <RotateCw className="h-4 w-4 text-blue-600" />
              </button>
              <button
                onClick={handleDismissIdea}
                className="p-1 hover:bg-blue-100 rounded transition-colors"
                title="Dismiss"
              >
                <X className="h-4 w-4 text-blue-600" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-700">{todo.aiIdea.content}</p>
        </div>
      )}

      {/* Content Field */}
      {isEditing ? (
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setEditedContent(todo.content || '');
              setIsEditing(false);
            }
          }}
          placeholder={`Enter your ${todo.type} here...`}
          className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="min-h-[80px] px-4 py-3 bg-gray-50 rounded-lg cursor-text hover:bg-gray-100 transition-colors"
        >
          {todo.content ? (
            <p className="text-gray-700 whitespace-pre-wrap">{todo.content}</p>
          ) : (
            <p className="text-gray-400 text-sm">Enter your {todo.type} here...</p>
          )}
        </div>
      )}
    </div>
  );
}