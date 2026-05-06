// lib/sandbox.ts
// ⚠️ SERVER-SIDE ONLY

const BASE_URL = 'https://api.sandbox.co.in';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAuthToken(): Promise<string> {
  console.log('\n[GST][AUTH] 🔐 Starting authentication');

  if (tokenCache && Date.now() < tokenCache.expiresAt - 5 * 60 * 1000) {
    console.log('[GST][AUTH] ✅ Using cached token');
    return tokenCache.token;
  }

  const apiKey = process.env.QUICKO_API_KEY;
  const apiSecret = process.env.QUICKO_API_SECRET;

  console.log('[GST][ENV]', { hasKey: !!apiKey, hasSecret: !!apiSecret });

  if (!apiKey || !apiSecret) throw new Error('Missing API credentials');

  const res = await fetch(`${BASE_URL}/authenticate`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'x-api-secret': apiSecret,
      'x-api-version': '1.0',
      'Content-Type': 'application/json',
    },
  });

  const text = await res.text();
  console.log('[GST][AUTH] Status:', res.status);
  console.log('[GST][AUTH] Response:', text);

  if (!res.ok) throw new Error('Auth failed');

  const json = JSON.parse(text);

  const token = json.data?.access_token ?? json.access_token;

  tokenCache = {
    token,
    expiresAt: Date.now() + 86400 * 1000,
  };

  console.log('[GST][AUTH] ✅ Token cached successfully');
  return tokenCache.token;
}

export async function verifyGST(gstin: string) {
  console.log('\n[GST] 🚀 Verify Start:', gstin);

  const normalised = gstin.trim().toUpperCase();

  if (!GSTIN_REGEX.test(normalised)) {
    return { success: false, error: 'Invalid GST format' };
  }

  const apiKey = process.env.QUICKO_API_KEY;
  if (!apiKey) throw new Error('API KEY missing');

  const token = await getAuthToken();

  const res = await fetch(`${BASE_URL}/gst/compliance/public/gstin/search`, {
    method: 'POST',
    headers: {
      Authorization: token,
      'x-api-key': apiKey,
      'x-api-version': '1.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ gstin: normalised }),
  });

  const text = await res.text();
  console.log('[GST] Status:', res.status);
  console.log('[GST] Raw:', text);

  const json = JSON.parse(text);

  if (res.ok && json.code === 200) {
    const d = json.data?.data ?? json.data;

    return {
      success: true,
      data: {
        gstin: d.gstin,
        legalName: d.lgnm,
        tradeName: d.tradeNam ?? d.lgnm,
        registrationDate: d.rgdt,
        status: d.sts,
        address: `${d.pradr?.addr?.loc}, ${d.pradr?.addr?.dst}`,
        type: d.ctb,
        stateCode: d.pradr?.addr?.stcd,
        pan: d.gstin.substring(2, 12),
      },
    };
  }

  return { success: false, error: json.message };
}

export async function verifyPanAadhaarStatus(pan: string, aadhaar: string) {
  const apiKey = process.env.QUICKO_API_KEY;
  const token = await getAuthToken();

  const res = await fetch(`${BASE_URL}/kyc/pan-aadhaar/status`, {
    method: 'POST',
    headers: {
      Authorization: token,
      'x-api-key': apiKey!,
      'x-api-version': '1.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "@entity": "in.co.sandbox.kyc.pan_aadhaar.status",
      pan,
      aadhaar_number: aadhaar,
      consent: "y",
      reason: "Verification",
    }),
  });

  const json = await res.json();

  return {
    success: json.code === 200,
    aadhaarSeedingStatus: json.data?.aadhaar_seeding_status,
    message: json.data?.message,
    error: json.message,
  };
}