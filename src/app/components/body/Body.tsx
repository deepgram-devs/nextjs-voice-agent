"use client";

import { ListenModel, SpeechModel, ThinkModel } from "@/app/lib/Models"
import { Mic } from "../mic/Mic";
import Styles from "./Body.module.css";
import { useState } from "react";
import { AgentEvents, DeepgramClient, type AgentLiveClient } from "@deepgram/sdk";

export const Body = () => {
    const [micState, setMicState] = useState<"open" | "loading" | "closed">("closed");
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [connected, setConnected] = useState<boolean>(false);
    const [listenModel, setListenModel] = useState<ListenModel>(ListenModel.General);
    const [thinkModel, setThinkModel] = useState<ThinkModel>(ThinkModel.Claude);
    const [speechModel, setSpeechModel] = useState<SpeechModel>(SpeechModel.Thalia);
    const [client, setClient] = useState<AgentLiveClient | null>(null);

    const transcript: string[] = [];
    let audioBuffer: Uint8Array[] = [
        // initialise with wav headers
        new Uint8Array([82, 73, 70, 70, 0, 0, 0, 0, 87, 65, 86, 69, 102, 109, 116, 32]) // RIFF header for WAV
    ];
    const authenticate = () => {
        fetch("/api/token", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(async response => {
            if (response.ok) {
                const data = await response.json();
                setToken(data.token);
            } else {
                const errorText = await response.text();
                setError(`Authentication failed: ${errorText}`);
            }
        }).catch((error) => {
            setError(`Authentication failed: ${error.message}`);
        })
    }

    const disconnect = () => {
        if (!client) {
            setError("No client connected to disconnect.");
            return;
        }
        client.disconnect();
        setClient(null);
        setConnected(false);
        setMicState("closed");
        setToken(null);
        setError(null);
        console.log("Disconnected from Deepgram agent.");
    }

    const connect = () => {
        if (!token) {
            setError("No token available. Please authenticate first.");
            return;
        }

        const client = new DeepgramClient({accessToken: token}).agent();
        setClient(client);
        client.once(AgentEvents.Welcome, () => {
            console.log("Connected to Deepgram agent.");
            const settings = {
            audio: {
                output: {
                    encoding: "linear16",
                    container: "none",
                    sample_rate: 16000,
                }
            },
            agent: {
                greeting: "Welcome to the Next.js Voice Agent Demo. How can I assist you today?",
                listen: {
                    provider: {
                        type: "deepgram",
                        model: listenModel,
                    }
                },
                speak: {
                    provider: {
                        type: "deepgram",
                        model: speechModel
                    }
                },
                think: {
                    provider: {
                        type: thinkModel === ThinkModel.Claude ? "anthropic" : "open_ai",
                        model: thinkModel
                    }
                }
            }
        }
            console.log("Applying agent settings:", settings);
            client.configure(settings)
        })
        client.once(AgentEvents.SettingsApplied, () => {
            console.log("Agent settings applied.");
            setConnected(true);
            setMicState("open");
            client.keepAlive();
        })
        client.on(AgentEvents.Error, (error) => {
            console.error("Agent error:", error);
            setError(`Agent error: ${error.message}`);
        })
        client.on(AgentEvents.Audio, async (audio: Uint8Array) => {
            console.log("Received audio from agent.");
            console.log(audio instanceof Uint8Array ? "Audio is a Uint8Array" : "Audio is not a Uint8Array");
            audioBuffer.push(audio);
        })
        client.on(AgentEvents.AgentAudioDone, async () => {
            const audioContext = new AudioContext();
            const blob = new Blob(audioBuffer, { type: "audio/wav" });
            const arrayBuffer = await blob.arrayBuffer();
            audioContext.decodeAudioData(arrayBuffer, (buffer) => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
            source.onended = () => {
                console.log("Audio playback finished.");
                audioBuffer = [new Uint8Array([82, 73, 70, 70, 0, 0, 0, 0, 87, 65, 86, 69, 102, 109, 116, 32])]; // Reset audio buffer
            }
            }, (decodeError) => {
                setError(`Error decoding audio: ${decodeError.message}`);
            });
        })
        client.on(AgentEvents.ConversationText, (text) => {
            transcript.push(text);
        })
    }



   
  return (
    <main className={Styles.body}>
        {error && <div className={Styles.error}>{error}</div>}
        <Mic state={micState} />
        { !token && (
            <button className={Styles.connectButton} onClick={authenticate}>
                Authenticate
            </button>
        )}
        { token && !connected && (
            <form>
            <h2 className={Styles.heading}>Configuration</h2>
            <label>
                Listen Model:
                <select name="listen" value={listenModel} onChange={(e) => setListenModel(e.target.value as ListenModel)}>
                    <option value={ListenModel.General}>General Purpose</option>
                    <option value={ListenModel.Medical}>Medical</option>
                </select>
            </label>
            <label>
                Think Model:
                <select name="think" value={thinkModel} onChange={(e) => setThinkModel(e.target.value as ThinkModel)}>
                    <option value={ThinkModel.Claude}>Claude</option>
                    <option value={ThinkModel.GPT}>GPT</option>
                </select>
            </label>
            <label>
                Speech Model:
                <select name="speech" value={speechModel} onChange={(e) => setSpeechModel(e.target.value as SpeechModel)}>
                    <option value={SpeechModel.Thalia}>Thalia</option>
                    <option value={SpeechModel.Andromeda}>Andromeda</option>
                    <option value={SpeechModel.Helena}>Helena</option>
                    <option value={SpeechModel.Apollo}>Apollo</option>
                    <option value={SpeechModel.Arcas}>Arcas</option>
                    <option value={SpeechModel.Aries}>Aries</option>
                </select>
            </label>
            <button type="button" onClick={connect}>Connect</button>
        </form>
        )}
        { connected && (
            <>
            <button className={Styles.connectButton} onClick={disconnect}>
                Disconnect
            </button>
            <h2>Transcript</h2>
            <ul>
                {transcript.map((text, index) => (
                    <li key={index}>{text}</li>
                ))}
            </ul>
            </>
        )}

    </main>
  );
}