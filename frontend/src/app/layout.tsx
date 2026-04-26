import { OfflineNotification } from "@/components/notifications/OfflineNotification";
import { OfflineReadyNotification } from "@/components/notifications/OfflineReadyNotification";
import { UpdateAvailableNotification } from "@/components/notifications/UpdateAvailableNotification";
import { AuthProvider } from "@/contexts/AuthContext";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Web3 Student Lab - Blockchain Education Platform",
  description:
    "Learn blockchain development with hands-on experience using Soroban smart contracts and Stellar blockchain",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Web3 Student Lab",
  },
  formatDetection: {
    telephone: false,
  },
};

import Navbar from "@/components/layout/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>

          {/* Notification Components */}
          <OfflineReadyNotification />
          <OfflineNotification />
          <UpdateAvailableNotification />
        </AuthProvider>
      </body>
    </html>
  );
}
