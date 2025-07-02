import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { todoType, organizationContext, teamContext } = await request.json();

    // Generate ideas specific to each probative conversation step
    const ideaGenerators: Record<string, () => string[]> = {
      focus: () => [
        "Digital transformation readiness for enterprise organizations",
        "The hidden costs of misaligned brand and operations in scaling companies",
        "Why 70% of strategic initiatives fail at the execution level",
        "The expertise gap in modern enterprise leadership",
        "Breaking down silos between strategy, operations, and brand"
      ],
      expertise: () => [
        "We see transformation differently - as a coordinated effort across strategy, operations, and brand",
        "Most consultants treat symptoms; we address the root cause of organizational incoherence",
        "We've developed a unique framework that aligns expertise across all organizational levels",
        "Our integrated approach reduces transformation time by 40% compared to traditional consulting",
        "We believe true expertise means knowing when to leverage specialized knowledge across domains"
      ],
      perspective: () => [
        "In our experience, enterprises fail not from lack of strategy but from inability to execute cohesively",
        "We've observed that the most successful transformations treat brand, operations, and strategy as one system",
        "The biggest mistake we see is organizations hiring multiple specialists without an integration plan",
        "Data shows that companies with aligned expertise across teams outperform competitors by 3x",
        "Most leaders underestimate the cost of expertise silos in their organization"
      ],
      thesis: () => [
        "The future of enterprise consulting is integrated expertise, not specialized silos",
        "Organizational coherence is the single biggest predictor of transformation success",
        "Why your next consultant should be an orchestra conductor, not a solo performer",
        "The myth of the specialist: Why deep expertise requires broad integration",
        "Beyond transformation: Building organizations that evolve continuously"
      ],
      contentMap: () => [
        "Case study series: Integrated transformation success stories",
        "White paper: The true cost of consultant silos in enterprise organizations",
        "Webinar series: Each team demonstrates their expertise in context",
        "Executive guide: Questions to ask before your next transformation",
        "Podcast: Conversations with leaders who've achieved organizational coherence"
      ],
      leadGen: () => [
        "Diagnostic tool: Assess your organization's expertise coherence score",
        "Executive roundtable: 'Is your expertise working against you?'",
        "Free consultation: Map your expertise gaps across teams",
        "Workshop: Building your integrated transformation roadmap",
        "Assessment: Calculate the hidden cost of your expertise silos"
      ]
    };

    const ideas = ideaGenerators[todoType]?.() || [];

    return NextResponse.json({
      ideas,
      methodology: "Based on Blair Enns' Probative Conversation framework",
      tip: "Remember: Expertise is demonstrated through insights and perspective, not capabilities"
    });
  } catch (error) {
    console.error('Idea generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate ideas' },
      { status: 500 }
    );
  }
}