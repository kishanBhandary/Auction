import { NextResponse } from 'next/server';
import { cloudinaryClient } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ ok: false, message: 'Missing file upload' }, { status: 400 });
    }

    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json({ ok: false, message: 'Unsupported image type' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > 2 * 1024 * 1024) {
      return NextResponse.json({ ok: false, message: 'Image exceeds 2MB limit' }, { status: 413 });
    }

    const buffer = Buffer.from(bytes);

    const upload = await cloudinaryClient.uploader.upload(`data:${file.type};base64,${buffer.toString('base64')}`, {
      folder: 'vpl/players',
      resource_type: 'image',
    });

    return NextResponse.json({
      ok: true,
      url: upload.secure_url,
      publicId: upload.public_id,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      message: error instanceof Error ? error.message : 'Image upload failed',
    }, { status: 500 });
  }
}
