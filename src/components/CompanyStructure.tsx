'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Team } from '@/lib/types';

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
  
  // Calculate overall progress
  const overallProgress = Math.round(
    teams.reduce((sum, team) => sum + team.progress, 0) / teams.length
  );

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Company Structure</h2>
        <div className="relative group">
          <button
            onClick={onTeamAdd}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
          <span className="absolute -bottom-8 right-0 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            Add Team
          </span>
        </div>
      </div>

      {/* Visual Team Hierarchy */}
      <div className="space-y-4">
        {/* Root Team - Company Umbrella */}
        {rootTeam && (
          <div className="flex justify-center mb-4">
            <button
              onClick={() => onTeamSelect(rootTeam.id)}
              className={`px-6 py-4 rounded-lg transition-all border-2 ${
                selectedTeamId === rootTeam.id
                  ? 'bg-slate-700 text-white border-slate-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-semibold">{rootTeam.name}</div>
              <div className="text-sm opacity-90 mt-1">{rootTeam.leaders || 'Team leaders'}</div>
              <div className="text-xs mt-2">{rootTeam.progress}% Complete</div>
            </button>
          </div>
        )}

        {/* Child Teams */}
        <div className="flex justify-center gap-4 flex-wrap">
          {childTeams.map((team) => (
            <button
              key={team.id}
              onClick={() => onTeamSelect(team.id)}
              onMouseEnter={(e) => {
                if (!team.isRoot) {
                  const deleteBtn = e.currentTarget.querySelector('.delete-btn');
                  if (deleteBtn) deleteBtn.classList.remove('opacity-0');
                }
              }}
              onMouseLeave={(e) => {
                const deleteBtn = e.currentTarget.querySelector('.delete-btn');
                if (deleteBtn) deleteBtn.classList.add('opacity-0');
              }}
              className={`relative px-6 py-4 rounded-lg transition-all border-2 ${
                selectedTeamId === team.id
                  ? ''
                  : 'hover:shadow-md'
              }`}
              style={{ 
                backgroundColor: selectedTeamId === team.id ? team.color : 'white',
                color: selectedTeamId === team.id ? 'white' : 'rgb(107, 114, 128)',
                borderColor: selectedTeamId === team.id ? team.color : 'rgb(209, 213, 219)',
                borderWidth: '2px',
                borderStyle: 'solid'
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete the "${team.name}" team?`)) {
                    onTeamDelete(team.id);
                  }
                }}
                className="delete-btn absolute top-2 right-2 p-1 bg-white/20 rounded hover:bg-white/30 transition-all opacity-0"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="font-semibold">{team.name}</div>
              <div className="text-sm mt-1">{team.leaders || 'Team leaders'}</div>
              <div className="text-xs mt-2">{team.progress}% Complete</div>
            </button>
          ))}
        </div>
      </div>

      {/* Overall Progress */}
      <div className="text-right mt-6 pt-6 border-t border-gray-200">
        <div className="text-3xl font-bold text-blue-600">{overallProgress}%</div>
        <div className="text-sm text-gray-600">Overall Progress</div>
      </div>
    </div>
  );
}