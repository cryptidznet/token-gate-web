import { env } from "@/env";
import crypto from 'node:crypto';

function generateSignature(payload: string): string {
    return crypto
        .createHmac('sha256', env.API_SECRET)
        .update(payload)
        .digest('hex');
}

function generateToken(): string {
    const timestamp = Date.now();
    const payload = `GATE:${timestamp}`;
    const signature = generateSignature(payload);
    return `${payload}:${signature}`;
}

export { generateToken };
