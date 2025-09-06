import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { generateToken } from '@/libs/authenticate';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const token = generateToken();

        const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/token-gate/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));
        return new NextResponse(JSON.stringify(data), {
            status: res.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        return NextResponse.json({
            success: false,
            message: 'Internal server error',
            statusCode: 500,
        }, { status: 500 });
    }
}


