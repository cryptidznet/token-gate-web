"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter, WalletConnectWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
    SolanaMobileWalletAdapter,
    createDefaultAuthorizationResultCache,
    createDefaultAddressSelector,
} from "@solana-mobile/wallet-adapter-mobile";
import { useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import type { WalletAdapter } from "@solana/wallet-adapter-base";
import { env } from "@/env";

export function WalletAdapterProvider({ children }: { children: React.ReactNode }) {
    const network = WalletAdapterNetwork.Mainnet;

    const endpoint = useMemo(
        () => env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network),
        [network],
    );

    const wallets = useMemo(() => {
        const baseWallets: WalletAdapter[] = [
            new WalletConnectWalletAdapter({
                network,
                options: { projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID },
            }),
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter({ network }),
        ];

        const isMobileOrTablet =
            typeof window !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent,
            );

        if (isMobileOrTablet) {
            baseWallets.push(
                new SolanaMobileWalletAdapter({
                    appIdentity: {
                        name: "Cryptidz",
                        uri: typeof window !== "undefined" ? window.location.origin : undefined,
                        icon: "/favicon.ico",
                    },
                    authorizationResultCache: createDefaultAuthorizationResultCache(),
                    addressSelector: createDefaultAddressSelector(),
                    chain: 'solana:mainnet',
                    onWalletNotFound: async () => {
                        if (typeof window !== 'undefined') {
                            window.open('https://phantom.app', '_blank');
                        }
                    },
                }),
            );
        }

        return baseWallets;
    }, [network]);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
