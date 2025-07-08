'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, User, Bot, Lightbulb, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { Message, CoachingNote, ClientPersona, Team, ConversationTodo } from '@/lib/types';
import { ClientPersonaSettings } from '@/components/ClientPersonaSettings';
import { usePracticeSession } from '@/hooks/usePracticeSession';
import { useSearchParams } from 'next/navigation';
import { getAvatarColor } from '@/lib/avatar';
import { useSelf } from '@/lib/liveblocks';
import { UserAvatar } from '@/components/UserAvatar';

// Default B2B persona (same as original)
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

interface CollaborativePracticeProps {
  conversationId: string;
  documentName: string;
}

export function CollaborativePractice({ conversationId, documentName }: CollaborativePracticeProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamFromUrl = searchParams.get('team');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const self = useSelf();
  
  const {
    practiceSession,
    initializeSession,
    addMessage,
    updateClientPersona,
    addCoachingNote,
    updateExpertiseScore,
    setTyping,
    typingUsers,
    isSessionActive,
    participants,
    messages,
    clientPersona,
    coachingNotes,
    expertiseScore
  } = usePracticeSession(conversationId);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPersonaSettings, setShowPersonaSettings] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [todos, setTodos] = useState<ConversationTodo[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teamFromUrl || '');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Initialize session on mount
  useEffect(() => {
    if (session?.user) {
      initializeSession();
      if (!clientPersona) {
        updateClientPersona(defaultB2BPersona);
      }
    }
  }, [session]);

  // Load teams and todos data
  useEffect(() => {
    if (session?.user) {
      fetchDocument();
    }
  }, [session, conversationId]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${conversationId}`);
      if (response.ok) {
        const doc = await response.json();
        
        // Transform teams
        const transformedTeams = doc.teams.map((team: any) => ({
          ...team,
          organizationId: doc.id,
          progress: calculateTeamProgress(team.todos)
        }));
        setTeams(transformedTeams);
        
        // Transform todos
        const allTodos = doc.teams.flatMap((team: any) => 
          team.todos.map((todo: any) => ({
            ...todo,
            conversationId: doc.id,
            lastModified: new Date(todo.updatedAt)
          }))
        );
        setTodos(allTodos);
        
        // Set selected team
        if (teamFromUrl) {
          const teamExists = transformedTeams.find((t: Team) => t.id === teamFromUrl);
          if (teamExists) {
            setSelectedTeamId(teamFromUrl);
          } else {
            const rootTeam = transformedTeams.find((t: Team) => t.isRoot);
            if (rootTeam) setSelectedTeamId(rootTeam.id);
          }
        } else {
          const rootTeam = transformedTeams.find((t: Team) => t.isRoot);
          if (rootTeam) setSelectedTeamId(rootTeam.id);
        }
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const calculateTeamProgress = (todos: any[]) => {
    const completedCount = todos.filter(t => 
      t.status === 'complete' || t.status === 'review'
    ).length;
    return todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    if (inputValue.length > 0 && !isTyping) {
      setIsTyping(true);
      setTyping(true);
    } else if (inputValue.length === 0 && isTyping) {
      setIsTyping(false);
      setTyping(false);
    }
  }, [inputValue, isTyping, setTyping]);

  const handleClientGoesFirst = async () => {
    setIsSendingMessage(true);
    
    try {
      // Get selected team and its todos
      const selectedTeam = teams.find(t => t.id === selectedTeamId);
      const teamTodos = todos.filter(t => t.teamId === selectedTeamId);
      
      // Call AI API to generate initial client message
      const response = await fetch('/api/ai/practice-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: [],
          userMessage: '', // Empty message to trigger initial client inquiry
          clientPersona: clientPersona || defaultB2BPersona,
          team: selectedTeam,
          todos: teamTodos,
          allTeams: teams,
          expertiseScore,
          isInitialMessage: true // Flag to indicate client should start
        })
      });
      
      if (response.ok) {
        const { clientResponse, clientName } = await response.json();
        
        // Add AI response as first message
        addMessage({
          role: 'client',
          content: clientResponse,
          clientName
        });
      }
    } catch (error) {
      console.error('Error generating initial client message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSendingMessage) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    setTyping(false);
    setIsSendingMessage(true);
    
    // Add user message to the session
    addMessage({
      role: 'user',
      content: userMessage,
      userName: session?.user?.name || session?.user?.email?.split('@')[0] || 'User',
      userId: session?.user?.id
    });
    
    try {
      // Get selected team and its todos
      const selectedTeam = teams.find(t => t.id === selectedTeamId);
      const teamTodos = todos.filter(t => t.teamId === selectedTeamId);
      
      // Call AI API with full organization context
      const response = await fetch('/api/ai/practice-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content,
            clientName: m.clientName
          })),
          userMessage,
          clientPersona: clientPersona || defaultB2BPersona,
          team: selectedTeam,
          todos: teamTodos,
          allTeams: teams, // Pass all teams for organization awareness
          expertiseScore
        })
      });
      
      if (response.ok) {
        const { clientResponse, clientName, coachingFeedback, updatedScore } = await response.json();
        
        // Add AI response
        addMessage({
          role: 'client',
          content: clientResponse,
          clientName
        });
        
        // Add coaching note if provided
        if (coachingFeedback) {
          const messageId = `msg-${Date.now()}`;
          addCoachingNote({
            messageId,
            type: coachingFeedback.type,
            content: coachingFeedback.content,
            timestamp: new Date()
          });
        }
        
        // Update expertise score
        if (updatedScore !== undefined) {
          updateExpertiseScore(updatedScore);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handlePersonaChange = (persona: ClientPersona) => {
    updateClientPersona(persona);
    setShowPersonaSettings(false);
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading practice session...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back button */}
          <div className="flex-1">
            <Link
              href={`/conversation/${conversationId}`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to {documentName}
            </Link>
          </div>
          
          {/* Center - Title and Team/Client info */}
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-semibold mb-1">Practice Conversation</h1>
            
            {/* Team and Client Info */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {selectedTeamId && teams.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Team:</span>
                  <span className="text-gray-900">{teams.find(t => t.id === selectedTeamId)?.name || 'Unknown'}</span>
                </div>
              )}
              {clientPersona && (
                <>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Client:</span>
                    <span className="text-gray-900">{clientPersona.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Right side - Participants and Settings */}
          <div className="flex-1 flex items-center justify-end gap-4">
            {/* Participants */}
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" />
              <div className="flex -space-x-2">
                {participants.slice(0, 3).map((participant, index) => (
                  <UserAvatar
                    key={participant.userId}
                    name={participant.userName || session?.user?.name}
                    email={participant.userEmail || session?.user?.email}
                    className="ring-2 ring-white"
                  />
                ))}
                {participants.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-sm font-medium border-2 border-white">
                    +{participants.length - 3}
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setShowPersonaSettings(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Settings className="h-4 w-4" />
              Client Settings
            </button>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Client Goes First Button - Show when no messages */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-600 mb-4">Start a practice conversation</p>
              <button
                onClick={() => handleClientGoesFirst()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Bot className="h-5 w-5" />
                Let the client start
              </button>
              <p className="text-sm text-gray-500 mt-2">or type your message below</p>
            </div>
          )}
          
          {messages.map((message, index) => {
            const isUser = message.role === 'user';
            const relatedNotes = coachingNotes.filter(note => 
              note.messageId === message.id
            );
            
            return (
              <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl ${isUser ? 'order-2' : ''}`}>
                  <div className="flex items-start gap-3">
                    {isUser ? (
                      <UserAvatar
                        name={message.userName || self?.presence?.user?.name || session?.user?.name}
                        email={session?.user?.email || self?.presence?.user?.email}
                      />
                    ) : (
                      <div 
                        className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center flex-shrink-0"
                        style={{ 
                          borderRadius: '9999px',
                          minWidth: '32px',
                          minHeight: '32px',
                          maxWidth: '32px',
                          maxHeight: '32px'
                        }}
                      >
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      {((isUser && message.userName) || (!isUser && message.clientName)) && (
                        <div className="text-sm text-gray-600 mb-1">
                          {isUser ? message.userName : message.clientName}
                        </div>
                      )}
                      <div className={`px-4 py-2 rounded-lg ${
                        isUser 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white border border-gray-200'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      
                      {/* Coaching Notes */}
                      {relatedNotes.map((note) => (
                        <div key={note.id} className="mt-2 flex items-start gap-2 text-sm">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <div>
                            <span className="font-medium capitalize">{note.type}:</span>
                            <span className="ml-1 text-gray-600">{note.content}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="text-sm text-gray-500 italic">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSendingMessage}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSendingMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Client Persona Settings Modal */}
      {showPersonaSettings && clientPersona && (
        <ClientPersonaSettings
          isOpen={showPersonaSettings}
          onClose={() => setShowPersonaSettings(false)}
          currentPersona={clientPersona}
          selectedPersona={clientPersona}
          onSelectPersona={handlePersonaChange}
          onConfirmPersona={() => setShowPersonaSettings(false)}
          customPersonas={[]}
          onCreatePersona={() => {}}
          onDeletePersona={() => {}}
        />
      )}
    </div>
  );
}