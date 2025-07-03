'use client';

import { useOthers, useUpdateMyPresence } from '@/lib/liveblocks';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getAvatarColor } from '@/lib/avatar';

export function LiveCursors() {
  const { data: session } = useSession();
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();

  useEffect(() => {
    if (session?.user) {
      updateMyPresence({
        user: {
          id: session.user.email || '',
          name: session.user.name || session.user.email?.split('@')[0] || 'Anonymous',
          email: session.user.email || '',
          color: getAvatarColor(session.user.email || ''),
        },
      });
    }
  }, [session, updateMyPresence]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      updateMyPresence({
        cursor: {
          x: Math.round(event.clientX),
          y: Math.round(event.clientY),
        },
      });
    };

    const handlePointerLeave = () => {
      updateMyPresence({
        cursor: null,
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [updateMyPresence]);

  return (
    <>
      {others.map(({ connectionId, presence }) => {
        if (!presence.cursor || !presence.user) {
          return null;
        }

        return (
          <div
            key={connectionId}
            className="pointer-events-none fixed z-50"
            style={{
              left: presence.cursor.x,
              top: presence.cursor.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Cursor */}
            <svg
              className="relative"
              width="24"
              height="36"
              viewBox="0 0 24 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                fill={presence.user.color}
                stroke={presence.user.color}
              />
            </svg>

            {/* Name label */}
            <div
              className="absolute left-5 top-5 px-2 py-1 rounded-md text-xs text-white font-medium whitespace-nowrap"
              style={{
                backgroundColor: presence.user.color,
              }}
            >
              {presence.user.name}
            </div>
          </div>
        );
      })}
    </>
  );
}