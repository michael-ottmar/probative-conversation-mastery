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

  const displayInitials = getInitials(name || undefined, email || undefined);
  const backgroundColor = getAvatarColor(email || name || 'default');

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-medium ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor }}
      title={name || email || 'User'}
    >
      {displayInitials}
    </div>
  );
}