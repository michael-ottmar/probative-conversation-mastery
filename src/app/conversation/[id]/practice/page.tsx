'use client';

import { useState } from 'react';
import { ArrowLeft, Send, User, Bot, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { Message, CoachingNote } from '@/lib/types';

export default function PracticeMode({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [coachingNotes, setCoachingNotes] = useState<CoachingNote[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sessionId: 'current',
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const clientMessage: Message = {
        id: (Date.now() + 1).toString(),
        sessionId: 'current',
        role: 'client',
        content: 'I understand you offer consulting services. Can you tell me more about your capabilities and how you typically work with enterprise clients?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, clientMessage]);
      setIsTyping(false);

      // Add coaching note
      const note: CoachingNote = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'improvement',
        content: 'Remember to demonstrate expertise through insights, not just capabilities. Share a unique perspective about their industry.',
        relatedMessage: userMessage.id
      };
      setCoachingNotes(prev => [...prev, note]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href={`/conversation/${params.id}`}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Practice Mode
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Company Holistic Conversation</option>
                <option>Creative Studio Focus</option>
                <option>Managed Services Focus</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Enterprise B2B</option>
                <option>Mid-Market CEO</option>
                <option>Startup Founder</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex gap-6">
        {/* Chat Interface */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Probative Conversation Practice
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Prove your expertise and move from vendor to expert
            </p>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Start a conversation with your potential client
                </p>
                <button
                  onClick={() => handleSendMessage()}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Begin Conversation
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'client' && (
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <Bot className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                    )}
                    <div
                      className={`max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <Bot className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your response..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Coaching Sidebar */}
        <div className="w-96 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Expertise Coach
            </h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Your Focus</h4>
              <p className="text-sm text-blue-800">
                Digital transformation readiness for enterprise organizations
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Your Expertise Claim</h4>
              <p className="text-sm text-green-800">
                We see transformation differently - as a coordinated effort across strategy, operations, and brand
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Coaching Notes</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {coachingNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-lg text-sm ${
                      note.type === 'strength'
                        ? 'bg-green-50 text-green-800'
                        : note.type === 'improvement'
                        ? 'bg-yellow-50 text-yellow-800'
                        : 'bg-blue-50 text-blue-800'
                    }`}
                  >
                    {note.content}
                  </div>
                ))}
                {coachingNotes.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Coaching feedback will appear here as you practice
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Expertise Score</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: '0%' }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">0%</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}