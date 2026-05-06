// app/api/verify-pan-aadhaar/route.ts

import { verifyPanAadhaarStatus } from '@/lib/sandbox';

export async function POST(req: Request) {
  const { pan, aadhaar } = await req.json();

  const result = await verifyPanAadhaarStatus(pan, aadhaar);

  return Response.json(result);
}