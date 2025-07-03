'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, User, Bot, Lightbulb, Settings } from 'lucide-react';
import Link from 'next/link';
import { Message, CoachingNote, ClientPersona, Team, ConversationTodo } from '@/lib/types';
import { ClientPersonaSettings } from '@/components/ClientPersonaSettings';
import { useEffect } from 'react';

// Default personas (same as in ClientPersonaSettings)
const defaultB2BPersona: ClientPersona = {
  id: 'default-b2b',
  name: 'B2B Enterprise Client',
  role: 'VP of Digital Transformation',
  industry: 'Financial Services',
  companySize: '10,000+ employees',
  currentMindset: 'expertise-evaluating',
  sophisticationLevel: 'high',
  typicalObjections: [
    'We already have consultants',
    'How are you different from the big firms?',
    'Can you handle our scale?',
    'Do you understand our regulatory requirements?'
  ],
  valueDrivers: [
    'Proven enterprise experience',
    'Industry-specific expertise',
    'ROI and business outcomes',
    'Risk mitigation'
  ],
  painPoints: [
    'Legacy system integration',
    'Change management at scale',
    'Regulatory compliance',
    'Speed to market'
  ],
  budgetConcerns: 'Annual budget cycles, procurement processes',
  decisionCriteria: [
    'Track record with similar companies',
    'Team expertise and certifications',
    'Methodology and approach',
    'Cultural fit'
  ],
  communicationStyle: 'Formal, data-driven, committee-based decisions',
  isDefault: true
};

export default function PracticeMode({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [coachingNotes, setCoachingNotes] = useState<CoachingNote[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showPersonaSettings, setShowPersonaSettings] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<ClientPersona | null>(defaultB2BPersona);
  const [previewPersona, setPreviewPersona] = useState<ClientPersona | null>(null);
  const [customPersonas, setCustomPersonas] = useState<ClientPersona[]>([]);
  const [expertiseScore, setExpertiseScore] = useState(0);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('team-1');
  const [teams, setTeams] = useState<Team[]>([]);
  const [todos, setTodos] = useState<ConversationTodo[]>([]);

  // Load teams and todos data
  useEffect(() => {
    // Create default teams similar to conversation page
    const defaultTeams: Team[] = [
      {
        id: 'team-1',
        organizationId: '1',
        name: 'Team 1',
        leaders: 'Leadership Team',
        description: '',
        color: '#1E40AF',
        progress: 0,
        isRoot: true,
      },
      {
        id: 'team-2',
        organizationId: '1',
        name: 'Team 2',
        leaders: '',
        description: '',
        color: '#10B981',
        progress: 0,
        isRoot: false,
        parentId: 'team-1',
      },
      {
        id: 'team-3',
        organizationId: '1',
        name: 'Team 3',
        leaders: '',
        description: '',
        color: '#F59E0B',
        progress: 0,
        isRoot: false,
        parentId: 'team-1',
      },
      {
        id: 'team-4',
        organizationId: '1',
        name: 'Team 4',
        leaders: '',
        description: '',
        color: '#8B5CF6',
        progress: 0,
        isRoot: false,
        parentId: 'team-1',
      },
    ];
    setTeams(defaultTeams);

    // Create todos for each team
    const todoTemplates = [
      { type: 'focus', title: 'Choose a Focus' },
      { type: 'expertise', title: 'Articulate a Claim of Expertise' },
      { type: 'perspective', title: 'Provide Your Point of View' },
      { type: 'thesis', title: 'Publish Your Thesis' },
      { type: 'contentMap', title: 'Develop Content Map' },
      { type: 'leadGen', title: 'Develop Lead Gen Plan' },
    ];

    const allTodos: ConversationTodo[] = [];
    defaultTeams.forEach(team => {
      todoTemplates.forEach((template, index) => {
        allTodos.push({
          id: `${team.id}-todo-${index}`,
          conversationId: params.id,
          teamId: team.id,
          type: template.type as any,
          title: template.title,
          content: '',
          status: 'not-started',
          lastModified: new Date(),
        });
      });
    });
    setTodos(allTodos);
  }, [params.id]);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const teamTodos = todos.filter(t => t.teamId === selectedTeamId);
  const focusTodo = teamTodos.find(t => t.type === 'focus');
  const expertiseTodo = teamTodos.find(t => t.type === 'expertise');

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    if (!currentPersona) {
      alert('Please select a client persona first');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      sessionId: 'current',
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call AI API with persona context
      const response = await fetch('/api/ai/practice-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages,
          clientPersona: currentPersona,
          teamContext: {
            teamName: selectedTeam?.name || 'Team',
            teamDescription: selectedTeam?.description || '',
            teamLeaders: selectedTeam?.leaders || ''
          },
          practiceSettings: {
            focusArea: 'Company Holistic Conversation'
          }
        }),
      });

      if (response.ok) {
        const { clientResponse, coachingNote } = await response.json();
        
        // Add client message
        const clientMessage: Message = {
          id: (Date.now() + 1).toString(),
          sessionId: 'current',
          role: 'client',
          content: clientResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, clientMessage]);
        
        // Add coaching note if provided
        if (coachingNote) {
          const note: CoachingNote = {
            id: Date.now().toString(),
            timestamp: new Date(),
            type: coachingNote.type,
            content: coachingNote.content,
            relatedMessage: userMessage.id
          };
          setCoachingNotes(prev => [...prev, note]);
          
          // Update expertise score based on coaching feedback
          setExpertiseScore(prev => {
            if (coachingNote.type === 'strength') {
              return Math.min(100, prev + 10);
            } else if (coachingNote.type === 'improvement') {
              return Math.max(0, prev - 5);
            }
            return prev; // No change for insights
          });
        }
      }
    } catch (error) {
      console.error('Error in practice conversation:', error);
      // Fallback response
      const clientMessage: Message = {
        id: (Date.now() + 1).toString(),
        sessionId: 'current',
        role: 'client',
        content: 'I understand you offer consulting services. Can you tell me more about your capabilities?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, clientMessage]);
    } finally {
      setIsTyping(false);
    }
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
              <select 
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <button
                onClick={() => setShowPersonaSettings(true)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
                  currentPersona 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Settings className="h-4 w-4" />
                {currentPersona ? currentPersona.name : 'Select Client Persona'}
              </button>
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
                  {currentPersona 
                    ? `Start a conversation with your ${currentPersona.name}`
                    : 'Please select a client persona to begin'}
                </p>
                <button
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    if (!currentPersona) {
                      alert('Please select a client persona first');
                      setShowPersonaSettings(true);
                      return;
                    }
                    // Send initial message to start conversation
                    setInputValue('Hello, I understand you\'re looking for expertise in digital transformation. I\'d love to learn more about your current challenges.');
                    handleSendMessage();
                  }}
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
            {currentPersona && (
              <div className="p-4 bg-purple-50 rounded-lg mb-4">
                <h4 className="font-medium text-purple-900 mb-2">Current Client</h4>
                <p className="text-sm font-semibold text-purple-800">
                  {currentPersona.name}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  {currentPersona.role} • {currentPersona.industry}
                </p>
              </div>
            )}

            {selectedTeam && (
              <div className="p-4 bg-yellow-50 rounded-lg mb-4">
                <h4 className="font-medium text-yellow-900 mb-2">Speaking as</h4>
                <p className="text-sm font-semibold text-yellow-800">
                  {selectedTeam.name}
                </p>
                {selectedTeam.leaders && (
                  <p className="text-xs text-yellow-700 mt-1">
                    Led by: {selectedTeam.leaders}
                  </p>
                )}
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Your Focus</h4>
              <p className="text-sm text-blue-800">
                {focusTodo?.content || 'No focus defined yet'}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Your Expertise Claim</h4>
              <p className="text-sm text-green-800">
                {expertiseTodo?.content || 'No expertise claim defined yet'}
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
                    style={{ width: `${expertiseScore}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">{expertiseScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ClientPersonaSettings
        isOpen={showPersonaSettings}
        onClose={() => setShowPersonaSettings(false)}
        currentPersona={currentPersona}
        selectedPersona={previewPersona}
        onSelectPersona={(persona) => setPreviewPersona(persona)}
        onConfirmPersona={() => {
          if (previewPersona) {
            setCurrentPersona(previewPersona);
            setShowPersonaSettings(false);
          }
        }}
        customPersonas={customPersonas}
        onCreatePersona={(persona) => setCustomPersonas([...customPersonas, persona])}
        onDeletePersona={(id) => {
          setCustomPersonas(customPersonas.filter(p => p.id !== id));
          if (currentPersona?.id === id) {
            setCurrentPersona(null);
          }
          if (previewPersona?.id === id) {
            setPreviewPersona(null);
          }
        }}
      />
    </div>
  );
}