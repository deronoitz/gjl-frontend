import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';

// Create admin client for operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all albums
export async function GET() {
  try {
    const { data: albums, error } = await supabaseAdmin
      .from('albums')
      .select(`
        *,
        users!albums_author_id_fkey(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching albums:', error);
      return NextResponse.json(
        { error: 'Failed to fetch albums' },
        { status: 500 }
      );
    }

    return NextResponse.json(albums);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new album
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const driveUrl = formData.get('driveUrl') as string;
    const coverImage = formData.get('coverImage') as File;
    const authorId = formData.get('authorId') as string;

    if (!title || !driveUrl || !authorId) {
      return NextResponse.json(
        { error: 'Title, drive URL, and author ID are required' },
        { status: 400 }
      );
    }

    let coverImageUrl = '';

    // Upload cover image if provided
    if (coverImage && coverImage.size > 0) {
      const fileExt = coverImage.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Convert File to ArrayBuffer then to base64
      const arrayBuffer = await coverImage.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('album-covers')
        .upload(fileName, decode(base64), {
          contentType: coverImage.type,
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload cover image' },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('album-covers')
        .getPublicUrl(uploadData.path);

      coverImageUrl = urlData.publicUrl;
    }

    // Create album record
    const { data: album, error: dbError } = await supabaseAdmin
      .from('albums')
      .insert([
        {
          title,
          drive_url: driveUrl,
          cover_image_url: coverImageUrl,
          author_id: authorId,
        },
      ])
      .select(`
        *,
        users!albums_author_id_fkey(name)
      `)
      .single();

    if (dbError) {
      console.error('Error creating album:', dbError);
      return NextResponse.json(
        { error: 'Failed to create album' },
        { status: 500 }
      );
    }

    return NextResponse.json(album, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
