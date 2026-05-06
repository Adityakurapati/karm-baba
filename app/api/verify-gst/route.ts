// app/api/verify-gst/route.ts

import { verifyGST } from '@/lib/sandbox';

export async function POST(req: Request) {
  try {
    const { gstin } = await req.json();

    console.log('[API] GST Request:', gstin);

    const result = await verifyGST(gstin);

    return Response.json(result);
  } catch (err: any) {
    console.error('[API] Error:', err.message);

    return Response.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}