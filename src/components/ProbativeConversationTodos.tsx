'use client';

import React from 'react';
import { ConversationTodo } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Sparkles, ChevronRight } from 'lucide-react';

interface Props {
  todos: ConversationTodo[];
  onTodoClick: (todo: ConversationTodo) => void;
  onGenerateIdeas: (todoType: string) => void;
  onStatusChange: (todoId: string, status: string) => void;
}

const todoTitles: Record<string, string> = {
  focus: 'Choose a Focus',
  expertise: 'Articulate a Claim of Expertise',
  perspective: 'Add a Perspective',
  thesis: 'Publish Thesis',
  contentMap: 'Develop Content Map',
  leadGen: 'Develop Lead Gen Plan'
};

const todoDescriptions: Record<string, string> = {
  focus: 'Identify the specific business challenge to address',
  expertise: 'State your unique perspective/approach',
  perspective: 'Share insights that demonstrate deep understanding',
  thesis: 'Document your point of view publicly',
  contentMap: 'Plan supporting content to reinforce expertise',
  leadGen: 'Strategy to attract right-fit clients'
};

export function ProbativeConversationTodos({
  todos,
  onTodoClick,
  onGenerateIdeas,
  onStatusChange
}: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'text-green-600 bg-green-50';
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'in-progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Probative Conversation To-Do's
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Follow Blair Enns' methodology to move from vendor to expert
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Step
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.keys(todoTitles).map((type) => {
              const todo = todos.find(t => t.type === type);
              const status = todo?.status || 'not-started';
              
              return (
                <tr 
                  key={type}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => todo && onTodoClick(todo)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {todoTitles[type as keyof typeof todoTitles]}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {todoDescriptions[type as keyof typeof todoDescriptions]}
                    </div>
                    {todo?.content && (
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-md">
                        {todo.content}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      getStatusColor(status)
                    )}>
                      {getStatusText(status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onGenerateIdeas(type);
                        }}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Sparkles className="h-4 w-4" />
                        Generate Ideas
                      </button>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
          Review Full Methodology →
        </button>
      </div>
    </div>
  );
}