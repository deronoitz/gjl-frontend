import { NextRequest, NextResponse } from 'next/server';
import { CustomAuth } from '@/lib/custom-auth';
import { supabaseService } from '@/lib/supabase';

interface DatabaseAnnouncement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_id: string;
}

// GET /api/announcements - Get all announcements
export async function GET() {
  try {
    // First get all announcements
    const { data: announcements, error } = await supabaseService
      .from('announcements')
      .select(`
        id,
        title,
        content,
        created_at,
        updated_at,
        author_id
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }

    if (!announcements || announcements.length === 0) {
      return NextResponse.json([]);
    }

    // Get all unique author IDs
    const authorIds = [...new Set(announcements.map(a => a.author_id))];

    // Fetch all authors in one query
    const { data: authors, error: authorsError } = await supabaseService
      .from('users')
      .select('id, name')
      .in('id', authorIds);

    if (authorsError) {
      console.error('Error fetching authors:', authorsError);
    }

    // Create a map of author ID to name for quick lookup
    const authorMap = new Map(authors?.map(author => [author.id, author.name]) || []);

    // Transform the data to match the expected structure
    const transformedAnnouncements = announcements.map((announcement: DatabaseAnnouncement) => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      createdAt: announcement.created_at,
      updatedAt: announcement.updated_at,
      authorId: announcement.author_id,
      authorName: authorMap.get(announcement.author_id) || 'Unknown'
    }));

    return NextResponse.json(transformedAnnouncements);
  } catch (error) {
    console.error('Error in GET /api/announcements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/announcements - Create new announcement (admin only)
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await CustomAuth.verifySession(sessionToken);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ 
        error: 'Missing required fields: title and content are required' 
      }, { status: 400 });
    }

    // Validate field lengths
    if (title.length > 255) {
      return NextResponse.json({ 
        error: 'Title must be 255 characters or less' 
      }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json({ 
        error: 'Content must be 5000 characters or less' 
      }, { status: 400 });
    }

    const { data: announcement, error } = await supabaseService
      .from('announcements')
      .insert({
        title: title.trim(),
        content: content.trim(),
        author_id: session.id
      })
      .select(`
        id,
        title,
        content,
        created_at,
        updated_at,
        author_id
      `)
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
    }

    if (!announcement) {
      return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
    }

    // Get the author name
    const { data: author } = await supabaseService
      .from('users')
      .select('name')
      .eq('id', session.id)
      .single();

    // Transform the data to match the expected structure
    const transformedAnnouncement = {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      createdAt: announcement.created_at,
      updatedAt: announcement.updated_at,
      authorId: announcement.author_id,
      authorName: author?.name || 'Unknown'
    };

    // Send push notification to all subscribed users
    try {
      const notificationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        },
        body: JSON.stringify({
          title: `📢 ${announcement.title}`,
          body: announcement.content.length > 100 
            ? `${announcement.content.substring(0, 97)}...` 
            : announcement.content,
          icon: '/android-chrome-192x192.png',
          badge: '/favicon-32x32.png',
          url: '/dashboard?tab=announcements'
        })
      });

      if (!notificationResponse.ok) {
        console.error('Failed to send push notifications:', await notificationResponse.text());
      } else {
        const notificationResult = await notificationResponse.json();
        console.log('Push notifications sent:', notificationResult);
      }
    } catch (notificationError) {
      console.error('Error sending push notifications:', notificationError);
      // Don't fail the announcement creation if push notifications fail
    }

    return NextResponse.json(transformedAnnouncement, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/announcements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
