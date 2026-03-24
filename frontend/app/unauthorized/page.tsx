"use client";

import React from "react";
import { useWallet } from "@/context/WalletContext";
import { ShieldX, LogOut } from "lucide-react";
import { Button } from "@/components/UI";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";

export default function UnauthorizedPage() {
    const { address, disconnectWallet } = useWallet();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    async function requestPublisherAccess() {
        if (!address || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const response = await fetch(`${baseUrl}/api/request/publisher`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    walletAddress: address,
                }),
            });
            const payload = (await response.json()) as { message?: string; error?: string };
            if (!response.ok) {
                showToast(payload.error || "Failed to submit request", "error");
                return;
            }
            showToast(payload.message || "Request submitted", "success");
        } catch {
            showToast("Failed to submit request", "error");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 selection:bg-rose-500/30">
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-rose-500/50 to-transparent" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-dark border border-rose-500/20 max-w-md w-full p-10 rounded-3xl text-center shadow-[0_0_50px_rgba(244,63,94,0.1)]"
            >
                <div className="bg-rose-500/10 w-20 h-20 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-8 animate-pulse">
                    <ShieldX size={40} />
                </div>

                <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Access Restricted</h1>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    The wallet address <span className="text-rose-400 font-mono text-sm break-all">{address}</span> is not registered in the BPMS network. You can request publisher access and wait for admin approval.
                </p>

                <div className="space-y-4">
                    <Button
                        onClick={requestPublisherAccess}
                        isLoading={isSubmitting}
                        className="w-full py-6 rounded-2xl text-base"
                    >
                        Request Publisher Access
                    </Button>
                    <Button
                        onClick={disconnectWallet}
                        variant="danger"
                        className="w-full py-6 rounded-2xl text-base group"
                    >
                        <LogOut className="mr-2 group-hover:-translate-x-1 transition-transform" size={18} />
                        Disconnect Wallet
                    </Button>
                    <p className="text-xs text-slate-500 font-medium">Access is granted by admin; role selection is not allowed</p>
                </div>
            </motion.div>
        </div>
    );
}
