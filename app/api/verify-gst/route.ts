// app/api/verify-gst/route.ts

import { verifyGST } from '@/lib/sandbox';

export async function POST(req: Request) {
  try {
    const { gstin } = await req.json();
    
    // Extract IP/headers for audit trail if needed
    const forwardedFor = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const timestamp = new Date().toISOString();

    console.log(`[AUDIT][GST_VERIFY] Started - GSTIN: ${gstin} | IP: ${forwardedFor} | Time: ${timestamp}`);

    const result = await verifyGST(gstin);

    if (result.success) {
      console.log(`[AUDIT][GST_VERIFY] Success - GSTIN: ${gstin} | LegalName: ${result.data?.legalName} | Status: ${result.data?.status}`);
    } else {
      console.log(`[AUDIT][GST_VERIFY] Failed - GSTIN: ${gstin} | Error: ${result.error}`);
    }

    return Response.json(result);
  } catch (err: any) {
    const timestamp = new Date().toISOString();
    console.error(`[AUDIT][GST_VERIFY] Exception - Time: ${timestamp} | Error: ${err.message}`);

    return Response.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}