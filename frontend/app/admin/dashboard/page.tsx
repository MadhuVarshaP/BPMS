"use client";

import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard, Card } from "@/components/Cards";
import { Badge } from "@/components/UI";
import {
    Package,
    Cpu,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Activity,
    Clock,
    ArrowRight
} from "lucide-react";
import { PATCHES, DEVICES, INSTALL_LOGS } from "@/data/mockData";

export default function AdminDashboard() {
    // Aggregate stats
    const totalPatches = PATCHES.length;
    const activeDevices = DEVICES.filter(d => d.status === "registered").length;
    const successfulInstalls = INSTALL_LOGS.filter(l => l.status === "success").length;
    const failedInstalls = INSTALL_LOGS.filter(l => l.status === "failed").length;
    const complianceRate = Math.round(
        DEVICES.reduce((acc, d) => acc + d.compliance, 0) / DEVICES.length
    );

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                {/* Page Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black tracking-tight text-white/90">System Overview</h1>
                    <p className="text-slate-400 font-medium">Global patch management and infrastructure health summary.</p>
                </div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <StatCard
                        icon={Package}
                        label="Total Patches"
                        value={totalPatches}
                        trend="+2 this week"
                        trendType="up"
                    />
                    <StatCard
                        icon={Cpu}
                        label="Active Devices"
                        value={activeDevices}
                    />
                    <StatCard
                        icon={CheckCircle2}
                        label="Successful Installs"
                        value={successfulInstalls}
                        trendType="up"
                    />
                    <StatCard
                        icon={XCircle}
                        label="Failed Installs"
                        value={failedInstalls}
                        trendType="down"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Compliance Rate"
                        value={`${complianceRate}%`}
                    />
                </div>

                {/* Main Dashboard Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity Table */}
                    <div className="lg:col-span-2">
                        <Card title="Recent Network Activity" subtitle="Live feed of patch deployments across the network.">
                            <div className="table-container">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th>Event Type</th>
                                            <th>Patch ID</th>
                                            <th>Device Address</th>
                                            <th>Status</th>
                                            <th>Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {INSTALL_LOGS.slice(0, 6).map((log, idx) => (
                                            <tr key={idx} className="group hover:bg-white/[0.02]">
                                                <td className="font-semibold text-slate-300">
                                                    <div className="flex items-center gap-2">
                                                        <Activity size={14} className="text-emerald-500" />
                                                        Patch Deploy
                                                    </div>
                                                </td>
                                                <td className="text-sm font-mono text-slate-400">#P00{log.patchId}</td>
                                                <td className="text-sm text-slate-500 font-mono">
                                                    {log.device.slice(0, 6)}...{log.device.slice(-4)}
                                                </td>
                                                <td>
                                                    <Badge variant={log.status === "success" ? "success" : "error"}>
                                                        {log.status}
                                                    </Badge>
                                                </td>
                                                <td className="text-xs text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {log.timestamp}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button className="w-full py-4 mt-6 text-sm font-bold text-slate-500 hover:text-emerald-500 flex items-center justify-center gap-2 border-t border-white/5 transition-colors">
                                View All Activity Logs <ArrowRight size={14} />
                            </button>
                        </Card>
                    </div>

                    {/* Right Panel: Health Summary */}
                    <div className="flex flex-col gap-6">
                        <Card title="System Health" className="border-emerald-500/20 shadow-emerald-500/5">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                                        <span>Devices Updated</span>
                                        <span className="text-emerald-500">85%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "85%" }} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                                        <span>Successful Migrations</span>
                                        <span className="text-blue-500">92%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "92%" }} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                    <div className="p-3 bg-slate-900 rounded-xl">
                                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Latest Patch</p>
                                        <p className="text-sm font-bold mt-1 text-white">KB501</p>
                                    </div>
                                    <div className="p-3 bg-slate-900 rounded-xl">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Latency</p>
                                        <p className="text-sm font-bold mt-1 text-emerald-500">14.2ms</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="glass p-6 rounded-2xl border border-emerald-500/10 flex items-center justify-between group cursor-pointer hover:bg-emerald-500/5 transition-all">
                            <div>
                                <h4 className="font-bold text-white tracking-tight">Generate Audit Report</h4>
                                <p className="text-xs text-slate-500 mt-1 font-medium">Export all system activity logs.</p>
                            </div>
                            <div className="bg-emerald-500/10 w-10 h-10 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                <TrendingUp size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
