'use client';

import React from 'react';
import { Organization, Team } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface Props {
  organization: Organization;
  teams: Team[];
  selectedTeamId?: string;
  onTeamSelect: (teamId: string) => void;
  onAddTeam: () => void;
}

export function CompanyUmbrellaStructure({
  organization,
  teams,
  selectedTeamId,
  onTeamSelect,
  onAddTeam
}: Props) {
  const umbrellaTeam = teams.find(t => t.isRoot);
  const subTeams = teams.filter(t => !t.isRoot);

  return (
    <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-900">Company Umbrella Structure</h2>
      
      {/* Umbrella Team Card */}
      {umbrellaTeam && (
        <div
          onClick={() => onTeamSelect(umbrellaTeam.id)}
          className={cn(
            "p-6 rounded-lg cursor-pointer transition-all duration-200",
            "bg-blue-800 text-white hover:bg-blue-900",
            selectedTeamId === umbrellaTeam.id && "ring-4 ring-green-500"
          )}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{umbrellaTeam.name}</h3>
              {umbrellaTeam.description && (
                <p className="text-blue-100 mt-1">{umbrellaTeam.description}</p>
              )}
              <div className="mt-2 text-sm text-blue-200">
                Leaders: {umbrellaTeam.leaders.join(', ')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{umbrellaTeam.progress}%</div>
              <div className="text-sm text-blue-200">Complete</div>
            </div>
          </div>
        </div>
      )}

      {/* Sub Teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subTeams.map((team) => (
          <div
            key={team.id}
            onClick={() => onTeamSelect(team.id)}
            className={cn(
              "p-4 bg-white rounded-lg cursor-pointer transition-all duration-200",
              "border-2 hover:shadow-lg",
              selectedTeamId === team.id 
                ? "border-green-500 shadow-lg" 
                : "border-gray-200"
            )}
            style={{
              borderLeftColor: team.color,
              borderLeftWidth: '4px'
            }}
          >
            <h4 className="font-semibold text-gray-900">{team.name}</h4>
            {team.expertiseDomain && (
              <p className="text-sm text-gray-600 mt-1">{team.expertiseDomain}</p>
            )}
            <div className="flex justify-between items-center mt-3">
              <div className="text-sm text-gray-500">
                {team.leaders.length} leaders
              </div>
              <div className="text-lg font-semibold text-blue-600">
                {team.progress}%
              </div>
            </div>
          </div>
        ))}

        {/* Add Team Button */}
        <button
          onClick={onAddTeam}
          className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-300 
                     hover:border-gray-400 transition-colors duration-200 
                     flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-700"
        >
          <Plus className="h-8 w-8" />
          <span className="text-sm font-medium">Add Team</span>
        </button>
      </div>
    </div>
  );
}