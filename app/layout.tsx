import type { Metadata } from "next";
import { WalletAdapterProvider } from "@/components/WalletAdapterProvider";
import { ToasterProvider } from "@/components/ToasterProvider";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { body, heading, dialogue } from "@/app/fonts/fonts";
import { HeaderControls } from "@/components/HeaderControls";

export const metadata: Metadata = {
  title: "Cryptidz Token Gate",
  description: "Securely connect your wallet to verify $CRYPTIDZ holdings.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      noarchive: true,
      nosnippet: true,
      notranslate: true,
      'max-snippet': -1,
      'max-image-preview': 'none',
      'max-video-preview': -1,
    },
  },
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
