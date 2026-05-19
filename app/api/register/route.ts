import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { validatePassword, isValidEmail, sanitizeInput } from '@/lib/validation';

const FIREBASE_API_KEY = "AIzaSyAj7RTpWvjoni-xQTJfddKJUwzdqsdCc34";
const FIREBASE_DATABASE_URL = "https://thirdeye-1e99c-default-rtdb.asia-southeast1.firebasedatabase.app";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { email, password, firstName, lastName, role } = body;

    // Sanitize inputs
    email = sanitizeInput(email);
    firstName = sanitizeInput(firstName);
    lastName = sanitizeInput(lastName);

    // 1. Backend Validation
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: 'Password does not meet security requirements' }, { status: 400 });
    }

    // 2. Create User in Firebase Auth (handles duplicate email checks automatically)
    const signUpResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });

    const signUpData = await signUpResponse.json();

    if (!signUpResponse.ok) {
      if (signUpData.error?.message === 'EMAIL_EXISTS') {
        return NextResponse.json({ error: 'Email is already in use' }, { status: 409 });
      }
      return NextResponse.json({ error: signUpData.error?.message || 'Failed to create user' }, { status: 400 });
    }

    const uid = signUpData.localId;
    const idToken = signUpData.idToken;

    // 3. Password Security: Hash the password using bcrypt before storing it in RTDB
    // (Note: Firebase Auth also securely hashes the original password internally using scrypt)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Save User Profile to Firebase Realtime Database
    const newUser = {
      id: uid,
      email,
      firstName,
      lastName,
      role,
      passwordHash: hashedPassword, // Storing hashed password as requested
      company: {
        id: `comp_${Math.random().toString(36).substring(2, 11)}`,
        name: '',
        registrationNumber: '',
        industry: '',
        location: '',
        employees: 0,
        yearEstablished: new Date().getFullYear(),
      },
      phone: '',
      credibilityScore: 50,
      verificationStatus: 'pending',
      verificationBadges: [],
      riskLevel: 'medium',
      isOnboarded: false,
      onboardingStep: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const rtdbResponse = await fetch(`${FIREBASE_DATABASE_URL}/users/${uid}.json?auth=${idToken}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });

    if (!rtdbResponse.ok) {
      // If RTDB save fails, we ideally should clean up the Auth user, but keeping it simple for now.
      return NextResponse.json({ error: 'Failed to save user profile' }, { status: 500 });
    }

    // Return successful response. The client can use the token to log in.
    return NextResponse.json({ 
      success: true, 
      user: newUser,
      token: idToken,
      expiresIn: signUpData.expiresIn
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
