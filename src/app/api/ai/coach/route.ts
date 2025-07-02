import { NextRequest, NextResponse } from 'next/server';
import { ConversationTodo } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { todo, message, context } = await request.json();

    // Mock coaching response based on Blair Enns methodology
    const coachPrompt = `You are coaching someone on Blair Enns' Probative Conversation methodology.
They are trying to prove their expertise in: ${todo?.focus || context?.focus}
Their claim of expertise is: ${todo?.expertise || context?.expertise}
Help them move from sounding like a vendor to sounding like an expert.
Expertise sounds like insight, not capability.

User message: ${message}

Provide specific coaching on how to demonstrate expertise better.`;

    // In production, this would call the AI API
    const coachingResponse = {
      feedback: "Focus on sharing insights about the industry, not just your capabilities. Instead of saying 'We can help with digital transformation,' try 'We've noticed that most enterprises fail at digital transformation because they treat it as a technology problem rather than a coordinated business evolution.'",
      type: message.toLowerCase().includes('we can') || message.toLowerCase().includes('our services') 
        ? 'improvement' 
        : 'strength',
      expertiseScore: 45,
      suggestions: [
        "Share a specific insight about their industry",
        "Ask a provocative question that demonstrates your understanding",
        "Reference patterns you've observed across similar organizations"
      ]
    };

    return NextResponse.json(coachingResponse);
  } catch (error) {
    console.error('Coaching error:', error);
    return NextResponse.json(
      { error: 'Failed to generate coaching feedback' },
      { status: 500 }
    );
  }
}