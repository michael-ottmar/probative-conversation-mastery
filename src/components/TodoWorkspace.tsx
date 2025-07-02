'use client';

import React, { useState } from 'react';
import { ConversationTodo } from '@/lib/types';
import { X, Sparkles, Save, AlertCircle } from 'lucide-react';

interface Props {
  todo: ConversationTodo;
  onSave: (content: string) => void;
  onClose: () => void;
  onGenerateIdeas: () => void;
}

const todoGuidance: Record<string, string> = {
  focus: "Choose a specific business challenge that your ideal clients face. This should be narrow enough to demonstrate deep expertise but broad enough to matter to multiple clients.",
  expertise: "Articulate what makes your approach unique. This isn't about capabilities - it's about your perspective, methodology, or insight that others don't have.",
  perspective: "Share an insight that demonstrates deep understanding of the challenge. This should make the client think 'I hadn't considered that' or 'They really understand our situation.'",
  thesis: "Document your point of view publicly. This could be an article, white paper, or thought leadership piece that establishes your expertise.",
  contentMap: "Plan content that reinforces your expertise claim. Each piece should demonstrate your unique perspective on the chosen focus area.",
  leadGen: "Design a strategy to attract clients who value expertise over price. Focus on demonstrating insight rather than pitching services."
};

export function TodoWorkspace({ todo, onSave, onClose, onGenerateIdeas }: Props) {
  const [content, setContent] = useState(todo.content || '');
  const [aiIdeas, setAiIdeas] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateIdeas = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          todoType: todo.type,
          organizationContext: {}, // Add context
          teamContext: {} // Add team context
        })
      });
      const data = await response.json();
      setAiIdeas(data.ideas || []);
    } catch (error) {
      console.error('Failed to generate ideas:', error);
    }
    setIsGenerating(false);
  };

  const handleSelectIdea = (idea: string) => {
    setContent(idea);
    setAiIdeas([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{todo.title}</h2>
            <p className="text-gray-600 mt-1">
              {todoGuidance[todo.type] || 'Complete this step in the probative conversation'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your response here..."
              />

              {aiIdeas.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    AI-Generated Ideas
                  </h3>
                  <div className="space-y-2">
                    {aiIdeas.map((idea, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectIdea(idea)}
                        className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <p className="text-sm text-blue-900">{idea}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-900">
                      Blair Enns Reminder
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Expertise is not about what you can do, but about what you understand that others don't.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateIdeas}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate Ideas'}
              </button>

              {todo.type === 'expertise' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Examples of Expertise Claims
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• "We see X differently..."</li>
                    <li>• "Our unique approach..."</li>
                    <li>• "We've discovered that..."</li>
                    <li>• "Unlike others who..."</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(content)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            Save Progress
          </button>
        </div>
      </div>
    </div>
  );
}