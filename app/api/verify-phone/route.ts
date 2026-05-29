import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    // 1. Verify with Numverify API
    const accessKey = process.env.NUMVERIFY_API_KEY;
    const numverifyUrl = `http://apilayer.net/api/validate?access_key=${accessKey}&number=${encodeURIComponent(phone)}`;

    const numverifyRes = await fetch(numverifyUrl);
    const numverifyData = await numverifyRes.json();

    if (!numverifyData.valid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid phone number format or carrier according to Numverify.'
      }, { status: 400 });
    }

    // We can't query Firebase from Edge/API directly without admin SDK unless we use REST or mock it.
    // Let's use Firebase REST API to check for uniqueness across the standard collections
    const firebaseUrl = 'https://karm-baba-default-rtdb.firebaseio.com';

    // Check users
    const usersRes = await fetch(`${firebaseUrl}/users.json?orderBy="phone"&equalTo="${phone}"`);
    const usersData = await usersRes.json();
    if (usersData && Object.keys(usersData).length > 0) {
      return NextResponse.json({ success: false, error: 'Phone number is already used by a registered user.' }, { status: 400 });
    }

    // Check organizations
    const orgsRes = await fetch(`${firebaseUrl}/organizations.json?orderBy="phoneNumber"&equalTo="${phone}"`);
    const orgsData = await orgsRes.json();
    if (orgsData && Object.keys(orgsData).length > 0) {
      return NextResponse.json({ success: false, error: 'Phone number is already used by an organization.' }, { status: 400 });
    }

    // Check businessProfiles (nested field contactInformation/contactMobileNumber might be tricky with RTDB orderBy, 
    // but let's try or just fetch all businesses. Since business count could be large, 
    // RTDB allows querying nested fields if indexed: orderBy="contactInformation/contactMobileNumber")
    const bizRes = await fetch(`${firebaseUrl}/businessProfiles.json?orderBy="contactInformation/contactMobileNumber"&equalTo="${phone}"`);
    const bizData = await bizRes.json();
    if (bizData && Object.keys(bizData).length > 0) {
      return NextResponse.json({ success: false, error: 'Phone number is already used by a business profile.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number is valid and unique.',
      details: {
        country: numverifyData.country_name,
        carrier: numverifyData.carrier,
        lineType: numverifyData.line_type
      }
    });

  } catch (error: any) {
    console.error('Error verifying phone:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
