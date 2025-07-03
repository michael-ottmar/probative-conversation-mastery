import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/documents - Get all documents for the current user
export async function GET(request: NextRequest) {
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

    // Get documents owned by user or shared with user
    const documents = await prisma.document.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { shares: { some: { userId: user.id } } }
        ]
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        shares: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        teams: {
          select: { id: true }
        },
        practices: {
          where: { isActive: true },
          select: { id: true }
        },
        _count: {
          select: { practices: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Transform documents to match frontend interface
    const transformedDocs = documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      practiceCount: doc._count.practices,
      teamCount: doc.teams.length,
      lastEdited: doc.updatedAt,
      activeUsers: [
        doc.owner,
        ...doc.shares.map(share => share.user)
      ].filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      ),
      isOwner: doc.ownerId === user.id,
      role: doc.ownerId === user.id ? 'owner' : 
            doc.shares.find(s => s.userId === user.id)?.role || 'viewer'
    }));

    return NextResponse.json(transformedDocs);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create a new document
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

    const { name = 'Untitled Document' } = await request.json();

    // Create document with default teams and todos
    const document = await prisma.document.create({
      data: {
        name,
        ownerId: user.id,
        teams: {
          create: [
            {
              name: 'Team 1',
              leaders: 'Leadership Team',
              color: '#1E40AF',
              isRoot: true,
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
            {
              name: 'Team 2',
              color: '#10B981',
              parentId: 'team-1',
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
            {
              name: 'Team 3',
              color: '#F59E0B',
              parentId: 'team-1',
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
            {
              name: 'Team 4',
              color: '#8B5CF6',
              parentId: 'team-1',
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
            }
          ]
        }
      },
      include: {
        teams: {
          include: { todos: true }
        }
      }
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}