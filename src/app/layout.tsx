import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js Voice Agent - Deepgram",
  description: "Real-time voice agent powered by Deepgram's speech-to-text and text-to-speech technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {children}
      </body>
    </html>
  );
}
