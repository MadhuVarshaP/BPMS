"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/Cards";
import { Badge, Button } from "@/components/UI";
import {
    Zap,
    History,
    RefreshCw,
    ShieldCheck,
    Terminal,
    Cpu,
    Activity,
    CheckCircle2,
    XCircle,
    Clock,
    ExternalLink,
    Lock,
    Loader2,
    Database
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { INSTALL_LOGS, PATCHES } from "@/data/mockData";

export default function DeviceSync() {
    const { address } = useWallet();
    const [isSyncing, setIsSyncing] = useState(false);
    const myLogs = INSTALL_LOGS.filter(l => l.device.toLowerCase() === address?.toLowerCase());

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 3000);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black text-white leading-tight tracking-tight tracking-tighter">Synchronization Protocol</h1>
                    <p className="text-slate-400 font-medium font-inter">Monitor live heartbeat and pull latest certified builds from the registry.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Live Sync Status Card */}
                    <Card title="Pulse Monitoring" subtitle="Network heartbeat and block verification.">
                        <div className="space-y-10 pt-4">
                            <div className="flex flex-col items-center justify-center py-12 relative">
                                {/* Visual Pulse Animation */}
                                <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                                <div className={`p-8 rounded-[40px] bg-slate-900 border border-emerald-500/20 shadow-2xl transition-all duration-700 ${isSyncing ? "scale-110 shadow-emerald-500/20 border-emerald-500/50" : ""}`}>
                                    <Zap size={64} className={`text-emerald-500 transition-all ${isSyncing ? "animate-pulse" : "opacity-40"}`} />
                                </div>

                                <div className="mt-10 text-center space-y-3">
                                    <h3 className="text-3xl font-black text-white tracking-tighter">
                                        {isSyncing ? "Synchronizing Artifacts" : "Operational & Secure"}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] px-4 py-1.5 bg-slate-900 border border-white/5 rounded-full mx-auto w-fit">
                                        Lat: 14.2ms | Peer: 0x8932...C921
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                                <Button
                                    onClick={handleSync}
                                    isLoading={isSyncing}
                                    className="rounded-xl py-6 font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-500/20"
                                >
                                    Initialize Pull
                                </Button>
                                <Button variant="outline" className="rounded-xl py-6 font-black uppercase tracking-widest border-white/10 text-slate-400">
                                    Force Verify Hash
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Detailed Sync Timeline */}
                    <div className="space-y-6">
                        <Card title="Activity Progression" className="h-full">
                            <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-white/5">
                                {isSyncing ? (
                                    <div className="space-y-6">
                                        {[
                                            { status: "Processing", label: "Resolving IPFS Gateway", active: true },
                                            { status: "Waiting", label: "Verifying Merkle Roots", active: false },
                                            { status: "Waiting", label: "Validating Distributor Signature", active: false },
                                        ].map((step, i) => (
                                            <div key={i} className="flex gap-6 relative animate-fade-in" style={{ animationDelay: `${i * 200}ms` }}>
                                                <div className={`w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center z-10 ${step.active ? "bg-emerald-500" : "bg-slate-800"}`}>
                                                    {step.active ? <Loader2 size={12} className="text-white animate-spin" /> : <div className="h-1 w-1 bg-slate-500 rounded-full" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-xs font-bold uppercase tracking-widest ${step.active ? "text-emerald-500" : "text-slate-500"}`}>{step.label}</p>
                                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">{step.status}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {myLogs.slice(0, 4).map((log, i) => (
                                            <div key={i} className="flex gap-6 relative group">
                                                <div className={`w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center z-10 ${log.status === "success" ? "bg-emerald-500" : "bg-rose-500"}`}>
                                                    {log.status === "success" ? <CheckCircle2 size={12} className="text-white" /> : <XCircle size={12} className="text-white" />}
                                                </div>
                                                <div className="flex-1 group-hover:pl-2 transition-all">
                                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                                        <span className="text-white tracking-tight">Patch #P00{log.patchId} Sync</span>
                                                        <span className="text-[10px] text-slate-600 font-mono">{log.timestamp}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Status: {log.status.toUpperCase()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>

                        <div className="glass-dark p-6 rounded-2xl border border-white/5 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                                    <Database size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-1">Decentralized Storage</h4>
                                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed font-inter">Connected to IPFS multi-address. Data availability verification: PASSED.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
