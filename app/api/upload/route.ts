import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '../../../lib/cloudinary.ts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { file, folder = 'nexacrm' } = body;

    if (!file) {
      return NextResponse.json({ error: 'File data is required' }, { status: 400 });
    }

    const uploadResult = await uploadToCloudinary(file, folder);

    return NextResponse.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload to Cloudinary' },
      { status: 500 }
    );
  }
}
