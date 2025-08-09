import { DeepgramClient } from "@deepgram/sdk";
import { NextResponse } from "next/server.js";

export async function GET() {
    const key = process.env.DEEPGRAM_API_KEY;
    if (!key) {
        return new NextResponse("Deepgram API key is not set", { status: 500 });
    }
    const client = new DeepgramClient({ key });
    const tokenResponse = await client.auth.grantToken({ ttl_seconds: 3600 });
    if (tokenResponse.error) {
        return new NextResponse(`Error generating token: ${tokenResponse.error.message}`, { status: 500 });
    }
    const token = tokenResponse.result.access_token;
    return new NextResponse(JSON.stringify({ token }));
}