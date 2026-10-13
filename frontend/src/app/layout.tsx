
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeSound — Your Sound, Your Space",
  description:
    "Discover music, explore new tracks, and find your vibe with VibeSound.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
