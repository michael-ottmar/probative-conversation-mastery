'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { useStorage, useOthers } from '@/lib/liveblocks';

interface PracticeButtonProps {
  conversationId: string;
  teamId: string;
}

export function PracticeButton({ conversationId, teamId }: PracticeButtonProps) {
  const practiceSession = useStorage((root) => root.practiceSession);
  const others = useOthers();
  const [showTypingAnimation, setShowTypingAnimation] = useState(false);
  
  const isActive = practiceSession?.isActive || false;
  const typingUsers = others.filter((user) => user.presence.isTypingInPractice);
  
  // Animate typing indicator
  useEffect(() => {
    if (typingUsers.length > 0) {
      setShowTypingAnimation(true);
      const timer = setTimeout(() => setShowTypingAnimation(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [typingUsers.length]);
  
  if (isActive) {
    return (
      <Link
        href={`/conversation/${conversationId}/practice?team=${teamId}`}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 relative"
      >
        <div className="relative">
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-green-500 rounded-full" />
        </div>
        <span>Join conversation</span>
        {showTypingAnimation && (
          <span className="inline-flex gap-0.5">
            <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        )}
      </Link>
    );
  }
  
  return (
    <Link
      href={`/conversation/${conversationId}/practice?team=${teamId}`}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Play className="h-5 w-5" />
      Practice Conversations
    </Link>
  );
}