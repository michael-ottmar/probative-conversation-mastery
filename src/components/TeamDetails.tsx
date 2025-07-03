'use client';

import { useState } from 'react';
import { Team } from '@/lib/types';

interface TeamDetailsProps {
  team: Team;
  onUpdate: (team: Team) => void;
}

export function TeamDetails({ team, onUpdate }: TeamDetailsProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingLeaders, setIsEditingLeaders] = useState(false);
  
  const [editedName, setEditedName] = useState(team.name);
  const [editedDescription, setEditedDescription] = useState(team.description || '');
  const [editedLeaders, setEditedLeaders] = useState(team.leaders);

  const handleNameSave = () => {
    if (editedName.trim() && editedName !== team.name) {
      onUpdate({ ...team, name: editedName.trim() });
    } else {
      setEditedName(team.name);
    }
    setIsEditingName(false);
  };

  const handleDescriptionSave = () => {
    if (editedDescription !== team.description) {
      onUpdate({ ...team, description: editedDescription || undefined });
    }
    setIsEditingDescription(false);
  };

  const handleLeadersSave = () => {
    if (editedLeaders !== team.leaders) {
      onUpdate({ ...team, leaders: editedLeaders });
    }
    setIsEditingLeaders(false);
  };

  return (
    <div 
      className="bg-white rounded-lg border-l-4 border-r border-t border-b border-gray-200 p-6"
      style={{ borderLeftColor: team.color }}
    >
      {/* Team Name */}
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

      {/* Team Description */}
      <div className="mb-4">
        {isEditingDescription ? (
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            onBlur={handleDescriptionSave}
            placeholder="Add a team description"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditingDescription(true)}
            className="min-h-[80px] px-3 py-2 bg-gray-50 rounded-lg cursor-text hover:bg-gray-100"
          >
            {team.description ? (
              <p className="text-gray-700">{team.description}</p>
            ) : (
              <p className="text-gray-400">Add a team description</p>
            )}
          </div>
        )}
      </div>

      {/* Team Leaders */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Led by:</label>
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
    </div>
  );
}