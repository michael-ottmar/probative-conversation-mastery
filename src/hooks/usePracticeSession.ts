'use client';

import { useEffect, useCallback } from 'react';
import { 
  useStorage, 
  useMutation, 
  useOthers, 
  useUpdateMyPresence,
  useBroadcastEvent,
  useEventListener,
  useSelf
} from '@/lib/liveblocks';
import { Message, ClientPersona, CoachingNote } from '@/lib/types';

interface PracticeMessage {
  id: string;
  role: 'user' | 'client';
  content: string;
  userName?: string;
  userId?: string;
  clientName?: string;
  timestamp: number;
}

export function usePracticeSession(documentId: string) {
  const practiceSession = useStorage((root) => root.practiceSession);
  const updateMyPresence = useUpdateMyPresence();
  const broadcast = useBroadcastEvent();
  const others = useOthers();
  const self = useSelf();
  
  // Get typing users
  const typingUsers = others
    .filter((user) => user.presence.isTypingInPractice)
    .map((user) => user.presence.user.name)
    .filter(Boolean);

  // Initialize or join practice session
  const initializeSession = useMutation(
    ({ storage, self }) => {
      const currentSession = storage.get('practiceSession');
      
      if (!currentSession || !currentSession.isActive) {
        // Create new session
        storage.set('practiceSession', {
          messages: [],
          clientPersona: null,
          coachingNotes: [],
          expertiseScore: 0,
          isActive: true,
          participants: [{
            userId: self.presence.user.id,
            userName: self.presence.user.name || 'User',
            userEmail: self.presence.user.email,
            joinedAt: Date.now()
          }]
        });
      } else {
        // Join existing session
        const participants = currentSession.participants;
        const alreadyJoined = participants.some(p => p.userId === self.presence.user.id);
        
        if (!alreadyJoined) {
          participants.push({
            userId: self.presence.user.id,
            userName: self.presence.user.name || 'User',
            userEmail: self.presence.user.email,
            joinedAt: Date.now()
          });
        }
      }
      
      // Broadcast join event
      broadcast({
        type: 'PRACTICE_USER_JOINED',
        userName: self.presence.user.name || 'User'
      });
    },
    []
  );

  // Add message to session
  const addMessage = useMutation(
    ({ storage }, message: Omit<PracticeMessage, 'id' | 'timestamp'>) => {
      const session = storage.get('practiceSession');
      if (!session) return;
      
      const newMessage: PracticeMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
      };
      
      session.messages.push(newMessage);
    },
    []
  );

  // Update client persona
  const updateClientPersona = useMutation(
    ({ storage }, persona: ClientPersona) => {
      const session = storage.get('practiceSession');
      if (!session) return;
      
      session.clientPersona = persona;
    },
    []
  );

  // Add coaching note
  const addCoachingNote = useMutation(
    ({ storage }, note: Omit<CoachingNote, 'id'> & { messageId: string }) => {
      const session = storage.get('practiceSession');
      if (!session) return;
      
      session.coachingNotes.push({
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        messageId: note.messageId,
        type: note.type,
        content: note.content,
        timestamp: Date.now()
      });
    },
    []
  );

  // Update expertise score
  const updateExpertiseScore = useMutation(
    ({ storage }, score: number) => {
      const session = storage.get('practiceSession');
      if (!session) return;
      
      session.expertiseScore = score;
    },
    []
  );

  // Leave session
  const leaveSession = useMutation(
    ({ storage, self }) => {
      const session = storage.get('practiceSession');
      if (!session) return;
      
      // Remove from participants
      session.participants = session.participants.filter(
        p => p.userId !== self.presence.user.id
      );
      
      // If no participants left, mark session as inactive
      if (session.participants.length === 0) {
        session.isActive = false;
      }
      
      // Broadcast leave event
      broadcast({
        type: 'PRACTICE_USER_LEFT',
        userName: self.presence.user.name || 'User'
      });
    },
    []
  );

  // Set typing status
  const setTyping = useCallback((isTyping: boolean) => {
    updateMyPresence({ isTypingInPractice: isTyping });
    
    if (self) {
      broadcast({
        type: 'PRACTICE_TYPING',
        userName: self.presence.user.name || 'User',
        isTyping
      });
    }
  }, [updateMyPresence, broadcast, self]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (practiceSession?.isActive) {
        leaveSession();
      }
    };
  }, []);

  return {
    practiceSession,
    initializeSession,
    addMessage,
    updateClientPersona,
    addCoachingNote,
    updateExpertiseScore,
    leaveSession,
    setTyping,
    typingUsers,
    isSessionActive: practiceSession?.isActive || false,
    participants: practiceSession?.participants || [],
    messages: practiceSession?.messages || [],
    clientPersona: practiceSession?.clientPersona,
    coachingNotes: practiceSession?.coachingNotes || [],
    expertiseScore: practiceSession?.expertiseScore || 0
  };
}