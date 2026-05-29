import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { number, countryCode } = await request.json();
    if (!number || !countryCode) {
      return NextResponse.json({ success: false, error: 'Phone number and country code are required.' }, { status: 400 });
    }

    const cleanCode = countryCode.replace('+', '');
    const cleanNumber = number.replace(/\D/g, '');
    const fullNumber = `${cleanCode}${cleanNumber}`;

    const accessKey = '2ab9aef83075890cc5d9d7b814313d2e';
    // Note: numverify free plan only supports http
    const url = `http://apilayer.net/api/validate?access_key=${accessKey}&number=${fullNumber}&country_code=${cleanCode}&format=1`;

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Numverify verification service unavailable' }, { status: 500 });
    }

    const data = await res.json();
    console.log('[Numverify Response]', data);

    if (data.error) {
      return NextResponse.json({ success: false, error: data.error.info || 'Verification failed' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      valid: data.valid,
      localNumber: data.local_format,
      carrier: data.carrier,
      lineType: data.line_type
    });
  } catch (error: any) {
    console.error('Numverify API Route Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
