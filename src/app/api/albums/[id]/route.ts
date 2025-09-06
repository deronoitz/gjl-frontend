import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';

// Create admin client for operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch single album
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: album, error } = await supabaseAdmin
      .from('albums')
      .select(`
        *,
        users!albums_author_id_fkey(name)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching album:', error);
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(album);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update album
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const driveUrl = formData.get('driveUrl') as string;
    const coverImage = formData.get('coverImage') as File;

    if (!title || !driveUrl) {
      return NextResponse.json(
        { error: 'Title and drive URL are required' },
        { status: 400 }
      );
    }

    // Get current album data
    const { data: currentAlbum, error: fetchError } = await supabaseAdmin
      .from('albums')
      .select('cover_image_url')
      .eq('id', params.id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      );
    }

    let coverImageUrl = currentAlbum.cover_image_url;

    // Upload new cover image if provided
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

      // Delete old image if it exists
      if (currentAlbum.cover_image_url) {
        const oldFileName = currentAlbum.cover_image_url.split('/').pop();
        if (oldFileName) {
          await supabaseAdmin.storage
            .from('album-covers')
            .remove([oldFileName]);
        }
      }
    }

    // Update album record
    const { data: album, error: updateError } = await supabaseAdmin
      .from('albums')
      .update({
        title,
        drive_url: driveUrl,
        cover_image_url: coverImageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select(`
        *,
        users!albums_author_id_fkey(name)
      `)
      .single();

    if (updateError) {
      console.error('Error updating album:', updateError);
      return NextResponse.json(
        { error: 'Failed to update album' },
        { status: 500 }
      );
    }

    return NextResponse.json(album);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete album
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current album data to find the image file
    const { data: currentAlbum, error: fetchError } = await supabaseAdmin
      .from('albums')
      .select('cover_image_url')
      .eq('id', params.id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      );
    }

    // Delete the album record
    const { error: deleteError } = await supabaseAdmin
      .from('albums')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Error deleting album:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete album' },
        { status: 500 }
      );
    }

    // Delete the cover image file if it exists
    if (currentAlbum.cover_image_url) {
      const fileName = currentAlbum.cover_image_url.split('/').pop();
      if (fileName) {
        await supabaseAdmin.storage
          .from('album-covers')
          .remove([fileName]);
      }
    }

    return NextResponse.json(
      { message: 'Album deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
