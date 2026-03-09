"use client";

import React from "react";
import { useWallet } from "@/context/WalletContext";
import { ShieldX, LogOut } from "lucide-react";
import { Button } from "@/components/UI";
import { motion } from "framer-motion";

export default function UnauthorizedPage() {
    const { address, disconnectWallet } = useWallet();

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 selection:bg-rose-500/30">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />

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
                    The wallet address <span className="text-rose-400 font-mono text-sm break-all">{address}</span> is not registered in the BPMS network. Please contact an administrator for authorization.
                </p>

                <div className="space-y-4">
                    <Button
                        onClick={disconnectWallet}
                        variant="danger"
                        className="w-full py-6 rounded-2xl text-base group"
                    >
                        <LogOut className="mr-2 group-hover:-translate-x-1 transition-transform" size={18} />
                        Disconnect Wallet
                    </Button>
                    <p className="text-xs text-slate-500 font-medium">Verify your registration status with the system admin</p>
                </div>
            </motion.div>
        </div>
    );
}
