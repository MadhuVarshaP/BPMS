"use client";

import React, { useEffect, useState } from "react";
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
    Clock
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { apiGet } from "@/lib/api";

type Metrics = {
    totalPatches: number;
    activeDevices: number;
    totalLogs: number;
    successLogs: number;
    successRate: number;
};

type InstallationLog = {
    _id: string;
    deviceAddress: string;
    patchId: number;
    status: "success" | "failure";
    timestamp: string;
};

export default function AdminDashboard() {
    const { address } = useWallet();
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [logs, setLogs] = useState<InstallationLog[]>([]);

    useEffect(() => {
        if (!address) return;
        let cancelled = false;

        async function load() {
            const [metricsRes, logsRes] = await Promise.all([
                apiGet("/api/admin/metrics", address),
                apiGet("/api/admin/logs?limit=6", address),
            ]);

            if (cancelled) return;
            setMetrics(metricsRes as Metrics);
            setLogs(((logsRes as { logs?: InstallationLog[] }).logs || []));
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [address]);

    const totalPatches = metrics?.totalPatches ?? 0;
    const activeDevices = metrics?.activeDevices ?? 0;
    const successfulInstalls = metrics?.successLogs ?? 0;
    const failedInstalls = Math.max((metrics?.totalLogs ?? 0) - successfulInstalls, 0);
    const complianceRate = Math.round((metrics?.successRate ?? 0) * 100);

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
                                        {logs.map((log) => (
                                            <tr key={log._id} className="group hover:bg-white/[0.02]">
                                                <td className="font-semibold text-slate-300">
                                                    <div className="flex items-center gap-2">
                                                        <Activity size={14} className="text-emerald-500" />
                                                        Patch Deploy
                                                    </div>
                                                </td>
                                                <td className="text-sm font-mono text-slate-400">#P00{log.patchId}</td>
                                                <td className="text-sm text-slate-500 font-mono">
                                                    {log.deviceAddress.slice(0, 6)}...{log.deviceAddress.slice(-4)}
                                                </td>
                                                <td>
                                                    <Badge variant={log.status === "success" ? "success" : "error"}>
                                                        {log.status}
                                                    </Badge>
                                                </td>
                                                <td className="text-xs text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
