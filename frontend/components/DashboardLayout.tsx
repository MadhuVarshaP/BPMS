"use client";

import React, { useState } from "react";
import { Sidebar, Navbar } from "./Layout";
import { useWallet } from "@/context/WalletContext";
import { useRouter } from "next/navigation";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { address, isLoading } = useWallet();
    const router = useRouter();

    // Basic client-side auth guard (mock)
    React.useEffect(() => {
        if (!isLoading && !address) {
            router.push("/");
        }
    }, [address, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                    <p className="text-emerald-500 font-medium tracking-widest uppercase text-xs">Initializing Secure Environment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

            <div className="flex flex-col min-h-screen transition-all duration-300 md:pl-20 lg:pl-[260px]">
                <Navbar setIsMobileOpen={setIsMobileOpen} />

                <main className="flex-1 pt-24 px-6 pb-12 overflow-x-hidden md:pl-12 lg:pl-16">
                    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
