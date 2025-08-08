"use client";

export const Mic = ({ state }: { state: "open" | "closed" | "loading"}) => {
  if (state === "loading") {
    return <div>Loading...</div>;
  }
    if (state === "closed") {
    return <div>Mic is closed</div>;
  }

  const microphone = window.navigator.mediaDevices.getUserMedia({ audio: true });
    microphone.then(stream => {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        // Here you can add more audio processing if needed
    }).catch(error => {
        console.error("Error accessing microphone:", error);
    });
}