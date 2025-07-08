'use client';

import { getAvatarColor, getInitials } from '@/lib/avatar';

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({ name, email, size = 'md', className = '' }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };
  
  const sizePixels = {
    sm: '24px',
    md: '32px',
    lg: '40px'
  };

  const displayInitials = getInitials(name || undefined, email || undefined);
  const backgroundColor = getAvatarColor(email || name || 'default');

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 ${sizeClasses[size]} ${className}`}
      style={{ 
        backgroundColor,
        borderRadius: '9999px', // Ensure circular shape with inline style as fallback
        minWidth: sizePixels[size],
        minHeight: sizePixels[size],
        maxWidth: sizePixels[size],
        maxHeight: sizePixels[size]
      }}
      title={name || email || 'User'}
    >
      {displayInitials}
    </div>
  );
}