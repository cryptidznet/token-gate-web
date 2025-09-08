"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter, WalletConnectWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { env } from "@/env";

export function WalletAdapterProvider({ children }: { children: React.ReactNode }) {
    const network = WalletAdapterNetwork.Mainnet;

    const endpoint = useMemo(
        () => env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network),
        [network],
    );

    const wallets = useMemo(
        () => [
            new WalletConnectWalletAdapter({
                network,
                options: { projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID },
            }),
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter({ network }),
        ],
        [network],
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
