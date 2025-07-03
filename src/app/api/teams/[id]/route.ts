import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/teams/[id] - Update a team
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get the team and check permissions
    const team = await prisma.team.findFirst({
      where: {
        id: params.id,
        document: {
          OR: [
            { ownerId: user.id },
            { shares: { some: { userId: user.id, role: 'editor' } } }
          ]
        }
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found or no edit access' }, { status: 404 });
    }

    const { name, leaders, description, color } = await request.json();

    const updatedTeam = await prisma.team.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(leaders !== undefined && { leaders }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        updatedAt: new Date()
      },
      include: {
        todos: {
          orderBy: { order: 'asc' }
        }
      }
    });

    // Update document's updatedAt
    await prisma.document.update({
      where: { id: team.documentId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id] - Delete a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get the team and check permissions
    const team = await prisma.team.findFirst({
      where: {
        id: params.id,
        document: {
          OR: [
            { ownerId: user.id },
            { shares: { some: { userId: user.id, role: 'editor' } } }
          ]
        }
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found or no edit access' }, { status: 404 });
    }

    // Don't allow deleting root team
    if (team.isRoot) {
      return NextResponse.json({ error: 'Cannot delete root team' }, { status: 400 });
    }

    await prisma.team.delete({
      where: { id: params.id }
    });

    // Update document's updatedAt
    await prisma.document.update({
      where: { id: team.documentId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    );
  }
}