import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { WalletProvider } from "@/context/WalletContext";
import { ToastProvider } from "@/context/ToastContext";
import { Web3Provider } from "@/context/Web3Provider";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BPMS | Blockchain-Based Patch Management System",
  description: "Secure, decentralized patch management for enterprise-grade software distribution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${inter.variable} antialiased selection:bg-emerald-500/30`}>
        <Web3Provider>
          <ToastProvider>
            <WalletProvider>
              {children}
            </WalletProvider>
          </ToastProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
