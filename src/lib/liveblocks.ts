import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';

const client = createClient({
  authEndpoint: '/api/liveblocks-auth',
  throttle: 100,
});

// Presence represents the properties that exist on every user in the Room
// and that will automatically be kept in sync. Accessible through the
// `user.presence` property. Must be JSON-serializable.
type Presence = {
  cursor: { x: number; y: number } | null;
  selectedElement: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    color: string;
  };
  isTypingInPractice?: boolean;
};

// Storage represents the shared document state
type Storage = {
  practiceSession?: {
    messages: Array<{
      id: string;
      role: 'user' | 'client';
      content: string;
      userName?: string;
      userId?: string;
      timestamp: number;
    }>;
    clientPersona: any; // ClientPersona type
    coachingNotes: Array<{
      id: string;
      messageId: string;
      type: 'strength' | 'improvement' | 'insight';
      content: string;
      timestamp: number;
    }>;
    expertiseScore: number;
    isActive: boolean;
    participants: Array<{
      userId: string;
      userName: string;
      userEmail?: string;
      joinedAt: number;
    }>;
  };
};

// Optionally, UserMeta represents static/readonly metadata on each user, as
// provided by your own custom auth back end (if used). Useful for data that
// will not change during a session, like a user's name or avatar.
type UserMeta = {
  id?: string;
  info?: {
    name?: string;
    email?: string;
    color?: string;
  };
};

// Custom events broadcast and listened to in this room
type RoomEvent = 
  | {
      type: 'NOTIFICATION';
      message: string;
    }
  | {
      type: 'PRACTICE_TYPING';
      userName: string;
      isTyping: boolean;
    }
  | {
      type: 'PRACTICE_USER_JOINED';
      userName: string;
    }
  | {
      type: 'PRACTICE_USER_LEFT';
      userName: string;
    };

// Optionally, when using Comments, ThreadMetadata represents metadata on
// each thread. Can only contain booleans, strings, and numbers.
export type ThreadMetadata = {
  resolved: boolean;
  time: number;
};

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersListener,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useObject,
    useMap,
    useList,
    useBatch,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStatus,
    useLostConnectionListener,
    useThreads,
    useCreateThread,
    useEditThreadMetadata,
    useCreateComment,
    useEditComment,
    useDeleteComment,
    useAddReaction,
    useRemoveReaction,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(client);