import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

// POST /api/documents/[id]/share - Share a document with a user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is owner or has editor access
    const document = await prisma.document.findFirst({
      where: {
        id: params.id,
        OR: [
          { ownerId: currentUser.id },
          { shares: { some: { userId: currentUser.id, role: 'editor' } } }
        ]
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found or no access' }, { status: 404 });
    }

    const { email, role = 'viewer' } = await request.json();

    // Find the user to share with
    let targetUser = await prisma.user.findUnique({
      where: { email }
    });

    // If user doesn't exist, create a placeholder user
    if (!targetUser) {
      targetUser = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Use email prefix as temporary name
        }
      });
    }

    // Don't allow sharing with self
    if (targetUser.id === currentUser.id) {
      return NextResponse.json({ error: 'Cannot share with yourself' }, { status: 400 });
    }

    // Check if already shared
    const existingShare = await prisma.documentShare.findUnique({
      where: {
        documentId_userId: {
          documentId: params.id,
          userId: targetUser.id
        }
      }
    });

    if (existingShare) {
      // Update existing share
      const updatedShare = await prisma.documentShare.update({
        where: { id: existingShare.id },
        data: { role }
      });
      return NextResponse.json(updatedShare);
    }

    // Create new share
    const share = await prisma.documentShare.create({
      data: {
        documentId: params.id,
        userId: targetUser.id,
        role
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(share);
  } catch (error) {
    console.error('Error sharing document:', error);
    return NextResponse.json(
      { error: 'Failed to share document' },
      { status: 500 }
    );
  }
}

// GET /api/documents/[id]/share - Get all shares for a document
export async function GET(
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

    // Check if user has access to the document
    const document = await prisma.document.findFirst({
      where: {
        id: params.id,
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
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Format the response
    const shares = [
      {
        user: document.owner,
        role: 'owner',
        isOwner: true
      },
      ...document.shares.map(share => ({
        user: share.user,
        role: share.role,
        isOwner: false,
        shareId: share.id
      }))
    ];

    return NextResponse.json(shares);
  } catch (error) {
    console.error('Error fetching shares:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shares' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id]/share - Remove a share
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { shareId } = await request.json();

    // Check if user is owner
    const document = await prisma.document.findFirst({
      where: {
        id: params.id,
        ownerId: currentUser.id
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Only owner can remove shares' }, { status: 403 });
    }

    await prisma.documentShare.delete({
      where: { id: shareId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing share:', error);
    return NextResponse.json(
      { error: 'Failed to remove share' },
      { status: 500 }
    );
  }
}