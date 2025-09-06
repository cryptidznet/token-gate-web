import type { Metadata } from "next";
import { WalletAdapterProvider } from "@/components/WalletAdapterProvider";
import { ToasterProvider } from "@/components/ToasterProvider";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { body, heading, dialogue } from "@/app/fonts/fonts";
import Image from "next/image";

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
          <div className="fixed top-4 left-4 z-50">
            <Image src="/img_logo.png" alt="Cryptidz logo" width={160} height={48} className="h-10 w-auto md:h-12" priority />
          </div>
          {children}
          <ToasterProvider />
        </WalletAdapterProvider>
      </body>
    </html>
  );
}
