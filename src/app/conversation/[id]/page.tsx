'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CompanyStructure } from '@/components/CompanyStructure';
import { TodoItem } from '@/components/TodoItem';
import { TeamDetails } from '@/components/TeamDetails';
import { Organization, Team, ConversationTodo, AIIdea } from '@/lib/types';
import { ArrowLeft, Play } from 'lucide-react';
import Link from 'next/link';

// Default teams with proper leaders format
const createDefaultTeams = (orgId: string): Team[] => [
  {
    id: 'team-1',
    organizationId: orgId,
    name: 'Team 1',
    leaders: 'Leadership Team',
    description: '',
    color: '#1E40AF',
    progress: 0,
    isRoot: true,
  },
  {
    id: 'team-2',
    organizationId: orgId,
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
    organizationId: orgId,
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
    organizationId: orgId,
    name: 'Team 4',
    leaders: '',
    description: '',
    color: '#8B5CF6',
    progress: 0,
    isRoot: false,
    parentId: 'team-1',
  },
];

// Todo templates
const todoTemplates: Omit<ConversationTodo, 'id' | 'conversationId' | 'teamId' | 'lastModified'>[] = [
  {
    type: 'focus',
    title: 'Choose a Focus',
    content: '',
    status: 'not-started',
  },
  {
    type: 'expertise',
    title: 'Articulate a Claim of Expertise',
    content: '',
    status: 'not-started',
  },
  {
    type: 'perspective',
    title: 'Provide Your Point of View',
    content: '',
    status: 'not-started',
  },
  {
    type: 'thesis',
    title: 'Publish Your Thesis',
    content: '',
    status: 'not-started',
  },
  {
    type: 'contentMap',
    title: 'Develop Content Map',
    content: '',
    status: 'not-started',
  },
  {
    type: 'leadGen',
    title: 'Develop Lead Gen Plan',
    content: '',
    status: 'not-started',
  },
];

export default function ConversationBuilder({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [todos, setTodos] = useState<ConversationTodo[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('team-1');
  const [documentName, setDocumentName] = useState('Untitled Document');
  const [isEditingDocumentName, setIsEditingDocumentName] = useState(false);
  const [editedDocumentName, setEditedDocumentName] = useState('Untitled Document');

  // Initialize data
  useEffect(() => {
    const initialTeams = createDefaultTeams('1');
    setTeams(initialTeams);
    
    // Create todos for each team
    const initialTodos: ConversationTodo[] = [];
    initialTeams.forEach(team => {
      todoTemplates.forEach((template, index) => {
        initialTodos.push({
          ...template,
          id: `${team.id}-todo-${index}`,
          conversationId: params.id,
          teamId: team.id,
          lastModified: new Date(),
        });
      });
    });
    setTodos(initialTodos);
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

  const handleTeamUpdate = (updatedTeam: Team) => {
    setTeams(teams.map(t => t.id === updatedTeam.id ? updatedTeam : t));
  };

  const handleTeamDelete = (teamId: string) => {
    setTeams(teams.filter(t => t.id !== teamId));
    setTodos(todos.filter(t => t.teamId !== teamId));
    if (selectedTeamId === teamId) {
      setSelectedTeamId(teams.find(t => t.isRoot)?.id || teams[0]?.id);
    }
  };

  const handleTeamAdd = () => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      organizationId: '1',
      name: 'New Team',
      leaders: '',
      description: '',
      color: ['#EC4899', '#3B82F6', '#EF4444', '#14B8A6'][teams.length % 4],
      progress: 0,
      isRoot: false,
      parentId: teams.find(t => t.isRoot)?.id || 'team-1',
    };
    setTeams([...teams, newTeam]);
    
    // Create todos for new team
    const newTodos = todoTemplates.map((template, index) => ({
      ...template,
      id: `${newTeam.id}-todo-${index}`,
      conversationId: params.id,
      teamId: newTeam.id,
      lastModified: new Date(),
    }));
    setTodos([...todos, ...newTodos]);
  };

  const handleTodoUpdate = (updatedTodo: ConversationTodo) => {
    setTodos(todos.map(t => t.id === updatedTodo.id ? updatedTodo : t));
    
    // Update team progress
    const teamTodos = todos.filter(t => t.teamId === updatedTodo.teamId);
    const completedCount = teamTodos.filter(t => {
      const status = t.id === updatedTodo.id ? updatedTodo.status : t.status;
      return status === 'complete' || status === 'review';
    }).length;
    const progress = Math.round((completedCount / teamTodos.length) * 100);
    
    setTeams(teams.map(team => 
      team.id === updatedTodo.teamId ? { ...team, progress } : team
    ));
  };

  const handleGenerateIdea = async (todo: ConversationTodo, team: Team) => {
    // Call AI API
    try {
      const response = await fetch('/api/ai/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          todoType: todo.type,
          todoTitle: todo.title,
          teamName: team.name,
          teamDescription: team.description,
          teamLeaders: team.leaders,
          existingContent: todo.content,
        }),
      });

      if (response.ok) {
        const { idea } = await response.json();
        const aiIdea: AIIdea = {
          id: Date.now().toString(),
          content: idea,
          generatedAt: new Date(),
          context: {
            teamName: team.name,
            teamDescription: team.description,
            leaders: team.leaders,
            todoType: todo.type,
          },
        };
        
        handleTodoUpdate({ ...todo, aiIdea });
      }
    } catch (error) {
      console.error('Failed to generate idea:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                {isEditingDocumentName ? (
                  <input
                    type="text"
                    value={editedDocumentName}
                    onChange={(e) => setEditedDocumentName(e.target.value)}
                    onBlur={() => {
                      if (editedDocumentName.trim()) {
                        setDocumentName(editedDocumentName.trim());
                      } else {
                        setEditedDocumentName(documentName);
                      }
                      setIsEditingDocumentName(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editedDocumentName.trim()) {
                          setDocumentName(editedDocumentName.trim());
                        }
                        setIsEditingDocumentName(false);
                      }
                      if (e.key === 'Escape') {
                        setEditedDocumentName(documentName);
                        setIsEditingDocumentName(false);
                      }
                    }}
                    className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 outline-none px-1"
                    autoFocus
                  />
                ) : (
                  <h1 
                    className="text-2xl font-bold text-gray-900 cursor-text hover:bg-gray-100 px-1 -mx-1 rounded"
                    onClick={() => {
                      setIsEditingDocumentName(true);
                      setEditedDocumentName(documentName);
                    }}
                  >
                    {documentName}
                  </h1>
                )}
                <p className="text-sm text-gray-600">Real-time collaborative team training</p>
              </div>
            </div>
            <Link
              href={`/conversation/${params.id}/practice?team=${selectedTeamId}`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="h-5 w-5" />
              Practice Conversations
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <CompanyStructure
          teams={teams}
          selectedTeamId={selectedTeamId}
          onTeamSelect={setSelectedTeamId}
          onTeamUpdate={handleTeamUpdate}
          onTeamDelete={handleTeamDelete}
          onTeamAdd={handleTeamAdd}
        />

        {selectedTeam && (
          <TeamDetails
            team={selectedTeam}
            onUpdate={handleTeamUpdate}
          />
        )}

        {selectedTeam && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Probative Conversation To-Do's
            </h2>
            <div className="space-y-6">
              {teamTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  team={selectedTeam}
                  onUpdate={handleTodoUpdate}
                  onGenerateIdea={handleGenerateIdea}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}