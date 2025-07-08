'use client';

import { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { Team } from '@/lib/types';

interface TeamCardProps {
  team: Team;
  isSelected: boolean;
  onSelect: (teamId: string) => void;
  onUpdate: (team: Team) => void;
  onDelete: (teamId: string) => void;
}

export function TeamCard({ team, isSelected, onSelect, onUpdate, onDelete }: TeamCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingLeaders, setIsEditingLeaders] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  const [editedName, setEditedName] = useState(team.name);
  const [editedLeaders, setEditedLeaders] = useState(team.leaders);
  const [editedDescription, setEditedDescription] = useState(team.description || '');

  // Update state when team prop changes
  useEffect(() => {
    setEditedName(team.name);
    setEditedLeaders(team.leaders);
    setEditedDescription(team.description || '');
  }, [team.id, team.name, team.leaders, team.description]);

  const handleNameSave = () => {
    if (editedName.trim() && editedName !== team.name) {
      onUpdate({ ...team, name: editedName.trim() });
    } else {
      setEditedName(team.name);
    }
    setIsEditingName(false);
  };

  const handleLeadersSave = () => {
    if (editedLeaders !== team.leaders) {
      onUpdate({ ...team, leaders: editedLeaders });
    }
    setIsEditingLeaders(false);
  };

  const handleDescriptionSave = () => {
    if (editedDescription !== team.description) {
      onUpdate({ ...team, description: editedDescription || undefined });
    }
    setIsEditingDescription(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the "${team.name}" team?`)) {
      onDelete(team.id);
    }
  };

  if (isSelected) {
    // Detailed view when selected
    return (
      <div className="bg-white rounded-lg border-2 border-blue-500 p-6">
        <div className="mb-4">
          {isEditingName ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSave();
                if (e.key === 'Escape') {
                  setEditedName(team.name);
                  setIsEditingName(false);
                }
              }}
              className="text-2xl font-bold w-full px-2 py-1 border border-blue-500 rounded outline-none"
              autoFocus
            />
          ) : (
            <h3
              onClick={() => setIsEditingName(true)}
              className="text-2xl font-bold cursor-text hover:bg-gray-50 px-2 py-1 -mx-2 rounded"
            >
              {team.name}
            </h3>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          {isEditingDescription ? (
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onBlur={handleDescriptionSave}
              placeholder="Add a team description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              autoFocus
            />
          ) : (
            <div
              onClick={() => setIsEditingDescription(true)}
              className="min-h-[60px] px-3 py-2 bg-gray-50 rounded-lg cursor-text hover:bg-gray-100"
            >
              {team.description || <span className="text-gray-400">Add a team description</span>}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Led by</label>
          {isEditingLeaders ? (
            <input
              type="text"
              value={editedLeaders}
              onChange={(e) => setEditedLeaders(e.target.value)}
              onBlur={handleLeadersSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLeadersSave();
                if (e.key === 'Escape') {
                  setEditedLeaders(team.leaders);
                  setIsEditingLeaders(false);
                }
              }}
              placeholder="e.g., Justin x Amanda"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <div
              onClick={() => setIsEditingLeaders(true)}
              className="px-3 py-2 bg-gray-50 rounded-lg cursor-text hover:bg-gray-100"
            >
              {team.leaders || <span className="text-gray-400">Add team leaders</span>}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600">
          <div className="font-medium">{team.progress}% Complete</div>
        </div>
      </div>
    );
  }

  // Compact button view
  return (
    <button
      onClick={() => onSelect(team.id)}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      className="relative w-full p-4 rounded-lg text-white text-center transition-all hover:shadow-md"
      style={{ backgroundColor: team.color }}
    >
      {showDelete && !team.isRoot && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 p-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      
      <div className="font-semibold mb-1">{team.name}</div>
      {team.leaders && (
        <div className="text-sm opacity-90">Team leaders</div>
      )}
      <div className="text-xs mt-2 opacity-75">{team.progress}% Complete</div>
    </button>
  );
}