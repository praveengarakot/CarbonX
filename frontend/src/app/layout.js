import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["sans-serif", "latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["monospace", "latin"],
});

export const metadata = {
  title: "CarbonX - Decentralized Carbon Credit Marketplace",
  description: "A Stellar/Soroban-powered marketplace for SMEs to verify, trade, and retire carbon credits.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-[#131313] text-[#e5e2e1] flex flex-col">{children}</body>
    </html>
  );
}
