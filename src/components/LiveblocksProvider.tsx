'use client';

import { RoomProvider } from '@/lib/liveblocks';
import { ClientSideSuspense } from '@liveblocks/react';
import { ReactNode } from 'react';

export function LiveblocksRoomProvider({
  children,
  roomId,
  fallback,
}: {
  children: ReactNode;
  roomId: string;
  fallback?: ReactNode;
}) {
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        selectedElement: null,
        user: {
          id: '',
          name: '',
          email: '',
          color: '',
        },
      }}
    >
      <ClientSideSuspense fallback={fallback || <div>Loading...</div>}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}