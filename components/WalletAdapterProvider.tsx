"use client";

import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useEffect, useMemo } from "react";
import { env } from "@/env";

function WalletEventBridge() {
    const { connected, publicKey, wallet } = useWallet();

    useEffect(() => {
        try {
            if (connected) {
                window.dispatchEvent(
                    new CustomEvent("wallet-adapter-connected", {
                        detail: {
                            walletName: wallet?.adapter?.name,
                            publicKey: publicKey?.toBase58?.(),
                        },
                    })
                );
            } else {
                window.dispatchEvent(
                    new CustomEvent("wallet-adapter-disconnected", {
                        detail: {
                            walletName: wallet?.adapter?.name,
                        },
                    })
                );
            }
        } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
            // no-op
        }
    }, [connected, publicKey, wallet]);

    return null;
}

export function WalletAdapterProvider({ children }: { children: React.ReactNode }) {
    const endpoint = env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider
                wallets={wallets}
                autoConnect
                onError={(error) => {
                    try {
                        window.dispatchEvent(
                            new CustomEvent("wallet-adapter-error", {
                                detail: { name: error?.name, message: error?.message },
                            })
                        );
                    } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
                        // no-op
                    }
                }}
            >
                <WalletModalProvider>
                    <WalletEventBridge />
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
