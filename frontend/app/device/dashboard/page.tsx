"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard, Card } from "@/components/Cards";
import { Badge, Button } from "@/components/UI";
import {
    Package,
    CheckCircle2,
    XCircle,
    Activity,
    Clock,
    Zap,
    ShieldCheck,
    Cpu,
    RefreshCw,
    ExternalLink,
    History,
    TrendingUp,
    Monitor,
    Search,
    AlertCircle
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { DEVICES, INSTALL_LOGS, PATCHES } from "@/data/mockData";

export default function DeviceDashboard() {
    const { address } = useWallet();
    const [isSyncing, setIsSyncing] = useState(false);

    const deviceData = DEVICES.find(d => d.address.toLowerCase() === address?.toLowerCase()) || DEVICES[0];
    const myLogs = INSTALL_LOGS.filter(l => l.device.toLowerCase() === address?.toLowerCase());
    const installedCount = myLogs.filter(l => l.status === "success").length;
    const failedCount = myLogs.filter(l => l.status === "failed").length;

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 2000);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                {/* Device Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full w-fit">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold tracking-widest text-emerald-500/90 uppercase">Secure Endpoint Protocol</span>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-white leading-tight tracking-tight tracking-tighter">Endpoint Dashboard</h1>
                            <p className="text-slate-400 font-medium font-inter">Manage software integrity and pull cryptographically signed updates.</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleSync}
                        isLoading={isSyncing}
                        size="lg"
                        className="px-12 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/10 gap-2 border-emerald-500/20 hover:scale-105 transition-all"
                    >
                        <RefreshCw size={20} className={isSyncing ? "animate-spin" : ""} />
                        Sync Now
                    </Button>
                </div>

                {/* Device Health Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <Card className="lg:col-span-1 border-white/5 bg-slate-900/40" title="Identity Token" subtitle="Authorized hardware signature.">
                        <div className="space-y-8 pt-4">
                            <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 flex flex-col gap-3">
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Device Fingerprint</p>
                                <p className="text-xs font-mono text-emerald-500/80 break-all leading-relaxed bg-[#020617] p-2 rounded-lg border border-emerald-500/5">{address}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 text-center space-y-2 group hover:bg-emerald-500/5 transition-all">
                                    <p className="text-[10px] uppercase font-bold text-slate-500">Status</p>
                                    <Badge variant="success" className="px-3 py-1 text-[10px]">REGISTERED</Badge>
                                </div>
                                <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 text-center space-y-2 group hover:bg-blue-500/5 transition-all">
                                    <p className="text-[10px] uppercase font-bold text-slate-500">Compliance</p>
                                    <p className="text-xl font-black text-white">{deviceData.compliance}%</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                                <span>Protocol Heartbeat</span>
                                <span className="text-emerald-500">Active - 14ms</span>
                            </div>
                        </div>
                    </Card>

                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <StatCard icon={Package} label="Installed Patches" value={installedCount} className="border-emerald-500/10" />
                        <StatCard icon={RefreshCw} label="Pending Updates" value={1} trend="1 Critical" trendType="down" className="border-amber-500/10" />
                        <StatCard icon={XCircle} label="Failed Attempts" value={failedCount} className="border-rose-500/10" />
                    </div>
                </div>

                {/* Content Tabs / Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Log View for Device */}
                    <Card title="Latest Synchronization Events" className="lg:col-span-2">
                        <div className="space-y-2">
                            {myLogs.slice(0, 5).map((log, i) => (
                                <div key={i} className="group p-4 rounded-2xl bg-slate-900/50 hover:bg-white/[0.02] border border-white/5 transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${log.status === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                                            {log.status === "success" ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white tracking-widest uppercase">Patch #P00{log.patchId} - Pull</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Status: {log.status}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <p className="text-[10px] font-mono text-slate-500">{log.timestamp}</p>
                                        <button className="p-2 text-slate-700 hover:text-white transition-colors">
                                            <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {myLogs.length === 0 && (
                                <div className="py-12 text-center">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No Sync History Found</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Hardware Integrity Info */}
                    <div className="space-y-6">
                        <div className="glass p-6 rounded-2xl border border-white/5 group hover:bg-emerald-500/5 transition-all">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-500 group-hover:scale-110 transition-transform">
                                    <Cpu size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white tracking-tight uppercase">Hardware ID</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Root Verifiable Identity</p>
                                </div>
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 leading-normal break-all p-3 bg-[#020617] rounded-xl border border-white/5 font-medium opacity-60">
                                UUID: 550e8400-e29b-41d4-a716-446655440000 <br />
                                FIRMWARE: V2.44.1-SEC
                            </p>
                        </div>

                        <div className="p-6 bg-slate-900/50 rounded-2x border border-white/5 space-y-4">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <History size={14} />
                                Auto-Sync History
                            </h4>
                            <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-400">Registry Heartbeat</span>
                                <span className="text-emerald-500">OPTIMAL</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-400">Last Block Verification</span>
                                <span className="text-slate-500 font-mono">3m ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
