'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CompanyStructure } from '@/components/CompanyStructure';
import { TodoItem } from '@/components/TodoItem';
import { TeamDetails } from '@/components/TeamDetails';
import { PracticeButton } from '@/components/PracticeButton';
import { Organization, Team, ConversationTodo, AIIdea } from '@/lib/types';
import { ArrowLeft, Play, Share2 } from 'lucide-react';
import Link from 'next/link';
import { ShareModal } from '@/components/ShareModal';
import { getAvatarColor } from '@/lib/avatar';
import { useOthers, useSelf } from '@/lib/liveblocks';
import { LiveCursors } from '@/components/LiveCursors';

export function ConversationContent({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [todos, setTodos] = useState<ConversationTodo[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [documentName, setDocumentName] = useState('Untitled Document');
  const [isEditingDocumentName, setIsEditingDocumentName] = useState(false);
  const [editedDocumentName, setEditedDocumentName] = useState('Untitled Document');
  const [isLoading, setIsLoading] = useState(true);
  const [hasEditAccess, setHasEditAccess] = useState(true);
  const [documentOwnerId, setDocumentOwnerId] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState<Array<{id: string; name?: string; email: string; color?: string}>>([]);

  // Liveblocks presence
  const others = useOthers();
  const currentUser = useSelf();

  // Get active users from Liveblocks presence
  const liveActiveUsers = [
    ...(currentUser?.presence?.user ? [{
      id: currentUser.presence.user.id,
      name: currentUser.presence.user.name,
      email: currentUser.presence.user.email,
      color: currentUser.presence.user.color,
    }] : []),
    ...others.map(other => ({
      id: other.presence.user?.id || '',
      name: other.presence.user?.name || '',
      email: other.presence.user?.email || '',
      color: other.presence.user?.color || getAvatarColor(other.presence.user?.email || ''),
    })).filter(user => user.id)
  ];

  // Load document data from API
  useEffect(() => {
    if (status === 'authenticated') {
      fetchDocument();
    }
  }, [status, params.id]);

  const fetchDocument = async () => {
    try {
      let response = await fetch(`/api/documents/${params.id}`);
      
      // If we get a 404, it might be because we don't have access yet
      // Try to get access via share link
      if (response.status === 404) {
        const accessResponse = await fetch(`/api/documents/${params.id}/access`, {
          method: 'POST'
        });
        
        if (accessResponse.ok) {
          // Try fetching the document again
          response = await fetch(`/api/documents/${params.id}`);
        }
      }
      
      if (response.ok) {
        const doc = await response.json();
        setDocumentName(doc.name);
        setEditedDocumentName(doc.name);
        setDocumentOwnerId(doc.ownerId);
        
        // Transform teams to match our interface
        const transformedTeams = doc.teams.map((team: any) => ({
          ...team,
          organizationId: doc.id,
          progress: calculateTeamProgress(team.todos)
        }));
        setTeams(transformedTeams);
        
        // Transform todos to match our interface
        const allTodos = doc.teams.flatMap((team: any) => 
          team.todos.map((todo: any) => ({
            ...todo,
            conversationId: doc.id,
            lastModified: new Date(todo.updatedAt)
          }))
        );
        setTodos(allTodos);
        
        // Set initial selected team
        const rootTeam = transformedTeams.find((t: Team) => t.isRoot);
        if (rootTeam) {
          setSelectedTeamId(rootTeam.id);
        }
        
        // Check edit access based on user ID
        const currentUser = await getCurrentUser();
        const isOwner = doc.ownerId === currentUser?.id;
        const hasEditShare = doc.shares?.some((share: any) => 
          share.userId === currentUser?.id && share.role === 'editor'
        );
        setHasEditAccess(isOwner || hasEditShare);
      } else if (response.status === 404) {
        // Document doesn't exist or access denied
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUser = async () => {
    if (!session?.user?.email) return null;
    try {
      const response = await fetch('/api/user/current');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
    return null;
  };

  const calculateTeamProgress = (todos: any[]) => {
    const completedCount = todos.filter(t => 
      t.status === 'complete' || t.status === 'review'
    ).length;
    return todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;
  };

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    const url = new URL('/', window.location.origin);
    url.searchParams.set('callbackUrl', `/conversation/${params.id}`);
    router.push(url.toString());
    return null;
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const teamTodos = todos.filter(t => t.teamId === selectedTeamId);

  const handleTeamUpdate = async (updatedTeam: Team) => {
    if (!hasEditAccess) return;
    
    // Optimistically update UI
    setTeams(teams.map(t => t.id === updatedTeam.id ? updatedTeam : t));
    
    // Persist to database
    try {
      await fetch(`/api/teams/${updatedTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedTeam.name,
          leaders: updatedTeam.leaders,
          description: updatedTeam.description,
          color: updatedTeam.color
        })
      });
    } catch (error) {
      console.error('Error updating team:', error);
      // Could revert on error
    }
  };

  const handleTeamDelete = async (teamId: string) => {
    if (!hasEditAccess) return;
    
    // Optimistically update UI
    setTeams(teams.filter(t => t.id !== teamId));
    setTodos(todos.filter(t => t.teamId !== teamId));
    if (selectedTeamId === teamId) {
      setSelectedTeamId(teams.find(t => t.isRoot)?.id || teams[0]?.id);
    }
    
    // Persist to database
    try {
      await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const handleTeamAdd = async () => {
    if (!hasEditAccess) return;
    
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: params.id,
          name: 'New Team',
          color: ['#EC4899', '#3B82F6', '#EF4444', '#14B8A6'][teams.length % 4],
          parentId: teams.find(t => t.isRoot)?.id
        })
      });
      
      if (response.ok) {
        const newTeam = await response.json();
        setTeams([...teams, {
          ...newTeam,
          organizationId: params.id,
          progress: 0
        }]);
        
        // Add todos to state
        const newTodos = newTeam.todos.map((todo: any) => ({
          ...todo,
          conversationId: params.id,
          lastModified: new Date(todo.updatedAt)
        }));
        setTodos([...todos, ...newTodos]);
      }
    } catch (error) {
      console.error('Error adding team:', error);
    }
  };

  const handleTodoUpdate = async (updatedTodo: ConversationTodo) => {
    if (!hasEditAccess) return;
    
    // Optimistically update UI
    setTodos(todos.map(t => t.id === updatedTodo.id ? updatedTodo : t));
    
    // Update team progress locally
    const teamTodos = todos.filter(t => t.teamId === updatedTodo.teamId);
    const completedCount = teamTodos.filter(t => {
      const status = t.id === updatedTodo.id ? updatedTodo.status : t.status;
      return status === 'complete' || status === 'review';
    }).length;
    const progress = Math.round((completedCount / teamTodos.length) * 100);
    
    setTeams(teams.map(team => 
      team.id === updatedTodo.teamId ? { ...team, progress } : team
    ));
    
    // Persist to database
    try {
      await fetch(`/api/todos/${updatedTodo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: updatedTodo.content,
          status: updatedTodo.status,
          aiIdea: updatedTodo.aiIdea
        })
      });
    } catch (error) {
      console.error('Error updating todo:', error);
    }
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

  const handleDocumentNameSave = async (newName: string) => {
    if (!hasEditAccess) return;
    
    try {
      await fetch(`/api/documents/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
    } catch (error) {
      console.error('Error updating document name:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Live cursors overlay */}
      <LiveCursors />
      
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
                {isEditingDocumentName && hasEditAccess ? (
                  <input
                    type="text"
                    value={editedDocumentName}
                    onChange={(e) => setEditedDocumentName(e.target.value)}
                    onBlur={() => {
                      if (editedDocumentName.trim()) {
                        const newName = editedDocumentName.trim();
                        setDocumentName(newName);
                        handleDocumentNameSave(newName);
                      } else {
                        setEditedDocumentName(documentName);
                      }
                      setIsEditingDocumentName(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editedDocumentName.trim()) {
                          const newName = editedDocumentName.trim();
                          setDocumentName(newName);
                          handleDocumentNameSave(newName);
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
                    className={`text-2xl font-bold text-gray-900 ${hasEditAccess ? 'cursor-text hover:bg-gray-100' : ''} px-1 -mx-1 rounded`}
                    onClick={() => {
                      if (hasEditAccess) {
                        setIsEditingDocumentName(true);
                        setEditedDocumentName(documentName);
                      }
                    }}
                  >
                    {documentName}
                  </h1>
                )}
                <p className="text-sm text-gray-600">
                  Real-time collaborative team training
                  {!hasEditAccess && ' (View Only)'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Active Users from Liveblocks */}
              {liveActiveUsers.length > 0 && (
                <div className="flex -space-x-2">
                  {liveActiveUsers.slice(0, 3).map((user) => (
                    <div
                      key={user.id}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ring-2 ring-white"
                      style={{ backgroundColor: user.color || getAvatarColor(user.email) }}
                      title={user.name || user.email}
                    >
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {liveActiveUsers.length > 3 && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium bg-gray-300 text-gray-700 ring-2 ring-white"
                      title={`${liveActiveUsers.length - 3} more users`}
                    >
                      +{liveActiveUsers.length - 3}
                    </div>
                  )}
                </div>
              )}
              
              {/* Share Button */}
              {hasEditAccess && (
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              )}
              
              {/* Practice Button */}
              <PracticeButton 
                conversationId={params.id} 
                teamId={selectedTeamId} 
              />
            </div>
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
            readOnly={!hasEditAccess}
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
      
      {/* Share Modal */}
      {shareModalOpen && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          documentId={params.id}
          documentName={documentName}
        />
      )}
    </div>
  );
}