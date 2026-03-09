"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/Cards";
import { Badge, Button } from "@/components/UI";
import {
    Package,
    Search,
    Plus,
    Trash2,
    Eye,
    ExternalLink,
    Filter,
    ChevronDown,
    Activity,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Clock,
    Ban,
    Download,
    Terminal,
    Cpu
} from "lucide-react";
import { PATCHES } from "@/data/mockData";

export default function AdminPatches() {
    const [filter, setFilter] = useState("all");

    const filteredPatches = PATCHES.filter(p => {
        if (filter === "all") return true;
        if (filter === "active") return p.active;
        if (filter === "disabled") return !p.active;
        return true;
    });

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white leading-tight tracking-tight">Patch Inventory</h1>
                        <p className="text-slate-400 font-medium">Verify software integrity and manage patch distribution across the fleet.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                placeholder="Search by ID or software..."
                                className="bg-slate-900 border border-white/5 rounded-xl px-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 w-full md:w-80 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Global Patch Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: "Active Deployments", value: PATCHES.filter(p => p.active).length, color: "text-emerald-500", icon: Activity },
                        { label: "Disabled Patches", value: PATCHES.filter(p => !p.active).length, color: "text-rose-500", icon: Ban },
                        { label: "Avg. Success", value: "93.4%", color: "text-blue-500", icon: TrendingUp },
                        { label: "New Release", value: "3d ago", color: "text-amber-500", icon: Clock },
                    ].map((stat, i) => (
                        <div key={i} className="glass p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </div>
                            <div className="p-3 bg-slate-900 rounded-xl text-slate-400">
                                <stat.icon size={20} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filtering Tabs */}
                <div className="flex items-center gap-1 bg-slate-900/50 w-fit p-1 rounded-xl border border-white/5">
                    {[
                        { label: "All Software", id: "all" },
                        { label: "Active Only", id: "active" },
                        { label: "Disabled", id: "disabled" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${filter === tab.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/10" : "text-slate-500 hover:text-slate-300"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Advanced Patches Table */}
                <Card>
                    <div className="table-container">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th>Patch ID</th>
                                    <th>Software & Version</th>
                                    <th>Publisher Address</th>
                                    <th>Distribution Status</th>
                                    <th>Total Installs / Success Rate</th>
                                    <th className="text-right">Deployment Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatches.map((patch, idx) => (
                                    <tr key={idx} className="group hover:bg-white/[0.01]">
                                        <td className="font-mono text-emerald-500 text-xs font-bold">
                                            #P00{patch.id}
                                        </td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white tracking-tight">{patch.software}</span>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Build {patch.version}</span>
                                            </div>
                                        </td>
                                        <td className="text-xs font-mono text-slate-400">
                                            {patch.publisher.slice(0, 10)}...{patch.publisher.slice(-8)}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className={`h-1.5 w-1.5 rounded-full ${patch.active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                                                <span className={`text-[11px] font-bold uppercase tracking-wider ${patch.active ? "text-emerald-500" : "text-rose-500"}`}>
                                                    {patch.active ? "Global Distribution" : "Halted & Revoked"}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-300">{patch.installCount} Nodes</span>
                                                    <span className="text-[10px] font-bold text-emerald-500">{patch.successRate}% OK</span>
                                                </div>
                                                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{ width: `${patch.successRate}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="hover:bg-blue-500/10 group/btn transition-all">
                                                    <Download size={16} className="text-slate-500 group-hover/btn:text-blue-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="hover:bg-rose-500/10 group/btn transition-all">
                                                    <Ban size={16} className="text-slate-500 group-hover/btn:text-rose-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
