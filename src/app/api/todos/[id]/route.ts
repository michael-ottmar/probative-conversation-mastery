import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/todos/[id] - Update a todo
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

    // Get the todo and check permissions through team->document
    const todo = await prisma.todo.findFirst({
      where: {
        id: params.id,
        team: {
          document: {
            OR: [
              { ownerId: user.id },
              { shares: { some: { userId: user.id, role: 'editor' } } }
            ]
          }
        }
      },
      include: {
        team: true
      }
    });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found or no edit access' }, { status: 404 });
    }

    const { content, status, aiIdea } = await request.json();

    const updatedTodo = await prisma.todo.update({
      where: { id: params.id },
      data: {
        ...(content !== undefined && { content }),
        ...(status !== undefined && { status }),
        ...(aiIdea !== undefined && { aiIdea }),
        updatedAt: new Date()
      }
    });

    // Update team progress
    const teamTodos = await prisma.todo.findMany({
      where: { teamId: todo.teamId }
    });

    const completedCount = teamTodos.filter(t => 
      t.status === 'complete' || t.status === 'review'
    ).length;
    const progress = Math.round((completedCount / teamTodos.length) * 100);

    await prisma.team.update({
      where: { id: todo.teamId },
      data: { 
        updatedAt: new Date()
      }
    });

    // Update document's updatedAt
    await prisma.document.update({
      where: { id: todo.team.documentId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({
      ...updatedTodo,
      teamProgress: progress
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}