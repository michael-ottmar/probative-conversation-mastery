import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { documentId, name, color, parentId } = await request.json();

    // Verify user has edit access to the document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        OR: [
          { ownerId: user.id },
          { shares: { some: { userId: user.id, role: 'editor' } } }
        ]
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found or no edit access' }, { status: 404 });
    }

    // Create team with default todos
    const team = await prisma.team.create({
      data: {
        documentId,
        name: name || 'New Team',
        color: color || '#EC4899',
        parentId,
        todos: {
          create: [
            { type: 'focus', title: 'Choose a Focus', order: 0 },
            { type: 'expertise', title: 'Articulate a Claim of Expertise', order: 1 },
            { type: 'perspective', title: 'Provide Your Point of View', order: 2 },
            { type: 'thesis', title: 'Publish Your Thesis', order: 3 },
            { type: 'contentMap', title: 'Develop Content Map', order: 4 },
            { type: 'leadGen', title: 'Develop Lead Gen Plan', order: 5 },
          ]
        }
      },
      include: {
        todos: {
          orderBy: { order: 'asc' }
        }
      }
    });

    // Update document's updatedAt
    await prisma.document.update({
      where: { id: documentId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}