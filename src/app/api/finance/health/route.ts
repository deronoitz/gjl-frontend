import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ 
      status: 'ok',
      message: 'Finance API endpoints are available',
      endpoints: {
        'GET /api/financial-records': 'List financial records with filtering',
        'POST /api/financial-records': 'Create new financial record',
        'GET /api/financial-records/[id]': 'Get single financial record',
        'PUT /api/financial-records/[id]': 'Update financial record',
        'DELETE /api/financial-records/[id]': 'Delete financial record',
        'POST /api/upload-proof': 'Upload payment proof file',
        'DELETE /api/upload-proof': 'Delete payment proof file',
        'GET /api/house-blocks': 'Get house blocks and users for dropdown'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Finance API health check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
