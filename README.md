# Probative Conversation Mastery Platform

A platform for teams to master Blair Enns' "Probative Conversation" methodology from "The Four Conversations." This helps expertise-based firms prove their expertise and move from vendor to expert in the client's mind.

## Overview

The platform enables organizations to:
- Create coherent expertise positioning across all teams
- Enable any team member to articulate the value of other teams
- Practice cross-selling and up-selling within the expertise framework
- Build a unified narrative that positions the whole company as experts

## Features

### 1. Company Umbrella Structure
- Visual hierarchy of teams within the organization
- Progress tracking for each team's probative conversation completion
- Clear expertise domain definition for each team

### 2. Probative Conversation Builder
- Follow Blair Enns' six-step methodology:
  - Choose a Focus
  - Articulate a Claim of Expertise
  - Add a Perspective
  - Publish Thesis
  - Develop Content Map
  - Develop Lead Gen Plan
- AI-powered idea generation for each step
- Team-specific and organization-wide progress tracking

### 3. Practice Mode
- Interactive conversations with AI-simulated clients
- Real-time coaching based on expertise demonstration
- Cross-team scenario practice
- Expertise scoring and feedback

### 4. Organizational Coherence
- Map team synergies and complementary expertise
- Unified value proposition development
- Cross-selling readiness assessment

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: NextAuth.js with Google OAuth
- **Real-time**: Liveblocks for collaborative editing
- **Database**: Vercel KV for document storage
- **AI**: Vercel AI SDK with Anthropic Claude

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google OAuth credentials
- Vercel KV database
- Anthropic API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd probative-conversation-mastery
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual credentials.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### For Company Umbrella Teams
1. Start by defining your organization's overall expertise positioning
2. Map out how each specialized team contributes to the whole
3. Practice articulating each team's value proposition
4. Use practice mode to simulate client conversations

### For Specialized Teams
1. Define your unique expertise domain
2. Complete the probative conversation steps
3. Practice bringing in sister teams when appropriate
4. Build content that demonstrates your expertise

### Practice Scenarios
- Company Umbrella selling specialized services
- Specialized teams leveraging umbrella resources
- Cross-team introductions and handoffs
- Handling "out of scope" questions with expertise

## Key Concepts

### The Probative Conversation
According to Blair Enns, this is the conversation where you prove your expertise to move from vendor to expert status in the client's mind.

### Expertise vs Capabilities
- Capabilities: "We can do X, Y, Z"
- Expertise: "We understand something about your business that others don't"

### Organizational Coherence
The whole organization must be able to articulate a unified expertise narrative where each team's specialization enhances the overall value proposition.

## Development

### Project Structure
```
src/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                 # Utilities and types
└── styles/             # Global styles
```

### Key Components
- `CompanyUmbrellaStructure`: Visualizes team hierarchy
- `ProbativeConversationTodos`: Manages the six-step process
- `PracticeConversation`: AI-powered practice interface
- `ExpertiseCoach`: Real-time coaching feedback

## Contributing

1. Follow the existing code style
2. Ensure all teams can articulate expertise, not just capabilities
3. Test cross-team scenarios thoroughly
4. Keep Blair Enns' methodology at the core

## License

[Your License]

## Acknowledgments

Based on "The Four Conversations" by Blair Enns and the Win Without Pitching methodology.