import { NextRequest, NextResponse } from 'next/server';
import { CustomAuth } from '@/lib/custom-auth';
import { supabaseService } from '@/lib/supabase';

// GET /api/announcements/[id] - Get single announcement
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { data: announcement, error } = await supabaseService
      .from('announcements')
      .select(`
        id,
        title,
        content,
        created_at,
        updated_at,
        author_id
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (error) {
      console.error('Error fetching announcement:', error);
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // Get the author name
    const { data: author } = await supabaseService
      .from('users')
      .select('name')
      .eq('id', announcement.author_id)
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

    return NextResponse.json(transformedAnnouncement);
  } catch (error) {
    console.error('Error in GET /api/announcements/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/announcements/[id] - Update announcement (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
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

    // Check if announcement exists
    const { data: existingAnnouncement, error: checkError } = await supabaseService
      .from('announcements')
      .select('id')
      .eq('id', resolvedParams.id)
      .single();

    if (checkError || !existingAnnouncement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    const { data: announcement, error } = await supabaseService
      .from('announcements')
      .update({
        title: title.trim(),
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id)
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
      console.error('Error updating announcement:', error);
      return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
    }

    if (!announcement) {
      return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
    }

    // Get the author name
    const { data: author } = await supabaseService
      .from('users')
      .select('name')
      .eq('id', announcement.author_id)
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

    return NextResponse.json(transformedAnnouncement);
  } catch (error) {
    console.error('Error in PUT /api/announcements/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/announcements/[id] - Delete announcement (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await CustomAuth.verifySession(sessionToken);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Check if announcement exists
    const { data: existingAnnouncement, error: checkError } = await supabaseService
      .from('announcements')
      .select('id')
      .eq('id', resolvedParams.id)
      .single();

    if (checkError || !existingAnnouncement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    const { error } = await supabaseService
      .from('announcements')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      console.error('Error deleting announcement:', error);
      return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/announcements/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
