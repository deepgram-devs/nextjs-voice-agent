"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { type AgentLiveClient } from "@deepgram/sdk";
import { voiceAgentLog } from "@/app/lib/Logger";

interface MicProps {
  state: "open" | "closed" | "loading";
  client?: AgentLiveClient | null;
  onError?: (error: string) => void;
}

export const Mic = ({ state, client, onError }: MicProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isRecordingRef = useRef(false);

  // Firefox detection
  const isFirefox = typeof window !== 'undefined' && navigator.userAgent.includes('Firefox');

  // === RECORDING CONTROL ===
  const startRecording = useCallback(async () => {
    try {
      voiceAgentLog.microphone("Starting real-time microphone streaming...");

      // Firefox-specific getUserMedia constraints
      let audioConstraints;
      if (isFirefox) {
        // Firefox ignores most constraints anyway, so use minimal approach
        audioConstraints = {
          echoCancellation: true,
          noiseSuppression: false,  // Explicitly false - but Firefox may ignore this
          // Skip other constraints that Firefox ignores
        };
        voiceAgentLog.microphone("Firefox DEBUG - Using minimal getUserMedia constraints");
      } else {
        // Chrome/Safari: Full constraints
        audioConstraints = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000, // Match agent configuration
          channelCount: 1
        };
        voiceAgentLog.microphone("Chrome/Safari: Using full getUserMedia constraints");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints
      });

      streamRef.current = stream;

      // Debug stream details for Firefox
      if (isFirefox) {
        const audioTrack = stream.getAudioTracks()[0];
        const settings = audioTrack.getSettings();
        const constraints = audioTrack.getConstraints();
        voiceAgentLog.microphone(`Firefox DEBUG - Stream settings: ${JSON.stringify(settings)}`);
        voiceAgentLog.microphone(`Firefox DEBUG - Stream constraints: ${JSON.stringify(constraints)}`);
        voiceAgentLog.microphone(`Firefox DEBUG - Stream active: ${stream.active}, track count: ${stream.getAudioTracks().length}`);
        voiceAgentLog.microphone(`Firefox DEBUG - Track state: ${audioTrack.readyState}, enabled: ${audioTrack.enabled}`);
      }

      // Firefox-specific handling for sample rate mismatch
      let audioContext;
      if (isFirefox) {
        // Firefox ignores getUserMedia sampleRate and provides 48kHz
        // Create AudioContext with no constraints to match Firefox's default
        audioContext = new AudioContext();
        voiceAgentLog.microphone(`Firefox DEBUG - AudioContext created with default settings`);
        voiceAgentLog.microphone(`Firefox DEBUG - AudioContext sample rate: ${audioContext.sampleRate}Hz, state: ${audioContext.state}`);

        // Ensure AudioContext is running
        if (audioContext.state === 'suspended') {
          voiceAgentLog.microphone("Firefox DEBUG - AudioContext suspended, attempting resume...");
          try {
            await audioContext.resume();
            voiceAgentLog.microphone(`Firefox DEBUG - AudioContext state after resume: ${audioContext.state}`);

            // Give Firefox a moment to fully initialize
            await new Promise(resolve => setTimeout(resolve, 100));
            voiceAgentLog.microphone(`Firefox DEBUG - After 100ms delay, AudioContext state: ${audioContext.state}`);
          } catch (resumeError) {
            const errorMsg = resumeError instanceof Error ? resumeError.message : String(resumeError);
            voiceAgentLog.error(`Firefox DEBUG - ❌ AudioContext resume failed: ${errorMsg}`);
            throw resumeError;
          }
        } else {
          voiceAgentLog.microphone(`Firefox DEBUG - AudioContext already running: ${audioContext.state}`);
        }
      } else {
        // Chrome/Safari: Use optimized 24kHz as requested
        audioContext = new AudioContext({ sampleRate: 24000 });
        voiceAgentLog.microphone("Chrome/Safari: Using 24kHz AudioContext to match getUserMedia constraint");
      }
      audioContextRef.current = audioContext;


      // Critical Firefox debugging - this is where the error typically occurs
      let source;
      if (isFirefox) {
        voiceAgentLog.microphone("Firefox DEBUG - About to call createMediaStreamSource...");
        try {
          source = audioContext.createMediaStreamSource(stream);
          sourceRef.current = source;
          voiceAgentLog.microphone("Firefox DEBUG - ✓ createMediaStreamSource successful!");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorName = error instanceof Error ? error.name : 'UnknownError';
          voiceAgentLog.error(`Firefox DEBUG - ❌ createMediaStreamSource failed: ${errorName}: ${errorMessage}`);
          throw error; // Re-throw to see full error handling
        }
      } else {
        source = audioContext.createMediaStreamSource(stream);
        sourceRef.current = source;
      }

      // Use 2048 buffer size for lower latency
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      if (isFirefox) {
        voiceAgentLog.microphone("Firefox DEBUG - ✓ ScriptProcessorNode created successfully");
      }


      let firefoxChunks = 0;
      processor.onaudioprocess = (audioProcessingEvent) => {
        if (!client) return;

        if (isFirefox) {
          firefoxChunks++;
          if (firefoxChunks === 1) {
            voiceAgentLog.microphone("Firefox DEBUG - ✓ Audio processing callback is firing!");
          }
        }

        const inputBuffer = audioProcessingEvent.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);

        // Firefox-specific audio data debugging
        if (isFirefox && firefoxChunks <= 3) {
          let maxSample = 0;
          let hasRealAudio = false;
          for (let i = 0; i < inputData.length; i++) {
            const abs = Math.abs(inputData[i]);
            maxSample = Math.max(maxSample, abs);
            if (abs > 0.00001) hasRealAudio = true;
          }
          voiceAgentLog.microphone(`Firefox DEBUG - Audio chunk #${firefoxChunks}: length=${inputData.length}, hasAudio=${hasRealAudio}, maxLevel=${maxSample.toFixed(8)}`);

          if (firefoxChunks === 1) {
            voiceAgentLog.microphone(`Firefox DEBUG - First 10 samples: [${Array.from(inputData.slice(0, 10)).map(s => s.toFixed(6)).join(', ')}]`);
          }
        }

        // Firefox: Downsample 48kHz to 24kHz to match Chrome/Safari
        let processedData;
        if (isFirefox) {
          // Downsample from 48kHz to 24kHz (take every other sample)
          const downsampledLength = Math.floor(inputData.length / 2);
          processedData = new Float32Array(downsampledLength);
          for (let i = 0; i < downsampledLength; i++) {
            processedData[i] = inputData[i * 2]; // Simple decimation
          }

          if (firefoxChunks <= 3) {
            voiceAgentLog.microphone(`Firefox DEBUG - Downsampled from ${inputData.length} to ${processedData.length} samples (48kHz→24kHz)`);
          }
        } else {
          // Chrome/Safari: Use original 24kHz data
          processedData = inputData;
        }

        // Convert to linear16 format for agent compatibility
        const pcmData = new Int16Array(processedData.length);
        for (let i = 0; i < processedData.length; i++) {
          // Clamp to prevent distortion
          const sample = Math.max(-1, Math.min(1, processedData[i]));
          pcmData[i] = Math.round(sample * 0x7FFF);
        }

        const audioBuffer = pcmData.buffer;

        try {
          client.send(audioBuffer);
        } catch (error) {
          voiceAgentLog.error(`Error sending audio to agent: ${error}`);
          onError?.(`Error sending audio: ${error}`);
        }
      };


      // Firefox debugging for node connections
      if (isFirefox) {
        voiceAgentLog.microphone("Firefox DEBUG - About to connect audio nodes...");
      }

      source.connect(processor);
      processor.connect(audioContext.destination);

      if (isFirefox) {
        voiceAgentLog.microphone("Firefox DEBUG - ✓ Audio nodes connected successfully");
      }

      isRecordingRef.current = true;
      setIsRecording(true);

      if (isFirefox) {
        voiceAgentLog.microphone(`Firefox DEBUG - ✓ Recording started with ${audioContext.sampleRate}Hz AudioContext`);
      } else {
        voiceAgentLog.microphone("Real-time microphone streaming started at 24kHz");
      }

    } catch (error) {
      voiceAgentLog.error(`Error starting microphone: ${error}`);
      onError?.(`Microphone access error: ${error}`);
    }
  }, [client, onError]);

  const stopRecording = useCallback(() => {
    voiceAgentLog.microphone("Stopping microphone streaming...");
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }


    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }


    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    isRecordingRef.current = false;
    setIsRecording(false);
    voiceAgentLog.microphone("Microphone streaming stopped");
  }, []);

  useEffect(() => {
    if (state === "open" && client && !isRecordingRef.current) {
      startRecording();
    } else if (state === "closed" && isRecordingRef.current) {
      stopRecording();
    }

    return () => {
      if (isRecordingRef.current) {
        stopRecording();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, client]); // Exclude function deps to prevent infinite loop


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
        <>🎙️ Streaming audio to agent ({isFirefox ? '48kHz' : '24kHz'} linear16)</>
      ) : (
        <>🎤 Microphone ready for real-time streaming</>
      )}
    </div>
  );
};