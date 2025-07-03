'use client';

import { useState } from 'react';
import { MoreVertical, Share2, Trash2, Users } from 'lucide-react';

interface ActiveUser {
  id: string;
  name?: string;
  email: string;
  color: string;
}

interface DocumentCardProps {
  id: string;
  name: string;
  practiceCount: number;
  teamCount: number;
  lastEdited: Date;
  activeUsers: ActiveUser[];
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

const getInitial = (user: ActiveUser) => {
  if (user.name) {
    return user.name.charAt(0).toUpperCase();
  }
  return user.email.charAt(0).toUpperCase();
};

export function DocumentCard({
  id,
  name,
  practiceCount,
  teamCount,
  lastEdited,
  activeUsers,
  onShare,
  onDelete,
  onRename,
}: DocumentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [showActions, setShowActions] = useState(false);

  const handleRename = () => {
    if (editedName.trim() && editedName !== name) {
      onRename(id, editedName.trim());
    } else {
      setEditedName(name);
    }
    setIsEditing(false);
  };

  const formatLastEdited = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const months = Math.floor(diff / 2592000000);

    if (minutes < 60) return `Edited ${minutes}m ago`;
    if (hours < 24) return `Edited ${hours}h ago`;
    if (days < 30) return `Edited ${days} day${days > 1 ? 's' : ''} ago`;
    return `Edited ${months} month${months > 1 ? 's' : ''} ago`;
  };

  return (
    <div 
      className="relative bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Action buttons */}
      <div className={`absolute top-4 right-4 flex gap-2 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare(id);
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Share"
        >
          <Share2 className="h-4 w-4 text-gray-600" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      <div 
        onClick={(e) => {
          if (!isEditing && !e.defaultPrevented) {
            window.location.href = `/conversation/${id}`;
          }
        }}
        className="cursor-pointer"
      >
        {/* Practice count */}
        <div className="text-4xl font-bold text-gray-900 mb-1">
          {practiceCount.toString().padStart(2, '0')}
        </div>
        <div className="text-sm text-gray-600 mb-4">
          Practice conversations
        </div>

        {/* Document name */}
        {isEditing ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setEditedName(name);
                setIsEditing(false);
              }
            }}
            onClick={(e) => e.preventDefault()}
            className="text-lg font-semibold text-gray-900 mb-1 w-full px-2 py-1 border border-blue-500 rounded outline-none"
            autoFocus
          />
        ) : (
          <h3
            onClick={(e) => {
              e.preventDefault();
              setIsEditing(true);
            }}
            className="text-lg font-semibold text-gray-900 mb-1 hover:bg-gray-50 px-2 py-1 -mx-2 rounded cursor-text"
          >
            {name}
          </h3>
        )}

        {/* Team count */}
        <div className="text-sm text-gray-600 mb-4">
          {teamCount} Teams
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {formatLastEdited(lastEdited)}
          </span>

          {/* Active users */}
          <div className="flex -space-x-2">
            {activeUsers.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ring-2 ring-white"
                style={{ backgroundColor: user.color }}
                title={user.name || user.email}
              >
                {getInitial(user)}
              </div>
            ))}
            {activeUsers.length > 3 && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 text-sm font-medium ring-2 ring-white">
                +{activeUsers.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}