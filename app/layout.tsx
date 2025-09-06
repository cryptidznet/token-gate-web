import type { Metadata } from "next";
import { WalletAdapterProvider } from "@/components/WalletAdapterProvider";
import { ToasterProvider } from "@/components/ToasterProvider";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { body, heading, dialogue } from "@/app/fonts/fonts";

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
          {children}
          <ToasterProvider />
        </WalletAdapterProvider>
      </body>
    </html>
  );
}
