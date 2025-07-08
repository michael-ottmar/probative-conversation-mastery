import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { 
      conversationHistory, 
      userMessage,
      clientPersona, 
      team,
      todos,
      allTeams,
      expertiseScore,
      isInitialMessage = false
    } = await request.json();

    // Build organization context for the AI
    const organizationContext = allTeams ? `
ORGANIZATION CONTEXT:
Your company is working with ${allTeams.find((t: any) => t.isRoot)?.name || 'this organization'} which has multiple specialized teams:

${allTeams.map((t: any) => `- ${t.name}: ${t.description || 'No description provided'}
  Led by: ${t.leaders || 'Not specified'}
  Expertise: ${t.expertiseDomain || 'General'}`).join('\n')}

Feel free to naturally inquire about or reference other teams' capabilities when relevant to your needs. For example, if discussing a challenge that might benefit from another team's expertise, you might ask "Do you also handle [related area]?" or mention "We're also looking at [related need] - is that something your organization covers?"
` : '';

    // Generate a realistic name for the client - use timestamp to ensure uniqueness per conversation
    const clientNames: Record<string, string[]> = {
      'B2B Enterprise Client': ['Sarah Chen', 'Michael Rodriguez', 'Jennifer Walsh', 'David Kumar', 'Lisa Thompson', 'Robert Kim', 'Emily Davis', 'James Wilson', 'Patricia Moore', 'Daniel Taylor'],
      'SMB Owner': ['Tom Anderson', 'Maria Garcia', 'John Smith', 'Amy Lee', 'Robert Johnson', 'Susan Martinez', 'William Brown', 'Linda Davis', 'Richard Miller', 'Barbara Wilson'],
      'Startup Founder': ['Alex Kim', 'Sam Taylor', 'Jordan Martinez', 'Riley Chen', 'Casey Williams', 'Morgan Lee', 'Drew Parker', 'Avery Quinn', 'Blake Foster', 'Cameron Hughes']
    };
    
    const namePool = clientNames[clientPersona.name] || ['Chris Morgan', 'Pat Taylor', 'Jamie Brown'];
    // Use conversation history length as a seed for consistent name within conversation
    const nameIndex = conversationHistory.length === 0 
      ? Math.floor(Math.random() * namePool.length)
      : conversationHistory.length % namePool.length;
    const clientName = namePool[nameIndex];

    // Build the system prompt based on the client persona
    const systemPrompt = `You are roleplaying as a potential client in a business conversation. Your goal is to realistically portray the following persona:

PERSONA DETAILS:
- Your Name: ${clientName}
- Business Card Title: ${clientPersona.role}
- Client Type: ${clientPersona.name}
- Industry: ${clientPersona.industry}
- Company Size: ${clientPersona.companySize}
- Current Mindset: ${clientPersona.currentMindset}
- Sophistication Level: ${clientPersona.sophisticationLevel}
- Communication Style: ${clientPersona.communicationStyle || 'Professional'}

TYPICAL OBJECTIONS YOU MIGHT RAISE:
${clientPersona.typicalObjections.map((obj: string) => `- ${obj}`).join('\n')}

WHAT YOU VALUE:
${clientPersona.valueDrivers.map((driver: string) => `- ${driver}`).join('\n')}

YOUR PAIN POINTS:
${clientPersona.painPoints?.map((pain: string) => `- ${pain}`).join('\n') || 'Not specified'}

BUDGET CONCERNS:
${clientPersona.budgetConcerns || 'Not specified'}

DECISION CRITERIA:
${clientPersona.decisionCriteria?.map((criteria: string) => `- ${criteria}`).join('\n') || 'Not specified'}

${clientPersona.customPrompt ? `ADDITIONAL CONTEXT: ${clientPersona.customPrompt}` : ''}

CONVERSATION CONTEXT:
The consultant is trying to demonstrate their expertise and move from being seen as a vendor to being seen as an expert. They should be using probative conversation techniques.

Current Team Context:
${team ? `- Team: ${team.name}
- Description: ${team.description}
- Leaders: ${team.leaders}
- Expertise Domain: ${team.expertiseDomain || 'Not specified'}` : 'Not provided'}

${organizationContext}

IMPORTANT ROLEPLAY GUIDELINES:
1. Stay in character - respond as this specific client persona would
2. If this is your first message, briefly introduce yourself with your name (e.g., "Hi, I'm Sarah Chen from...")
3. Keep responses conversational and concise - typically 1-3 sentences
4. Use the communication style appropriate to the persona
5. Bring up objections naturally when relevant
6. Show the sophistication level in your questions and responses
7. Reference your pain points and value drivers when appropriate
8. Don't make it too easy - challenge them to prove their expertise
9. If they demonstrate real expertise, show genuine interest
10. If they sound like vendors, express skepticism
11. When relevant to your needs, naturally inquire about other capabilities you've noticed the organization has
12. If multiple consultants are present, acknowledge them appropriately

${isInitialMessage ? `IMPORTANT: This is the first message. You are initiating the conversation. Start with an introduction and a specific challenge or question related to your pain points. For example: "Hi, I'm [Your Name] from [Company]. We're struggling with [specific pain point]. I saw that ${team?.name || 'your team'} specializes in ${team?.expertiseDomain || 'this area'}. How do you typically approach [relevant challenge]?"` : ''}

Remember: You're evaluating whether they're truly experts or just another vendor.`;

    // Build conversation history for Claude
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === 'user' ? 'assistant' : 'user',
        content: msg.content
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    // Call Anthropic API
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100, // Reduced for more concise responses
        messages: messages.slice(1), // Remove system message for Claude format
        system: systemPrompt,
      }),
    });

    if (!anthropicResponse.ok) {
      throw new Error('Failed to generate client response');
    }

    const data = await anthropicResponse.json();
    const clientResponse = data.content[0]?.text || 'I need a moment to think about that.';

    // Generate coaching feedback based on the user's message
    const coachingPrompt = `As a sales expertise coach familiar with Blair Enns' "Win Without Pitching" methodology, analyze this message from a consultant and provide brief, actionable coaching feedback.

Consultant's message: "${userMessage}"

Context: They're in a probative conversation trying to demonstrate expertise to a ${clientPersona.name} (${clientPersona.sophisticationLevel} sophistication).

Provide ONE specific coaching note (2-3 sentences max) that is either:
- A strength to reinforce (if they demonstrated expertise well)
- An improvement suggestion (if they could do better)
- An insight about the conversation dynamics

Focus on how well they're moving from vendor to expert positioning.`;

    const coachingResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: coachingPrompt,
        }],
      }),
    });

    let coachingFeedback = null;
    let updatedScore = expertiseScore;
    
    if (coachingResponse.ok) {
      const coachingData = await coachingResponse.json();
      const feedback = coachingData.content[0]?.text;
      
      // Determine coaching type based on content
      let type: 'strength' | 'improvement' | 'insight' = 'insight';
      if (feedback?.toLowerCase().includes('well done') || feedback?.toLowerCase().includes('excellent') || feedback?.toLowerCase().includes('strong')) {
        type = 'strength';
        updatedScore = Math.min(100, expertiseScore + 5); // Increase score for strengths
      } else if (feedback?.toLowerCase().includes('instead') || feedback?.toLowerCase().includes('try') || feedback?.toLowerCase().includes('consider')) {
        type = 'improvement';
        updatedScore = Math.max(0, expertiseScore - 2); // Slight decrease for improvements needed
      }

      coachingFeedback = {
        type,
        content: feedback || 'Keep focusing on demonstrating your unique expertise.',
      };
    }

    return NextResponse.json({ 
      clientResponse,
      clientName,
      coachingFeedback,
      updatedScore 
    });
  } catch (error) {
    console.error('Error in practice conversation:', error);
    
    // Fallback responses
    const fallbackResponses = [
      "That's interesting. Can you tell me more about how you've handled similar challenges?",
      "We've heard that before from other consultants. What makes your approach different?",
      "How do I know this will work for our specific situation?",
      "That sounds expensive. What kind of ROI can we expect?",
      "We're pretty busy right now. Why should we prioritize this?",
    ];

    const fallbackCoaching = [
      { type: 'improvement', content: 'Try to be more specific about your unique expertise rather than general capabilities.' },
      { type: 'insight', content: 'The client is testing whether you\'re just another vendor. Share a unique perspective.' },
      { type: 'improvement', content: 'Focus on their business outcomes, not your service features.' },
    ];

    return NextResponse.json({ 
      clientResponse: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      clientName: 'Alex Morgan', // Fallback name
      coachingFeedback: fallbackCoaching[Math.floor(Math.random() * fallbackCoaching.length)],
      updatedScore: 50 // Default score in case of error
    });
  }
}