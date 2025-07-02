'use client';

import { useState } from 'react';
import { CompanyUmbrellaStructure } from '@/components/CompanyUmbrellaStructure';
import { ProbativeConversationTodos } from '@/components/ProbativeConversationTodos';
import { Organization, Team, ConversationTodo } from '@/lib/types';
import { ArrowLeft, Play, Users } from 'lucide-react';
import Link from 'next/link';

// Mock data - same as dashboard
const mockOrganization: Organization = {
  id: '1',
  name: 'Acme Consulting',
  description: 'Strategic transformation experts for enterprise organizations',
  industry: 'Professional Services',
  createdAt: new Date()
};

const mockTeams: Team[] = [
  {
    id: 'umbrella',
    organizationId: '1',
    name: 'Company Umbrella',
    leaders: ['John Walsh', 'Jane Blackstone'],
    description: 'Holistic business transformation through integrated expertise',
    color: '#1E40AF',
    progress: 65,
    isRoot: true,
    expertiseDomain: 'Enterprise Transformation'
  },
  {
    id: 'creative',
    organizationId: '1',
    name: 'Creative Studio',
    leaders: ['Sarah Chen'],
    color: '#F59E0B',
    progress: 80,
    isRoot: false,
    parentId: 'umbrella',
    expertiseDomain: 'Brand Strategy & Design'
  },
  {
    id: 'managed',
    organizationId: '1',
    name: 'Managed Services',
    leaders: ['Mike Ross'],
    color: '#10B981',
    progress: 45,
    isRoot: false,
    parentId: 'umbrella',
    expertiseDomain: 'Operational Excellence'
  },
  {
    id: 'orchestration',
    organizationId: '1',
    name: 'Orchestration & Discovery',
    leaders: ['Lisa Park'],
    color: '#8B5CF6',
    progress: 30,
    isRoot: false,
    parentId: 'umbrella',
    expertiseDomain: 'Strategic Planning'
  }
];

const mockTodos: ConversationTodo[] = [
  {
    id: '1',
    conversationId: '1',
    teamId: 'umbrella',
    type: 'focus',
    title: 'Choose a Focus',
    content: 'Digital transformation readiness for enterprise organizations',
    status: 'complete',
    lastModified: new Date()
  },
  {
    id: '2',
    conversationId: '1',
    teamId: 'umbrella',
    type: 'expertise',
    title: 'Articulate a Claim of Expertise',
    content: 'We see transformation differently - as a coordinated effort across strategy, operations, and brand',
    status: 'complete',
    lastModified: new Date()
  },
  {
    id: '3',
    conversationId: '1',
    teamId: 'umbrella',
    type: 'perspective',
    title: 'Add a Perspective',
    status: 'in-progress',
    lastModified: new Date()
  },
  {
    id: '4',
    conversationId: '1',
    teamId: 'umbrella',
    type: 'thesis',
    title: 'Publish Thesis',
    status: 'not-started',
    lastModified: new Date()
  },
  {
    id: '5',
    conversationId: '1',
    teamId: 'umbrella',
    type: 'contentMap',
    title: 'Develop Content Map',
    status: 'not-started',
    lastModified: new Date()
  },
  {
    id: '6',
    conversationId: '1',
    teamId: 'umbrella',
    type: 'leadGen',
    title: 'Develop Lead Gen Plan',
    status: 'not-started',
    lastModified: new Date()
  }
];

export default function ConversationBuilder({ params }: { params: { id: string } }) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('umbrella');
  const selectedTeam = mockTeams.find(t => t.id === selectedTeamId);

  const handleTodoClick = (todo: ConversationTodo) => {
    console.log('Todo clicked:', todo);
    // Show todo workspace modal/drawer
  };

  const handleGenerateIdeas = (todoType: string) => {
    console.log('Generate ideas for:', todoType);
    // Call AI API to generate ideas
  };

  const handleStatusChange = (todoId: string, status: string) => {
    console.log('Status change:', todoId, status);
    // Update todo status
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Probative Conversation Builder
              </h1>
            </div>
            <Link
              href={`/conversation/${params.id}/practice`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="h-4 w-4" />
              Practice Mode
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Company Structure */}
        <CompanyUmbrellaStructure
          organization={mockOrganization}
          teams={mockTeams}
          selectedTeamId={selectedTeamId}
          onTeamSelect={setSelectedTeamId}
          onAddTeam={() => console.log('Add team')}
        />

        {/* Selected Team Details */}
        {selectedTeam && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedTeam.name}
                </h2>
                <p className="text-gray-600 mt-1">{selectedTeam.expertiseDomain}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    {selectedTeam.leaders.join(', ')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {selectedTeam.progress}%
                </div>
                <p className="text-sm text-gray-600">Complete</p>
              </div>
            </div>

            {selectedTeam.isRoot && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Company Umbrella Responsibility:</strong> Articulate the expertise of all teams and demonstrate how our integrated approach creates unique value for enterprise clients.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Probative Conversation Todos */}
        <div className="mt-8">
          <ProbativeConversationTodos
            todos={mockTodos.filter(t => t.teamId === selectedTeamId)}
            onTodoClick={handleTodoClick}
            onGenerateIdeas={handleGenerateIdeas}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Cross-Team Integration */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cross-Team Integration
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Team Synergies</h4>
              <p className="text-sm text-gray-600">
                Document how {selectedTeam?.name} works with other teams to deliver comprehensive value
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Unified Narrative</h4>
              <p className="text-sm text-gray-600">
                Practice articulating how all teams contribute to the organizational expertise
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}