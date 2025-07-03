import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      conversationHistory, 
      clientPersona, 
      teamContext, 
      practiceSettings 
    } = await request.json();

    // Build the system prompt based on the client persona
    const systemPrompt = `You are roleplaying as a potential client in a business conversation. Your goal is to realistically portray the following persona:

PERSONA DETAILS:
- Name/Type: ${clientPersona.name}
- Role: ${clientPersona.role}
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

Team Context:
${teamContext ? `- Team: ${teamContext.teamName}
- Description: ${teamContext.teamDescription}
- Leaders: ${teamContext.teamLeaders}` : 'Not provided'}

IMPORTANT ROLEPLAY GUIDELINES:
1. Stay in character - respond as this specific client persona would
2. Use the communication style appropriate to the persona
3. Bring up objections naturally when relevant
4. Show the sophistication level in your questions and responses
5. Reference your pain points and value drivers when appropriate
6. Don't make it too easy - challenge them to prove their expertise
7. If they demonstrate real expertise, show genuine interest
8. If they sound like vendors, express skepticism
9. Keep responses conversational and realistic - 2-3 sentences usually

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
        content: message
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
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
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

Consultant's message: "${message}"

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
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: coachingPrompt,
        }],
      }),
    });

    let coachingNote = null;
    if (coachingResponse.ok) {
      const coachingData = await coachingResponse.json();
      const feedback = coachingData.content[0]?.text;
      
      // Determine coaching type based on content
      let type: 'strength' | 'improvement' | 'insight' = 'insight';
      if (feedback?.toLowerCase().includes('well done') || feedback?.toLowerCase().includes('excellent') || feedback?.toLowerCase().includes('strong')) {
        type = 'strength';
      } else if (feedback?.toLowerCase().includes('instead') || feedback?.toLowerCase().includes('try') || feedback?.toLowerCase().includes('consider')) {
        type = 'improvement';
      }

      coachingNote = {
        type,
        content: feedback || 'Keep focusing on demonstrating your unique expertise.',
      };
    }

    return NextResponse.json({ 
      clientResponse,
      coachingNote 
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
      coachingNote: fallbackCoaching[Math.floor(Math.random() * fallbackCoaching.length)]
    });
  }
}