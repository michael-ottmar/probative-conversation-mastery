export interface Organization {
  id: string;
  name: string;
  description: string; // Their expertise positioning
  industry: string;
  createdAt: Date;
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  leaders: string[];
  description?: string; // Team's specific expertise area
  color: string;
  progress: number; // 0-100 completion of probative conversation
  isRoot: boolean; // Company umbrella team
  parentId?: string;
  expertiseDomain?: string; // What they're experts in
}

export interface ProbativeConversation {
  id: string;
  organizationId: string;
  teams: string[]; // ALL teams participate in the same conversation
  objective: string; // "To prove your expertise to the client and move, in their mind, from vendor to expert"
  todos: ConversationTodo[];
  practiceSettings: PracticeSettings;
  organizationalNarrative: OrganizationalNarrative; // NEW
  sharedWith: ShareAccess[];
  createdBy: string;
  createdAt: Date;
}

export interface OrganizationalNarrative {
  id: string;
  umbrellaValue: string; // How the parent company positions overall expertise
  teamSynergies: TeamSynergy[]; // How teams complement each other
  unifiedThesis: string; // The combined expertise proposition
}

export interface TeamSynergy {
  teamA: string;
  teamB: string;
  synergyDescription: string; // How these teams create more value together
  exampleScenarios: string[]; // Real client situations where this matters
}

export interface ConversationTodo {
  id: string;
  conversationId: string;
  teamId: string;
  type: 'focus' | 'expertise' | 'perspective' | 'thesis' | 'contentMap' | 'leadGen';
  title: string;
  content?: string;
  status: 'not-started' | 'in-progress' | 'complete';
  aiSuggestions?: string[];
  lastModified: Date;
}

export interface PracticeSettings {
  focusArea: string; // e.g., "Company Holistic Conversation"
  clientType: string; // e.g., "Enterprise B2B"
  clientPersona: ClientPersona;
  conversationContext: string; // Where in the Four Conversations journey
}

export interface ClientPersona {
  id: string;
  name: string; // "Enterprise B2B", "Mid-Market CEO", etc.
  industry: string;
  companySize: string;
  currentMindset: 'vendor-seeking' | 'solution-comparing' | 'expertise-evaluating';
  sophisticationLevel: 'low' | 'medium' | 'high';
  typicalObjections: string[];
  valueDrivers: string[]; // What they care about
}

export interface PracticeSession {
  id: string;
  conversationId: string;
  teamId: string;
  messages: Message[];
  clientPersona: ClientPersona;
  coachingNotes: CoachingNote[];
  expertiseScore: number; // How well they demonstrated expertise
  startedAt: Date;
  completedAt?: Date;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'client';
  content: string;
  timestamp: Date;
}

export interface CoachingNote {
  id: string;
  timestamp: Date;
  type: 'strength' | 'improvement' | 'insight';
  content: string;
  relatedMessage?: string;
}

export interface ShareAccess {
  email: string;
  role: 'viewer' | 'editor';
  sharedAt: Date;
}