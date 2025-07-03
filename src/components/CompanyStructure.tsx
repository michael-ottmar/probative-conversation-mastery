'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Team } from '@/lib/types';
import { TeamCard } from './TeamCard';

interface CompanyStructureProps {
  teams: Team[];
  selectedTeamId: string;
  onTeamSelect: (teamId: string) => void;
  onTeamUpdate: (team: Team) => void;
  onTeamDelete: (teamId: string) => void;
  onTeamAdd: () => void;
}

export function CompanyStructure({
  teams,
  selectedTeamId,
  onTeamSelect,
  onTeamUpdate,
  onTeamDelete,
  onTeamAdd,
}: CompanyStructureProps) {
  const rootTeam = teams.find(t => t.isRoot);
  const childTeams = teams.filter(t => !t.isRoot);
  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  
  // Calculate overall progress
  const overallProgress = Math.round(
    teams.reduce((sum, team) => sum + team.progress, 0) / teams.length
  );

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Company Umbrella Structure</h2>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{overallProgress}%</div>
            <div className="text-sm text-gray-600">Overall Progress</div>
          </div>
          <button
            onClick={onTeamAdd}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Add Team"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Hierarchy */}
        <div className="space-y-4">
          {/* Root Team */}
          {rootTeam && (
            <div>
              <TeamCard
                team={rootTeam}
                isSelected={selectedTeamId === rootTeam.id}
                onSelect={onTeamSelect}
                onUpdate={onTeamUpdate}
                onDelete={onTeamDelete}
              />
            </div>
          )}

          {/* Child Teams */}
          <div className="grid grid-cols-2 gap-3">
            {childTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                isSelected={selectedTeamId === team.id}
                onSelect={onTeamSelect}
                onUpdate={onTeamUpdate}
                onDelete={onTeamDelete}
              />
            ))}
          </div>
        </div>

        {/* Selected Team Details */}
        <div>
          {selectedTeam && (
            <TeamCard
              team={selectedTeam}
              isSelected={true}
              onSelect={onTeamSelect}
              onUpdate={onTeamUpdate}
              onDelete={onTeamDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}