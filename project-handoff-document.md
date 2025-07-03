# Probative Conversation Mastery Platform - Project Handoff Document

## Project Overview
Building a platform for teams to master Blair Enns' "Probative Conversation" methodology from "The Four Conversations." This helps expertise-based firms prove their expertise and move from vendor to expert in the client's mind.

**Live URL**: https://probative-conversation-mastery.vercel.app

## Current Status (As of handoff)

### ✅ Completed
1. **UI/UX Implementation**
   - Clean, professional design matching original mockups
   - Company umbrella structure with team hierarchy
   - Probative conversation to-do interface
   - Practice mode UI with coaching sidebar

2. **Deployment Infrastructure**
   - Deployed on Vercel (auto-deploys from GitHub)
   - Postgres database connected (via Supabase)
   - Environment variables configured

3. **Authentication**
   - Google OAuth implemented with NextAuth.js
   - Sign in/out working in production
   - User sessions properly managed

### ❌ Still Needed
1. **Data Persistence**
   - Organizations, teams, and todos currently don't save
   - Need to connect UI to database via API routes
   - Implement proper data loading on app startup

2. **AI Features**
   - "Generate Ideas" buttons need Anthropic API integration
   - Practice mode conversations with AI client
   - Expertise coaching functionality

3. **Real-time Collaboration**
   - Liveblocks integration for multi-user editing
   - Presence indicators
   - Live updates

## Technical Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Auth**: NextAuth.js with Google provider
- **Database**: Postgres (via Vercel/Supabase integration)
- **Deployment**: Vercel (auto-deploy from GitHub)
- **AI**: Anthropic Claude (API key configured, not yet implemented)

## Key Files & Structure
```
probative-conversation-mastery/
├── src/
│   ├── app/
│   │   ├── api/auth/[...nextauth]/  # Auth configuration
│   │   ├── conversation/[id]/        # Conversation pages
│   │   ├── dashboard/                # Main dashboard
│   │   └── page.tsx                  # Landing page
│   ├── components/                   # All UI components
│   └── lib/
│       └── types.ts                  # TypeScript interfaces
├── prisma/
│   └── schema.prisma                 # Database schema
└── .env.local                        # Local environment vars
```

## Environment Variables (Set in Vercel)
```
NEXTAUTH_URL=https://probative-conversation-mastery.vercel.app
NEXTAUTH_SECRET=[generated secret]
GOOGLE_CLIENT_ID=[from Google Console]
GOOGLE_CLIENT_SECRET=[from Google Console]
ANTHROPIC_API_KEY=[API key]
POSTGRES_URL=[auto-added by Vercel]
POSTGRES_PRISMA_URL=[auto-added by Vercel]
POSTGRES_URL_NON_POOLING=[auto-added by Vercel]
# Plus other POSTGRES_* variables
```

## Next Implementation Priority

### 1. Data Persistence (HIGHEST PRIORITY)
The app looks complete but nothing saves. Need to:
- Create API routes for organizations, teams, conversations
- Update components to call these APIs
- Load user's data on login
- Handle loading states

### 2. AI Integration
Once data saves, add AI features:
- Wire up "Generate Ideas" to Anthropic API
- Implement practice conversations
- Add coaching feedback

### 3. Polish Features
- Team management (edit, delete)
- Progress tracking
- Export functionality
- Share conversations

## Key Context
- This is NOT a generic chat app - it's specifically for Blair Enns' Probative Conversation methodology
- The goal is to help organizations present unified expertise (not just individual sales training)
- Teams need to articulate each other's value (cross-selling as expertise extension)
- Moving from "vendor" to "expert" positioning is the core objective

## Common Issues & Solutions
1. **Auth errors**: Check all POSTGRES_* env vars are set in Vercel
2. **Google OAuth redirect**: Must match exactly in Google Console
3. **Local dev**: Need all env vars in .env.local (including database URLs)

## Development Workflow
```bash
# Local development
npm run dev

# Deploy
git add .
git commit -m "Your changes"
git push  # Auto-deploys to Vercel!
```

## Resources
- GitHub Repo: [check user's GitHub]
- Vercel Dashboard: https://vercel.com/dashboard
- Google Console: https://console.cloud.google.com
- Book Reference: "The Four Conversations" by Blair Enns

## Last Working State
- Authentication working
- UI complete but using mock data
- Ready for data persistence implementation

## Immediate Next Steps
1. Implement data persistence API routes
2. Connect UI to use real data
3. Test create/read/update operations
4. Then move to AI features

Good luck with the next phase! The hardest parts (deployment, auth, UI) are done! 🚀