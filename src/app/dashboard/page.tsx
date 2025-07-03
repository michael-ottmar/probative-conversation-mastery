'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { DocumentCard } from '@/components/DocumentCard';
import { ShareModal } from '@/components/ShareModal';
import { getAvatarColor } from '@/lib/avatar';

interface Document {
  id: string;
  name: string;
  practiceCount: number;
  teamCount: number;
  lastEdited: Date | string;
  activeUsers: Array<{
    id: string;
    name?: string;
    email: string;
    color: string;
  }>;
}

// Mock data - will be replaced with real data
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Q4 Enterprise Sales Strategy',
    practiceCount: 22,
    teamCount: 4,
    lastEdited: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    activeUsers: [
      { id: '1', name: 'Sarah Johnson', email: 'sarah@acme.com', color: getAvatarColor('sarah@acme.com') },
      { id: '2', name: 'John Walsh', email: 'john@acme.com', color: getAvatarColor('john@acme.com') },
      { id: '3', email: 'mike@acme.com', color: getAvatarColor('mike@acme.com') },
    ],
  },
  {
    id: '2',
    name: 'Healthcare Vertical Positioning',
    practiceCount: 16,
    teamCount: 5,
    lastEdited: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    activeUsers: [
      { id: '3', email: 'mike@acme.com', color: getAvatarColor('mike@acme.com') },
    ],
  },
  {
    id: '3',
    name: 'Digital Transformation Pitch',
    practiceCount: 3,
    teamCount: 6,
    lastEdited: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
    activeUsers: [],
  },
  {
    id: '4',
    name: 'Financial Services Expertise',
    practiceCount: 13,
    teamCount: 4,
    lastEdited: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    activeUsers: [
      { id: '4', name: 'Lisa Park', email: 'lisa@acme.com', color: getAvatarColor('lisa@acme.com') },
    ],
  },
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  // Fetch documents on component mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchDocuments();
    }
  }, [status]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleCreateDocument = async () => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Untitled Document' })
      });
      
      if (response.ok) {
        const newDoc = await response.json();
        router.push(`/conversation/${newDoc.id}`);
      }
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const handleShare = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      setSelectedDocument(doc);
      setShareModalOpen(true);
    }
  };

  const handleDelete = async (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await fetch(`/api/documents/${docId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setDocuments(documents.filter(d => d.id !== docId));
        }
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleRename = async (docId: string, newName: string) => {
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      
      if (response.ok) {
        setDocuments(documents.map(doc => 
          doc.id === docId ? { ...doc, name: newName } : doc
        ));
      }
    } catch (error) {
      console.error('Error renaming document:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Probative Conversation Mastery
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleCreateDocument}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                New Document
              </button>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: getAvatarColor(session?.user?.email || '') }}
                >
                  {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
                </div>
              </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
          </h2>
          <p className="text-gray-600">
            Continue mastering the probative conversation across your organization
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              {...doc}
              onShare={handleShare}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          ))}
        </div>

        {documents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No documents yet</p>
            <button
              onClick={handleCreateDocument}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create your first document
            </button>
          </div>
        )}
      </main>

      {selectedDocument && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedDocument(null);
          }}
          documentName={selectedDocument.name}
          documentId={selectedDocument.id}
        />
      )}
    </div>
  );
}