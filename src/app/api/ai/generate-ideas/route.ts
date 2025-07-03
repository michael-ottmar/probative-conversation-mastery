import { NextRequest, NextResponse } from 'next/server';

const todoTypePrompts = {
  focus: "Generate a specific, strategic focus area that demonstrates deep expertise. This should be a precise problem or opportunity that only an expert would identify.",
  expertise: "Create a bold, specific claim of expertise that positions this team as the go-to experts. It should be provocative yet credible.",
  perspective: "Suggest a contrarian or unique point of view that challenges conventional thinking in the industry. This should showcase thought leadership.",
  thesis: "Propose a compelling thesis statement that synthesizes the team's expertise into a transformative vision for clients.",
  contentMap: "Outline key content themes that would demonstrate expertise and educate the market on this team's unique approach.",
  leadGen: "Suggest innovative lead generation strategies that position the team as experts rather than vendors.",
};

export async function POST(request: NextRequest) {
  try {
    const { todoType, todoTitle, teamName, teamDescription, teamLeaders, existingContent } = await request.json();

    const todoPrompt = todoTypePrompts[todoType as keyof typeof todoTypePrompts] || todoTypePrompts.focus;

    const prompt = `You are a world-class sales expert with deep knowledge of Blair Enns' "The Win Without Pitching Manifesto" and expertise in probative conversations.

Context about the team:
- Team Name: ${teamName}
- Team Description: ${teamDescription || 'Not provided'}
- Team Leaders: ${teamLeaders || 'Not specified'}
- Current Task: ${todoTitle}
${existingContent ? `- What they've written so far: ${existingContent}` : ''}

Your task: ${todoPrompt}

Provide ONE specific, actionable idea that:
1. Is tailored to this specific team's context
2. Demonstrates deep expertise that moves them from vendor to expert
3. Is provocative enough to capture attention but professional
4. Can be implemented in their probative conversations

Keep your response to 2-3 sentences maximum. Be specific, not generic.`;

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
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      }),
    });

    if (!anthropicResponse.ok) {
      throw new Error('Failed to generate idea from AI');
    }

    const data = await anthropicResponse.json();
    const idea = data.content[0]?.text || 'Unable to generate idea at this time.';

    return NextResponse.json({ idea });
  } catch (error) {
    console.error('Error generating idea:', error);
    
    // Fallback to static suggestions if AI fails
    const fallbackIdeas = {
      focus: "Focus on the intersection of digital transformation and organizational culture - where most consultants fear to tread but where real change happens.",
      expertise: "We don't just advise on transformation; we've led it ourselves across three Fortune 500 companies, learning what actually works versus what sounds good in boardrooms.",
      perspective: "Most organizations approach transformation backwards - starting with technology instead of human behavior. We've proven that inverting this approach increases success rates by 70%.",
      thesis: "True transformation isn't about implementing new systems; it's about creating organizations that can continuously evolve faster than their markets change.",
      contentMap: "Create a series documenting 'Transformation Failures We've Witnessed' - showing expertise through understanding what doesn't work and why.",
      leadGen: "Offer a 'Transformation Readiness Score' that reveals the hidden blockers executives don't know they have - positioning you as the expert who sees what others miss.",
    };

    const { todoType } = await request.json();
    const idea = fallbackIdeas[todoType as keyof typeof fallbackIdeas] || fallbackIdeas.focus;

    return NextResponse.json({ idea });
  }
}