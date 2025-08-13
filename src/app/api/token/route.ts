import { DeepgramClient } from "@deepgram/sdk";
import { NextResponse } from "next/server.js";

/**
 * GET /api/token
 *
 * Generates a temporary Deepgram access token for client-side API calls.
 * This endpoint acts as a proxy to keep the main API key secure on the server
 * while allowing frontend components to authenticate with Deepgram services.
 *
 * @returns {Promise<NextResponse>} JSON response containing the temporary token
 */
export async function GET() {
    // Retrieve the Deepgram API key from environment variables
    // This should be set in your .env.local file as DEEPGRAM_API_KEY
    const key = process.env.DEEPGRAM_API_KEY;

    // Validate that the API key exists
    if (!key) {
        return new NextResponse("Deepgram API key is not set", { status: 500 });
    }

    // Initialize the Deepgram client with the server-side API key
    const client = new DeepgramClient({ key });

    // Request a temporary token with 1-hour expiration (3600 seconds)
    // This token can be safely used in client-side code without exposing the main API key
    const tokenResponse = await client.auth.grantToken({ ttl_seconds: 3600 });

    // Handle any errors from the token generation process
    if (tokenResponse.error) {
        return new NextResponse(`Error generating token: ${tokenResponse.error.message}`, { status: 500 });
    }

    // Extract the access token from the response
    const token = tokenResponse.result.access_token;

    // Return the token as JSON for the client to use
    // Frontend components can use this token to make direct API calls to Deepgram
    return new NextResponse(JSON.stringify({ token }));
}