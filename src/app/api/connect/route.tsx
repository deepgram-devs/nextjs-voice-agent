import { getDeepgramClient } from "@/app/lib/Deepgram";
import { type ListenModel, type SpeechModel, ThinkModel } from "@/app/lib/Models";
import { NextResponse } from "next/server.js";

export async function POST(request: { think: ThinkModel, listen: ListenModel, speech: SpeechModel }) {
    const { think, listen, speech } = request;

    const deepgram = getDeepgramClient(process.env.DEEPGRAM_API_KEY || "");

    if (!deepgram) {
        return new NextResponse("Deepgram client failed to initialise", { status: 500 });
    }

    deepgram.configure({
        audio: {
            input: {
                encoding: "linear16",
                sample_rate: 16000
            },
            output: {
                encoding: "linear16",
                sample_rate: 16000,
                container: "raw"
            }
        },
        agent: {
            listen: {
                provider: {
                    type: "deepgram",
                    model: listen
                }
            },
            speak: {
                provider: {
                    type: "deepgram",
                    model: speech
                }
            },
            think: {
                provider: {
                    type: think === ThinkModel.Claude ? "anthropic" : "open_ai",
                    model: think
                }
            }
        }
    })

    deepgram.keepAlive();

    return NextResponse.json({ success: true });
}