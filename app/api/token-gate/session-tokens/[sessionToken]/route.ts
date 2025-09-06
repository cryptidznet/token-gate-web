import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { generateToken } from '@/libs/authenticate';

export async function GET(_req: NextRequest, { params }: { params: { sessionToken: string } }) {
  try {
    const { sessionToken } = params;
    if (!sessionToken || sessionToken.length < 10) {
      return NextResponse.json({ success: false, message: 'Invalid session token', statusCode: 400 }, { status: 400 });
    }

    const token = generateToken();
    const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/token-gate/session-tokens//${encodeURIComponent(sessionToken)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));
    return new NextResponse(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
    return NextResponse.json({ success: false, message: 'Internal server error', statusCode: 500 }, { status: 500 });
  }
}


