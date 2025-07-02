import { NextRequest, NextResponse } from 'next/server';
import { ClientPersona } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { message, persona, conversationHistory, organizationalContext } = await request.json();

    // Mock client response that tests organizational expertise
    const clientPrompt = `You are a ${persona.name} at a ${persona.companySize} company.
You currently see the person as a potential vendor, not an expert.

During the conversation, you should:
- Ask about capabilities beyond the immediate team's focus
- Probe about how different teams work together
- Question the depth of expertise across the organization
- Test if they can articulate sister team value propositions

Current mindset: ${persona.currentMindset}
You'll shift perception only if they demonstrate both deep expertise AND organizational coherence.

Conversation so far: ${JSON.stringify(conversationHistory)}
Latest message from consultant: ${message}

Respond as the client would, testing their expertise.`;

    // Mock responses based on conversation stage
    const responses = [
      {
        stage: 'initial',
        message: "I understand you offer consulting services. Can you tell me more about your capabilities and how you typically work with enterprise clients?",
        hiddenIntent: "Testing if they lead with capabilities (vendor) or insights (expert)"
      },
      {
        stage: 'probing_breadth',
        message: "That's interesting. We also have challenges with our brand consistency across channels. Is that something your organization handles, or would we need to find another partner for that?",
        hiddenIntent: "Testing if they can articulate sister team expertise"
      },
      {
        stage: 'testing_integration',
        message: "How do your different teams actually work together? In my experience, consultants often work in silos and we end up managing the coordination ourselves.",
        hiddenIntent: "Testing organizational coherence and integrated approach"
      },
      {
        stage: 'challenging_expertise',
        message: "We've worked with several consulting firms before. What makes your approach different? Everyone claims to do 'transformation.'",
        hiddenIntent: "Looking for unique insights and perspective, not generic claims"
      }
    ];

    // Select appropriate response based on conversation
    const responseIndex = conversationHistory?.length || 0;
    const selectedResponse = responses[Math.min(responseIndex, responses.length - 1)];

    return NextResponse.json({
      message: selectedResponse.message,
      mindsetShift: responseIndex > 2 ? 10 : 0, // Shift perception after demonstrating expertise
      internalThoughts: selectedResponse.hiddenIntent
    });
  } catch (error) {
    console.error('Client simulation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate client response' },
      { status: 500 }
    );
  }
}