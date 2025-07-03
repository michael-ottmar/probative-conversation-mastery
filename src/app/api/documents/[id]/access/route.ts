import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

// POST /api/documents/[id]/access - Request access to a document (auto-grant viewer access via share link)
export async function POST(
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

    // Check if document exists
    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        shares: {
          where: { userId: user.id }
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if user is owner
    if (document.ownerId === user.id) {
      return NextResponse.json({ 
        message: 'You are the owner of this document',
        hasAccess: true,
        role: 'owner' 
      });
    }

    // Check if user already has access
    if (document.shares.length > 0) {
      return NextResponse.json({ 
        message: 'You already have access to this document',
        hasAccess: true,
        role: document.shares[0].role
      });
    }

    // Auto-grant viewer access (since they accessed via share link)
    const share = await prisma.documentShare.create({
      data: {
        documentId: params.id,
        userId: user.id,
        role: 'viewer'
      }
    });

    return NextResponse.json({ 
      message: 'Access granted',
      hasAccess: true,
      role: 'viewer',
      share 
    });
  } catch (error) {
    console.error('Error requesting document access:', error);
    return NextResponse.json(
      { error: 'Failed to request access' },
      { status: 500 }
    );
  }
}