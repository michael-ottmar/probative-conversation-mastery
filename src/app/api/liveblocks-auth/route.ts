import { Liveblocks } from '@liveblocks/node';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getAvatarColor } from '@/lib/avatar';

export async function POST(request: NextRequest) {
  try {
    // Check if Liveblocks secret key is configured
    if (!process.env.LIVEBLOCKS_SECRET_KEY) {
      console.warn('LIVEBLOCKS_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Liveblocks not configured' },
        { status: 503 }
      );
    }

    const liveblocks = new Liveblocks({
      secret: process.env.LIVEBLOCKS_SECRET_KEY,
    });
    // Get the current user's session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the room from the request body
    const { room } = await request.json();

    if (!room) {
      return NextResponse.json({ error: 'Room is required' }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has access to this document/room
    // Handle practice rooms which have format "practice-{documentId}"
    let documentId = room;
    if (room.startsWith('practice-')) {
      documentId = room.replace('practice-', '');
    }
    
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        OR: [
          { ownerId: user.id },
          { shares: { some: { userId: user.id } } }
        ]
      },
      include: {
        shares: {
          where: { userId: user.id }
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Determine user permissions
    const isOwner = document.ownerId === user.id;
    const shareRole = document.shares[0]?.role;
    const canWrite = isOwner || shareRole === 'editor';

    // Start an auth session inside your endpoint
    const liveblocksSession = liveblocks.prepareSession(user.id, {
      userInfo: {
        name: user.name || user.email.split('@')[0],
        email: user.email,
        color: getAvatarColor(user.email),
      },
    });

    // Use a naming pattern to allow access to rooms with wildcards
    // Grant access to the original room ID (not the extracted documentId)
    liveblocksSession.allow(room, canWrite ? 
      liveblocksSession.FULL_ACCESS : 
      liveblocksSession.READ_ACCESS
    );

    // Authorize the user and return the result
    const { status, body } = await liveblocksSession.authorize();
    return new Response(body, { status });
  } catch (error) {
    console.error('Liveblocks auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}