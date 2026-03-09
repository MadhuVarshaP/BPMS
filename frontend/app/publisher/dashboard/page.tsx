"use client";

import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard, Card } from "@/components/Cards";
import { Badge, Button } from "@/components/UI";
import {
    Package,
    CheckCircle2,
    XCircle,
    Activity,
    Clock,
    ExternalLink,
    PlusCircle,
    BarChart3,
    TrendingUp,
    Cpu,
    Monitor,
    ShieldCheck
} from "lucide-react";
import { PATCHES, INSTALL_LOGS, DEVICES } from "@/data/mockData";
import { useWallet } from "@/context/WalletContext";
import Link from "next/link";

export default function PublisherDashboard() {
    const { address } = useWallet();

    // Filter patches by publisher
    const myPatches = PATCHES.filter(p => p.publisher.toLowerCase() === address?.toLowerCase());
    const activePatches = myPatches.filter(p => p.active).length;
    const totalInstalls = myPatches.reduce((acc, p) => acc + p.installCount, 0);
    const avgSuccessRate = myPatches.length > 0
        ? Math.round(myPatches.reduce((acc, p) => acc + p.successRate, 0) / myPatches.length)
        : 0;

    // Recent installations of MY patches
    const myPatchIds = myPatches.map(p => p.id);
    const myRecentInstalls = INSTALL_LOGS
        .filter(log => myPatchIds.includes(log.patchId))
        .slice(0, 6);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white leading-tight tracking-tight">Publisher Terminal</h1>
                        <p className="text-slate-400 font-medium">Manage your software releases and monitor endpoint distribution.</p>
                    </div>
                    <Link href="/publisher/publish">
                        <Button size="lg" className="px-8 rounded-xl font-bold gap-2">
                            <PlusCircle size={20} />
                            Publish New Version
                        </Button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={Package}
                        label="My Patches"
                        value={myPatches.length}
                    />
                    <StatCard
                        icon={CheckCircle2}
                        label="Active Distribution"
                        value={activePatches}
                        className="border-emerald-500/10 shadow-emerald-500/5"
                    />
                    <StatCard
                        icon={Monitor}
                        label="Total Nodes"
                        value={totalInstalls.toLocaleString()}
                        trend="+12% adoption"
                        trendType="up"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Avg. Reliability"
                        value={`${avgSuccessRate}%`}
                    />
                </div>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Installations Table */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card title="Distribution Flow" subtitle="Real-time installation confirmations for your software.">
                            <div className="table-container">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th>Software</th>
                                            <th>Device Hash</th>
                                            <th>Integrity Status</th>
                                            <th>Timestamp</th>
                                            <th className="text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myRecentInstalls.length > 0 ? (
                                            myRecentInstalls.map((log, idx) => {
                                                const patch = PATCHES.find(p => p.id === log.patchId);
                                                return (
                                                    <tr key={idx} className="group hover:bg-white/[0.01]">
                                                        <td>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-white">{patch?.software}</span>
                                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">V{patch?.version}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-xs font-mono text-slate-400">
                                                            {log.device.slice(0, 10)}...{log.device.slice(-8)}
                                                        </td>
                                                        <td>
                                                            <Badge variant={log.status === "success" ? "success" : "error"}>
                                                                {log.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-xs text-slate-500 font-mono">
                                                            {log.timestamp}
                                                        </td>
                                                        <td className="text-right">
                                                            <button className="p-2 text-slate-600 hover:text-emerald-500 transition-colors">
                                                                <ExternalLink size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4 py-8">
                                                        <Activity size={32} className="text-slate-700" />
                                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Recent Distribution Events</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Link href="/publisher/patches">
                                <button className="w-full py-4 mt-6 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-emerald-400 border-t border-white/5 transition-all">
                                    Access Version History
                                </button>
                            </Link>
                        </Card>
                    </div>

                    {/* Adoption Chart Placeholder & Patch Breakdown */}
                    <div className="space-y-6">
                        <Card title="Version Performance" className="border-blue-500/10 shadow-blue-500/5">
                            <div className="space-y-6">
                                {myPatches.slice(0, 3).map((patch, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-center text-xs font-black uppercase tracking-tighter">
                                            <span className="text-slate-400">{patch.software} <span className="text-slate-600 font-bold ml-1">{patch.version}</span></span>
                                            <span className="text-blue-500">{patch.successRate}% OK</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${patch.successRate}%` }} />
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-4 border-t border-white/5">
                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-emerald-500/10 transition-all">
                                        <div className="flex items-center gap-4">
                                            <BarChart3 size={20} className="text-emerald-500" />
                                            <h4 className="text-xs font-bold text-white tracking-widest uppercase">Deep Analytics</h4>
                                        </div>
                                        <TrendingUp size={16} className="text-emerald-500 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="glass-dark p-6 rounded-2xl border border-white/5 space-y-4">
                            <div>
                                <h4 className="font-bold text-white tracking-tight flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-emerald-500" />
                                    Identity Protocol
                                </h4>
                                <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">Your wallet hash is registered as an AUTHORIZED artifact signer.</p>
                            </div>
                            <div className="bg-slate-900 border border-white/5 p-3 rounded-xl font-mono text-[10px] text-slate-400 truncate">
                                {address}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
