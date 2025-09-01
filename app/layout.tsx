import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { WalletAdapterProvider } from "@/components/WalletAdapterProvider";
import { ToasterProvider } from "@/components/ToasterProvider";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cryptidz Wallet Verifier",
  description: "Securely connect your wallet to verify $CRYPTIDZ holdings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletAdapterProvider>
          {children}
          <ToasterProvider />
        </WalletAdapterProvider>
      </body>
    </html>
  );
}
