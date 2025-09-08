"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter, WalletConnectWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";
import { SolanaMobileWalletAdapter, createDefaultAddressSelector, createDefaultAuthorizationResultCache } from "@solana-mobile/wallet-adapter-mobile";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { env } from "@/env";

export function WalletAdapterProvider({ children }: { children: React.ReactNode }) {
    const network = WalletAdapterNetwork.Mainnet

    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            new WalletConnectWalletAdapter({
                network: WalletAdapterNetwork.Mainnet,
                options: { projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID },
            }),
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new SolanaMobileWalletAdapter({
                appIdentity: {
                    name: 'Cryptidz',
                    uri: typeof window !== 'undefined' ? window.location.origin : 'https://cryptidz.app',
                    icon: typeof window !== 'undefined' ? `${window.location.origin}/img_logo.png` : '',
                },
                addressSelector: createDefaultAddressSelector(),
                authorizationResultCache: createDefaultAuthorizationResultCache(),
                chain: 'solana:mainnet',
                onWalletNotFound: async () => {
                    if (typeof window !== 'undefined') {
                        window.open('https://phantom.app', '_blank');
                    }
                },
            }),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
