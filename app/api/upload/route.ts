import { NextRequest, NextResponse } from 'next/server';

// Ensure this route is dynamic so it can process multipart form data
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const gstin = formData.get('gstin') as string | null;
    const keyOverride = formData.get('key') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const bucketName = process.env.NEXT_PUBLIC_R2_BUCKET_NAME;
    const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

    if (!accountId || !apiToken || !bucketName) {
      return NextResponse.json(
        { success: false, error: 'Cloudflare R2 keys missing in environment variables. Upload skipped for dummy testing.' },
        { status: 500 }
      );
    }

    const fileBuffer = await file.arrayBuffer();

    // Generate unique filename
    const extension = file.name.split('.').pop() || 'bin';
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key =
      keyOverride ||
      `gst-documents/${gstin || 'unknown'}-${Date.now()}-${sanitizedName}`;

    // Upload via Cloudflare R2 REST API (uses API token, no S3 SDK needed)
    const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${key}`;

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('R2 Upload Error:', uploadResponse.status, errorText);
      throw new Error(`Upload failed: ${uploadResponse.status} — ${errorText}`);
    }

    const finalUrl = publicUrl ? `${publicUrl}/${key}` : `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;

    return NextResponse.json({
      success: true,
      url: finalUrl,
      fileName: key,
    });
  } catch (error: any) {
    console.error('R2 Upload Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload document' },
      { status: 500 }
    );
  }
}
