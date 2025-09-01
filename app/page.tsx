"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { Wallet, Loader2, AlertCircle, LogOut } from "lucide-react";
import { toast } from "react-toastify";

export default function Home() {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const searchParams = useSearchParams();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Extract and validate sessionToken
  useEffect(() => {
    const token = searchParams.get("session-token");
    if (token && token.length >= 10) {
      setSessionToken(token);
    }
    setIsLoading(false);
  }, [searchParams]);

  // Auto-disconnect on success 
  useEffect(() => {
    if (success && connected) {
      const timeout = setTimeout(() => {
        disconnect();
      }, 1000); // 1s delay to show success UI
      return () => clearTimeout(timeout);
    }
  }, [success, connected, disconnect]);

  const handleWalletAction = () => {
    if (connected) {
      disconnect();
    } else {
      setVisible(true);
    }
  };

  const handleVerify = async () => {
    if (!publicKey || !sessionToken || !signMessage) {
      toast.error("Wallet not connected or signing not supported.");
      return;
    }

    setLoading(true);

    try {
      new PublicKey(publicKey.toBase58());

      const message = new TextEncoder().encode(`Verify Cryptidz ownership for session ${sessionToken}`);
      const signature = await signMessage(message);

      const response = await fetch(`/api/token-gate/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          sessionToken,
          signature: Array.from(signature),
          message: Array.from(message),
        }),
      });

      if (!response.ok) throw new Error("Verification failed on server.");

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
      } else {
        toast.error(data.message || "Verification failed.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error("An error occurred during verification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-blue-500" size={48} />
          <p className="text-lg font-semibold text-black">Loading...</p>
        </div>
      </div>
    );
  }

  if (!sessionToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <p className="text-lg font-semibold text-black">Invalid Access</p>
          <p className="text-gray-600 mt-2">Please use the verification link provided in Telegram.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Cryptidz Wallet Verification</h1>

        {success ? (
          <div className="text-center">
            <p className="text-green-600 font-semibold mb-4">Verification successful! Check Telegram for your invite link.</p>
            <button
              onClick={() => window.location.href = "https://t.me/CryptidzTokenGateBot"}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Back to Telegram
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={handleWalletAction}
              disabled={loading}
              className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
            >
              {connected ? <LogOut className="mr-2" size={20} /> : <Wallet className="mr-2" size={20} />}
              {connected ? "Disconnect" : "Connect Wallet"}
            </button>

            {connected && (
              <>
                <div className="mb-4 p-3 bg-gray-100 rounded">
                  <p className="text-sm truncate">Connected: {publicKey?.toBase58()}</p>
                </div>

                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                  {loading ? "Verifying..." : "Verify Ownership"}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
