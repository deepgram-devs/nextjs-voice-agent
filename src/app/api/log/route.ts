import { NextRequest, NextResponse } from "next/server";

interface LogRequest {
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: Record<string, unknown> | string | number | boolean | null | undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body: LogRequest = await request.json();
    const { level, message, data } = body;

    // Get timestamp
    const timestamp = new Date().toISOString();

    // Format the log message for terminal
    const logPrefix = `[${timestamp}] VOICE AGENT:`;

    // Log to terminal (server console) based on level
    switch (level) {
      case 'info':
        console.log(`${logPrefix} ${message}`, data ? JSON.stringify(data, null, 2) : '');
        break;
      case 'warn':
        console.warn(`${logPrefix} ⚠️  ${message}`, data ? JSON.stringify(data, null, 2) : '');
        break;
      case 'error':
        console.error(`${logPrefix} ❌ ${message}`, data ? JSON.stringify(data, null, 2) : '');
        break;
      default:
        console.log(`${logPrefix} ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[VOICE AGENT LOG ERROR]:', error);
    return NextResponse.json({ success: false, error: 'Failed to log message' }, { status: 500 });
  }
}
