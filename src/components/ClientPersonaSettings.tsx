'use client';

import { useState } from 'react';
import { X, User, Plus, Settings, Trash2 } from 'lucide-react';
import { ClientPersona } from '@/lib/types';

interface ClientPersonaSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersona: ClientPersona | null;
  onSelectPersona: (persona: ClientPersona) => void;
  customPersonas: ClientPersona[];
  onCreatePersona: (persona: ClientPersona) => void;
  onDeletePersona: (id: string) => void;
}

// Default personas
const defaultPersonas: ClientPersona[] = [
  {
    id: 'default-b2b',
    name: 'B2B Enterprise Client',
    role: 'VP of Digital Transformation',
    industry: 'Financial Services',
    companySize: '10,000+ employees',
    currentMindset: 'expertise-evaluating',
    sophisticationLevel: 'high',
    typicalObjections: [
      'We already have consultants',
      'How are you different from the big firms?',
      'Can you handle our scale?',
      'Do you understand our regulatory requirements?'
    ],
    valueDrivers: [
      'Proven enterprise experience',
      'Industry-specific expertise',
      'ROI and business outcomes',
      'Risk mitigation'
    ],
    painPoints: [
      'Legacy system integration',
      'Change management at scale',
      'Regulatory compliance',
      'Speed to market'
    ],
    budgetConcerns: 'Annual budget cycles, procurement processes',
    decisionCriteria: [
      'Track record with similar companies',
      'Team expertise and certifications',
      'Methodology and approach',
      'Cultural fit'
    ],
    communicationStyle: 'Formal, data-driven, committee-based decisions',
    isDefault: true
  },
  {
    id: 'default-b2c',
    name: 'B2C Middle Marketing Manager',
    role: 'Marketing Director',
    industry: 'Retail/E-commerce',
    companySize: '500-2000 employees',
    currentMindset: 'solution-comparing',
    sophisticationLevel: 'medium',
    typicalObjections: [
      'We need quick wins',
      'Our budget is limited',
      'Can you work with our existing team?',
      'How hands-on will you be?'
    ],
    valueDrivers: [
      'Speed to implementation',
      'Practical, actionable solutions',
      'Cost effectiveness',
      'Team enablement'
    ],
    painPoints: [
      'Customer acquisition costs',
      'Brand differentiation',
      'Marketing attribution',
      'Team skill gaps'
    ],
    budgetConcerns: 'Quarterly targets, need to show ROI quickly',
    decisionCriteria: [
      'Clear project timeline',
      'Specific deliverables',
      'Team chemistry',
      'Flexibility in approach'
    ],
    communicationStyle: 'Collaborative, visual, prefers examples and case studies',
    isDefault: true
  },
  {
    id: 'default-startup',
    name: 'Startup Founder',
    role: 'CEO/Founder',
    industry: 'Technology/SaaS',
    companySize: '10-50 employees',
    currentMindset: 'vendor-seeking',
    sophisticationLevel: 'medium',
    typicalObjections: [
      'We move too fast for consultants',
      'We know our market better',
      'Can you keep up with our pace?',
      'Will this slow us down?'
    ],
    valueDrivers: [
      'Speed and agility',
      'Strategic thinking',
      'Network and connections',
      'Scalable solutions'
    ],
    painPoints: [
      'Scaling challenges',
      'Product-market fit',
      'Fundraising strategy',
      'Team building'
    ],
    budgetConcerns: 'Cash flow sensitive, milestone-based payments preferred',
    decisionCriteria: [
      'Startup experience',
      'Network value',
      'Strategic insight',
      'Cultural alignment'
    ],
    communicationStyle: 'Direct, informal, rapid decision making',
    isDefault: true
  }
];

export function ClientPersonaSettings({
  isOpen,
  onClose,
  currentPersona,
  onSelectPersona,
  customPersonas,
  onCreatePersona,
  onDeletePersona
}: ClientPersonaSettingsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newPersona, setNewPersona] = useState<Partial<ClientPersona>>({
    name: '',
    role: '',
    industry: '',
    companySize: '',
    currentMindset: 'vendor-seeking',
    sophisticationLevel: 'medium',
    typicalObjections: [],
    valueDrivers: [],
    painPoints: [],
    budgetConcerns: '',
    decisionCriteria: [],
    communicationStyle: '',
    customPrompt: ''
  });
  const [newObjection, setNewObjection] = useState('');
  const [newValueDriver, setNewValueDriver] = useState('');
  const [newPainPoint, setNewPainPoint] = useState('');
  const [newCriteria, setNewCriteria] = useState('');

  if (!isOpen) return null;

  const allPersonas = [...defaultPersonas, ...customPersonas];

  const handleCreatePersona = () => {
    if (!newPersona.name || !newPersona.role || !newPersona.industry) return;

    const persona: ClientPersona = {
      id: `custom-${Date.now()}`,
      name: newPersona.name,
      role: newPersona.role,
      industry: newPersona.industry,
      companySize: newPersona.companySize || '',
      currentMindset: newPersona.currentMindset as ClientPersona['currentMindset'],
      sophisticationLevel: newPersona.sophisticationLevel as ClientPersona['sophisticationLevel'],
      typicalObjections: newPersona.typicalObjections || [],
      valueDrivers: newPersona.valueDrivers || [],
      painPoints: newPersona.painPoints || [],
      budgetConcerns: newPersona.budgetConcerns,
      decisionCriteria: newPersona.decisionCriteria || [],
      communicationStyle: newPersona.communicationStyle,
      customPrompt: newPersona.customPrompt,
      isDefault: false
    };

    onCreatePersona(persona);
    setIsCreating(false);
    setNewPersona({
      name: '',
      role: '',
      industry: '',
      companySize: '',
      currentMindset: 'vendor-seeking',
      sophisticationLevel: 'medium',
      typicalObjections: [],
      valueDrivers: [],
      painPoints: [],
      budgetConcerns: '',
      decisionCriteria: [],
      communicationStyle: '',
      customPrompt: ''
    });
  };

  const addArrayItem = (field: 'typicalObjections' | 'valueDrivers' | 'painPoints' | 'decisionCriteria', value: string) => {
    if (!value.trim()) return;
    setNewPersona({
      ...newPersona,
      [field]: [...(newPersona[field] || []), value]
    });
    // Clear the corresponding input
    if (field === 'typicalObjections') setNewObjection('');
    if (field === 'valueDrivers') setNewValueDriver('');
    if (field === 'painPoints') setNewPainPoint('');
    if (field === 'decisionCriteria') setNewCriteria('');
  };

  const removeArrayItem = (field: 'typicalObjections' | 'valueDrivers' | 'painPoints' | 'decisionCriteria', index: number) => {
    setNewPersona({
      ...newPersona,
      [field]: (newPersona[field] || []).filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Client Persona Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {!isCreating ? (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Available Personas</h3>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Create Custom Persona
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allPersonas.map((persona) => (
                    <div
                      key={persona.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        currentPersona?.id === persona.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => onSelectPersona(persona)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-gray-600" />
                          <h4 className="font-semibold text-gray-900">{persona.name}</h4>
                          {persona.isDefault && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        {!persona.isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePersona(persona.id);
                            }}
                            className="p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{persona.role}</p>
                      <p className="text-sm text-gray-500">{persona.industry} • {persona.companySize}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {persona.sophisticationLevel} sophistication
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {persona.currentMindset}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {currentPersona && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Persona Details</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Typical Objections</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {currentPersona.typicalObjections.map((objection, i) => (
                          <li key={i}>{objection}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Value Drivers</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {currentPersona.valueDrivers.map((driver, i) => (
                          <li key={i}>{driver}</li>
                        ))}
                      </ul>
                    </div>
                    {currentPersona.painPoints && currentPersona.painPoints.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Pain Points</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {currentPersona.painPoints.map((pain, i) => (
                            <li key={i}>{pain}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {currentPersona.communicationStyle && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Communication Style</h4>
                        <p className="text-sm text-gray-600">{currentPersona.communicationStyle}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Create Custom Persona</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Persona Name *
                  </label>
                  <input
                    type="text"
                    value={newPersona.name}
                    onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
                    placeholder="e.g., Healthcare CTO"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role/Title *
                  </label>
                  <input
                    type="text"
                    value={newPersona.role}
                    onChange={(e) => setNewPersona({ ...newPersona, role: e.target.value })}
                    placeholder="e.g., Chief Technology Officer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry *
                  </label>
                  <input
                    type="text"
                    value={newPersona.industry}
                    onChange={(e) => setNewPersona({ ...newPersona, industry: e.target.value })}
                    placeholder="e.g., Healthcare"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Size
                  </label>
                  <input
                    type="text"
                    value={newPersona.companySize}
                    onChange={(e) => setNewPersona({ ...newPersona, companySize: e.target.value })}
                    placeholder="e.g., 1000-5000 employees"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Mindset
                  </label>
                  <select
                    value={newPersona.currentMindset}
                    onChange={(e) => setNewPersona({ ...newPersona, currentMindset: e.target.value as ClientPersona['currentMindset'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="vendor-seeking">Vendor Seeking</option>
                    <option value="solution-comparing">Solution Comparing</option>
                    <option value="expertise-evaluating">Expertise Evaluating</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sophistication Level
                  </label>
                  <select
                    value={newPersona.sophisticationLevel}
                    onChange={(e) => setNewPersona({ ...newPersona, sophisticationLevel: e.target.value as ClientPersona['sophisticationLevel'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Communication Style
                </label>
                <input
                  type="text"
                  value={newPersona.communicationStyle}
                  onChange={(e) => setNewPersona({ ...newPersona, communicationStyle: e.target.value })}
                  placeholder="e.g., Technical, detail-oriented, prefers data"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Concerns
                </label>
                <input
                  type="text"
                  value={newPersona.budgetConcerns}
                  onChange={(e) => setNewPersona({ ...newPersona, budgetConcerns: e.target.value })}
                  placeholder="e.g., Fixed annual budget, requires board approval"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Array inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typical Objections
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newObjection}
                      onChange={(e) => setNewObjection(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addArrayItem('typicalObjections', newObjection)}
                      placeholder="Add an objection"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => addArrayItem('typicalObjections', newObjection)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1">
                    {(newPersona.typicalObjections || []).map((objection, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="flex-1 px-3 py-1 bg-gray-100 rounded">{objection}</span>
                        <button
                          onClick={() => removeArrayItem('typicalObjections', i)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value Drivers
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newValueDriver}
                      onChange={(e) => setNewValueDriver(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addArrayItem('valueDrivers', newValueDriver)}
                      placeholder="Add a value driver"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => addArrayItem('valueDrivers', newValueDriver)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1">
                    {(newPersona.valueDrivers || []).map((driver, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="flex-1 px-3 py-1 bg-gray-100 rounded">{driver}</span>
                        <button
                          onClick={() => removeArrayItem('valueDrivers', i)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pain Points
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newPainPoint}
                      onChange={(e) => setNewPainPoint(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addArrayItem('painPoints', newPainPoint)}
                      placeholder="Add a pain point"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => addArrayItem('painPoints', newPainPoint)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1">
                    {(newPersona.painPoints || []).map((pain, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="flex-1 px-3 py-1 bg-gray-100 rounded">{pain}</span>
                        <button
                          onClick={() => removeArrayItem('painPoints', i)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Decision Criteria
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newCriteria}
                      onChange={(e) => setNewCriteria(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addArrayItem('decisionCriteria', newCriteria)}
                      placeholder="Add decision criteria"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => addArrayItem('decisionCriteria', newCriteria)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1">
                    {(newPersona.decisionCriteria || []).map((criteria, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="flex-1 px-3 py-1 bg-gray-100 rounded">{criteria}</span>
                        <button
                          onClick={() => removeArrayItem('decisionCriteria', i)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom AI Roleplay Instructions (Optional)
                </label>
                <textarea
                  value={newPersona.customPrompt}
                  onChange={(e) => setNewPersona({ ...newPersona, customPrompt: e.target.value })}
                  placeholder="Add any additional context or instructions for the AI to roleplay this persona"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewPersona({
                      name: '',
                      role: '',
                      industry: '',
                      companySize: '',
                      currentMindset: 'vendor-seeking',
                      sophisticationLevel: 'medium',
                      typicalObjections: [],
                      valueDrivers: [],
                      painPoints: [],
                      budgetConcerns: '',
                      decisionCriteria: [],
                      communicationStyle: '',
                      customPrompt: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePersona}
                  disabled={!newPersona.name || !newPersona.role || !newPersona.industry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Persona
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}