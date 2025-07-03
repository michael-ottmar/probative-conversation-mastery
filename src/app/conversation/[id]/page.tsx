'use client';

import { LiveblocksRoomProvider } from '@/components/LiveblocksProvider';
import { ConversationContent } from '@/components/ConversationContent';

export default function ConversationBuilder({ params }: { params: { id: string } }) {
  return (
    <LiveblocksRoomProvider 
      roomId={params.id}
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading collaborative session...</div>
        </div>
      }
    >
      <ConversationContent params={params} />
    </LiveblocksRoomProvider>
  );
}