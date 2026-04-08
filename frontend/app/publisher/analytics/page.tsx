"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/Cards";
import {
    ShieldCheck,
    Monitor,
    TrendingDown,
    Database
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { apiGet } from "@/lib/api";

type Analytics = {
    totalPatches: number;
    activePatches: number;
    totalLogs: number;
    successLogs: number;
    failureLogs: number;
    successRate: number;
};

export default function PublisherAnalytics() {
    const { address } = useWallet();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);

    useEffect(() => {
        if (!address) return;
        let cancelled = false;
        async function load() {
            const data = await apiGet("/api/publisher/analytics", address);
            if (!cancelled) setAnalytics(data as Analytics);
        }
        void load();
        return () => { cancelled = true; };
    }, [address]);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black text-white leading-tight tracking-tight">Deployment Intelligence</h1>
                    <p className="text-slate-400 font-medium">Deep analytics and telemetry for your blockchain-verified artifacts.</p>
                </div>

                {/* Top Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: "Total Patches", value: analytics?.totalPatches ?? 0, icon: Monitor, color: "text-emerald-500" },
                        { label: "Active Patches", value: analytics?.activePatches ?? 0, icon: Database, color: "text-blue-500" },
                        { label: "Failures", value: analytics?.failureLogs ?? 0, icon: TrendingDown, color: "text-rose-500" },
                        { label: "Success Rate", value: `${Math.round(analytics?.successRate ?? 0)}%`, icon: ShieldCheck, color: "text-emerald-500" },
                    ].map((stat, i) => (
                        <div key={i} className="glass p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-xl bg-slate-900 ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                                    <stat.icon size={22} />
                                </div>
                            </div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 font-inter">{stat.label}</p>
                            <p className="text-3xl font-black text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card title="Installation Velocity" className="lg:col-span-2 min-h-[400px]">
                        <div className="p-6 space-y-3">
                            <p className="text-sm text-slate-300">Total Install Reports: {analytics?.totalLogs ?? 0}</p>
                            <p className="text-sm text-emerald-500">Successful Installs: {analytics?.successLogs ?? 0}</p>
                            <p className="text-sm text-rose-500">Failed Installs: {analytics?.failureLogs ?? 0}</p>
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card title="Platform Adoption">
                            <div className="p-6">
                                <p className="text-sm text-slate-300">Active publish coverage is measured from backend installation logs synced from chain.</p>
                            </div>
                        </Card>

                        <Card title="Top Target Regions">
                            <div className="p-6">
                                <p className="text-sm text-slate-300">Detailed geo analytics can be layered once device location metadata is captured consistently.</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
