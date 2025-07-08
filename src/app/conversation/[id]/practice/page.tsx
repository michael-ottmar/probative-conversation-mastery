'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LiveblocksRoomProvider } from '@/components/LiveblocksProvider';
import { CollaborativePractice } from '@/components/CollaborativePractice';

export default function PracticeMode({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documentName, setDocumentName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchDocumentName();
    }
  }, [status, params.id]);
  
  const fetchDocumentName = async () => {
    try {
      const response = await fetch(`/api/documents/${params.id}`);
      if (response.ok) {
        const doc = await response.json();
        setDocumentName(doc.name);
      } else if (response.status === 404) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  return (
    <LiveblocksRoomProvider roomId={`practice-${params.id}`}>
      <CollaborativePractice conversationId={params.id} documentName={documentName} />
    </LiveblocksRoomProvider>
  );
}