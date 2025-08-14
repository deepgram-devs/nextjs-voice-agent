import { DeepgramClient } from "@deepgram/sdk";
import { NextResponse } from "next/server.js";

/**
 * Proxy endpoint to keep the main API key secure on the server
 * while allowing frontend components to authenticate with Deepgram services.
 */
export async function GET() {
    // This should be set in your .env.local file as DEEPGRAM_API_KEY
    const key = process.env.DEEPGRAM_API_KEY;


    if (!key) {
        return new NextResponse("Deepgram API key is not set", { status: 500 });
    }


    const client = new DeepgramClient({ key });

    // 1-hour expiration for security
    const tokenResponse = await client.auth.grantToken({ ttl_seconds: 3600 });


    if (tokenResponse.error) {
        return new NextResponse(`Error generating token: ${tokenResponse.error.message}`, { status: 500 });
    }


    const token = tokenResponse.result.access_token;


    return new NextResponse(JSON.stringify({ token }));
}