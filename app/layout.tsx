import type { Metadata } from "next";
import { WalletAdapterProvider } from "@/components/WalletAdapterProvider";
import { ToasterProvider } from "@/components/ToasterProvider";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { body, heading, dialogue } from "@/app/fonts/fonts";
import Image from "next/image";
import { HeaderControls } from "@/components/HeaderControls";

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
      <body className={dialogue.variable + " " + body.variable + " " + heading.variable}>
        <WalletAdapterProvider>
          <HeaderControls />
          {children}
          <ToasterProvider />
        </WalletAdapterProvider>
      </body>
    </html>
  );
}
