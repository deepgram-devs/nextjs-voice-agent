"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { type AgentLiveClient } from "@deepgram/sdk";
import { voiceAgentLog } from "@/app/lib/Logger";

interface MicProps {
  state: "open" | "closed" | "loading";
  client?: AgentLiveClient | null;
  onError?: (error: string) => void;
}

/**
 * Real-time microphone streaming component
 * Captures audio at 24kHz and sends linear16 PCM data to Deepgram agent
 */
export const Mic = ({ state, client, onError }: MicProps) => {
  // Recording state and audio processing refs
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isRecordingRef = useRef(false);

  // === RECORDING CONTROL ===
  const startRecording = useCallback(async () => {
    try {
      voiceAgentLog.microphone("Starting real-time microphone streaming...");

      // Get microphone access - targeting 24kHz to match agent config
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000, // Match agent configuration
          channelCount: 1
        }
      });

      streamRef.current = stream;

      // Create audio context at 24kHz to match Deepgram agent expectation
      const audioContext = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      // Create audio source from microphone stream
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Create script processor for real-time audio processing
      // Using 2048 buffer size for lower latency
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      // Real-time audio processing callback
      processor.onaudioprocess = (audioProcessingEvent) => {
        if (!client) return;

        const inputBuffer = audioProcessingEvent.inputBuffer;
        const inputData = inputBuffer.getChannelData(0); // Get mono channel

        // Convert Float32Array directly to Int16Array (linear16 format) at 24kHz
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          // Scale to 16-bit range and clamp
          const sample = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = Math.round(sample * 0x7FFF);
        }

        // Send raw PCM data as ArrayBuffer directly to agent
        const audioBuffer = pcmData.buffer;

        try {
          client.send(audioBuffer);
        } catch (error) {
          voiceAgentLog.error(`Error sending audio to agent: ${error}`);
          onError?.(`Error sending audio: ${error}`);
        }
      };

      // Connect the audio graph: microphone -> processor -> destination
      source.connect(processor);
      processor.connect(audioContext.destination);

      isRecordingRef.current = true;
      setIsRecording(true);
      voiceAgentLog.microphone("Real-time microphone streaming started at 24kHz");

    } catch (error) {
      voiceAgentLog.error(`Error starting microphone: ${error}`);
      onError?.(`Microphone access error: ${error}`);
    }
  }, [client, onError]);

  const stopRecording = useCallback(() => {
    voiceAgentLog.microphone("Stopping microphone streaming...");

    // Disconnect audio graph
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    isRecordingRef.current = false;
    setIsRecording(false);
    voiceAgentLog.microphone("Microphone streaming stopped");
  }, []);

  // === STATE MANAGEMENT ===
  // Auto-start/stop recording based on connection state
  useEffect(() => {
    if (state === "open" && client && !isRecordingRef.current) {
      startRecording();
    } else if (state === "closed" && isRecordingRef.current) {
      stopRecording();
    }

    // Cleanup on unmount only
    return () => {
      if (isRecordingRef.current) {
        stopRecording();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, client]); // Intentionally excluding function deps to prevent infinite loop

  // === UI RENDER ===
  if (state === "loading") {
    return (
      <div className="dg-status dg-status--warning">
        🎤 Loading microphone...
      </div>
    );
  }

  if (state === "closed") {
    return (
      <div className="dg-status dg-status--info">
        🔇 Microphone disconnected
      </div>
    );
  }

  return (
    <div className={`dg-status ${isRecording ? 'dg-status--success' : 'dg-status--primary'}`}>
      {isRecording ? (
        <>🎙️ Streaming audio to agent (24kHz linear16)</>
      ) : (
        <>🎤 Microphone ready for real-time streaming</>
      )}
    </div>
  );
};