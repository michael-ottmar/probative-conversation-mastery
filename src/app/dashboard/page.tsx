'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CompanyUmbrellaStructure } from '@/components/CompanyUmbrellaStructure';
import { Organization, Team, ProbativeConversation } from '@/lib/types';
import { Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Mock data - replace with actual data fetching
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

const mockConversations: ProbativeConversation[] = [
  {
    id: '1',
    organizationId: '1',
    teams: ['umbrella', 'creative', 'managed', 'orchestration'],
    objective: 'To prove your expertise to the client and move, in their mind, from vendor to expert',
    todos: [],
    practiceSettings: {
      focusArea: 'Company Holistic Conversation',
      clientType: 'Enterprise B2B',
      clientPersona: {
        id: '1',
        name: 'Enterprise B2B',
        industry: 'Technology',
        companySize: '5000+',
        currentMindset: 'vendor-seeking',
        sophisticationLevel: 'high',
        typicalObjections: ['Price concerns', 'Integration complexity'],
        valueDrivers: ['Innovation', 'Scalability', 'Risk mitigation']
      },
      conversationContext: 'Initial probative conversation'
    },
    organizationalNarrative: {
      id: '1',
      umbrellaValue: 'Integrated transformation expertise',
      teamSynergies: [],
      unifiedThesis: 'True transformation requires coordinated expertise across strategy, operations, and brand'
    },
    sharedWith: [],
    createdBy: 'user@example.com',
    createdAt: new Date()
  }
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedTeamId, setSelectedTeamId] = useState<string>('umbrella');

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Probative Conversation Mastery
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session?.user?.email}</span>
              <button 
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
          </h2>
          <p className="text-gray-600">
            Continue mastering the probative conversation across your organization
          </p>
        </div>

        <CompanyUmbrellaStructure
          organization={mockOrganization}
          teams={mockTeams}
          selectedTeamId={selectedTeamId}
          onTeamSelect={setSelectedTeamId}
          onAddTeam={() => console.log('Add team')}
        />

        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Active Conversations
            </h3>
            <div className="space-y-3">
              {mockConversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/conversation/${conv.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {conv.practiceSettings.focusArea}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {conv.teams.length} teams participating
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              ))}
              <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Conversation
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Organizational Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Overall Expertise Articulation</span>
                  <span className="font-medium">55%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '55%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Cross-Team Coherence</span>
                  <span className="font-medium">42%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Practice Sessions Completed</span>
                  <span className="font-medium">18</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}