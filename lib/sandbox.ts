// lib/sandbox-gst.ts
// ⚠️  SERVER-SIDE ONLY — never import this in a client component or page

const BASE_URL = 'https://api.sandbox.co.in';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// ─── Token cache (in-memory, reused for 24 hrs) ──────────────────────────────
let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAuthToken(): Promise<string> {
  // Return cached token if it has more than 5 minutes left
  if (tokenCache && Date.now() < tokenCache.expiresAt - 5 * 60 * 1000) {
    return tokenCache.token;
  }

  const apiKey    = process.env.QUICKO_API_KEY;
  const apiSecret = process.env.QUICKO_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('QUICKO_API_KEY or QUICKO_API_SECRET is not set in environment variables.');
  }

  const res = await fetch(`${BASE_URL}/authenticate`, {
    method: 'POST',
    headers: {
      'x-api-key':     apiKey,
      'x-api-secret':  apiSecret,
      'x-api-version': '1.0',
      'Content-Type':  'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sandbox auth failed [${res.status}]: ${body}`);
  }

  const json = await res.json();

  // Sandbox returns access_token + expires_in (seconds) or a timestamp
  const token     = json.access_token as string;
  // Default to 24 h if expiry not provided
  const expiresIn = (json.expires_in ?? 86400) * 1000;

  tokenCache = { token, expiresAt: Date.now() + expiresIn };
  return token;
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface GSTVerificationResult {
  success: boolean;
  data?: {
    gstin:            string;
    legalName:        string;
    tradeName:        string;
    registrationDate: string;
    status:           string;
    address:          string;
    type:             string;
    stateCode:        string;
    pan:              string;
  };
  error?: string;
}

export interface PanAadhaarStatusResult {
  success: boolean;
  aadhaarSeedingStatus?: string;
  message?: string;
  error?: string;
}

// ─── Address helper ───────────────────────────────────────────────────────────
function buildAddress(pradr: any): string {
  const a = pradr?.addr ?? {};
  return [a.bno, a.bnm, a.flno, a.st, a.loc, a.dst, a.stcd, a.pncd]
    .filter(Boolean)
    .join(', ');
}

// ─── Mock (used when credentials are absent) ──────────────────────────────────
async function mockVerifyGST(gstin: string): Promise<GSTVerificationResult> {
  await new Promise((r) => setTimeout(r, 800)); // simulate latency
  if (!GSTIN_REGEX.test(gstin)) {
    return { success: false, error: 'Invalid GSTIN format.' };
  }
  return {
    success: true,
    data: {
      gstin,
      legalName:        'KARM BABA GLOBAL SOLUTIONS PRIVATE LIMITED',
      tradeName:        'KARM BABA',
      registrationDate: '2021-05-12',
      status:           'Active',
      address:          '123, Executive Plaza, Mumbai, Maharashtra, 400001',
      type:             'Private Limited Company',
      stateCode:        gstin.substring(0, 2),
      pan:              gstin.substring(2, 12),
    },
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function verifyGST(gstin: string): Promise<GSTVerificationResult> {
  // 1. Validate format before spending any API quota
  const normalised = gstin.trim().toUpperCase();
  if (!GSTIN_REGEX.test(normalised)) {
    return { success: false, error: 'Invalid GSTIN format. Must be 15 characters (e.g. 27AAPFU0939F1ZV).' };
  }

  // 2. Fall back to mock when credentials are missing (local dev without .env)
  const apiKey    = process.env.QUICKO_API_KEY;
  const apiSecret = process.env.QUICKO_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.warn('[sandbox-gst] Credentials not set — using mock data.');
    return mockVerifyGST(normalised);
  }

  try {
    // 3. Get (or reuse cached) auth token
    const authToken = await getAuthToken();

    // 4. Call the GSTIN search endpoint
    const res = await fetch(`${BASE_URL}/gst/compliance/public/gstin/search`, {
      method: 'POST',
      headers: {
        'Authorization':  authToken,
        'x-api-key':      apiKey,
        'Content-Type':   'application/json',
        'Accept':         'application/json',
      },
      body: JSON.stringify({ gstin: normalised }),
    });

    const json = await res.json();

    // 5. Parse response — Sandbox wraps the actual data one level deeper
    if (res.ok && json.code === 200) {
      const d = json.data?.data ?? json.data; // handle both shapes
      return {
        success: true,
        data: {
          gstin:            d.gstin,
          legalName:        d.lgnm,
          tradeName:        d.tradeNam ?? d.trade_nam ?? d.lgnm,
          registrationDate: d.rgdt,
          status:           d.sts,
          address:          buildAddress(d.pradr),
          type:             d.ctb,
          stateCode:        d.pradr?.addr?.stcd || d.gstin.substring(0, 2),
          pan:              d.gstin.substring(2, 12),
        },
      };
    }

    // 6. API returned an error payload
    return {
      success: false,
      error: json.message ?? `Verification failed (code ${json.code ?? res.status}).`,
    };

  } catch (err: any) {
    console.error('[sandbox-gst] Error:', err?.message ?? err);
    return {
      success: false,
      error: 'Network or server error during verification. Please try again.',
    };
  }
}

// ─── PAN Helpers ──────────────────────────────────────────────────────────────

export function extractPANFromGSTIN(gstin: string): string {
  if (gstin.length < 12) return '';
  return gstin.substring(2, 12);
}

/**
 * MOCK: Simulates extraction of PAN from a document.
 * In production, this would call an OCR API.
 */
export async function extractPANFromDocument(file: File, expectedPan?: string): Promise<{ pan: string | null; error?: string }> {
  await new Promise(r => setTimeout(r, 1500)); // simulate OCR processing
  
  // For demo/mock purposes, we'll "extract" the correct PAN if it's provided as expected
  // In a real scenario, this would use Tesseract.js or a cloud OCR service.
  if (file.name.toLowerCase().includes('fail')) {
    return { pan: 'ABCDE1234F', error: 'OCR mismatch: Extracted PAN does not match records.' };
  }
  
  return { pan: expectedPan || 'ABCDE1234F' };
}

/**
 * Verifies if a PAN is seeded with Aadhaar.
 */
export async function verifyPanAadhaarStatus(pan: string, aadhaar: string): Promise<PanAadhaarStatusResult> {
  const apiKey    = process.env.QUICKO_API_KEY;
  const apiSecret = process.env.QUICKO_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.warn('[sandbox-pan-aadhaar] Credentials not set — using mock data.');
    await new Promise(r => setTimeout(r, 1000));
    return { 
      success: true, 
      aadhaarSeedingStatus: 'y', 
      message: 'Mocked: PAN is linked to Aadhaar Number XXXX XXXX 9999.' 
    };
  }

  try {
    const authToken = await getAuthToken();
    const res = await fetch(`${BASE_URL}/kyc/pan-aadhaar/status`, {
      method: 'POST',
      headers: {
        'Authorization':  authToken,
        'x-api-key':      apiKey,
        'Content-Type':   'application/json',
      },
      body: JSON.stringify({
        "@entity": "in.co.sandbox.kyc.pan_aadhaar.status",
        "pan": pan,
        "aadhaar_number": aadhaar,
        "consent": "y",
        "reason": "KARM BABA Verification"
      }),
    });

    const json = await res.json();
    if (res.ok && json.code === 200) {
      return {
        success: true,
        aadhaarSeedingStatus: json.data?.aadhaar_seeding_status,
        message: json.data?.message
      };
    }
    return { success: false, error: json.message || 'PAN-Aadhaar verification failed.' };
  } catch (err: any) {
    console.error('[sandbox-pan-aadhaar] Error:', err?.message ?? err);
    return { success: false, error: 'Network error during PAN-Aadhaar verification.' };
  }
}