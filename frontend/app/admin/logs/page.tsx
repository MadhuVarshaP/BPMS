"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/Cards";
import { Badge, Button } from "@/components/UI";
import {
    Search,
    Download
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { apiGet } from "@/lib/api";

type InstallationLog = {
    _id: string;
    deviceAddress: string;
    patchId: number;
    status: "success" | "failure";
    source?: "api" | "chain";
    timestamp: string;
};

export default function AdminLogs() {
    const { address } = useWallet();
    const [logs, setLogs] = useState<InstallationLog[]>([]);
    const [deviceFilter, setDeviceFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        if (!address) return;
        let cancelled = false;

        async function load() {
            const params = new URLSearchParams();
            params.set("limit", "300");
            if (deviceFilter.trim()) params.set("device", deviceFilter.trim());
            if (statusFilter !== "all") params.set("status", statusFilter);
            const data = await apiGet(`/api/admin/logs?${params.toString()}`, address);
            if (!cancelled) setLogs(((data as { logs?: InstallationLog[] }).logs || []));
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [address, deviceFilter, statusFilter]);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white leading-tight tracking-tight">Audit Infrastructure</h1>
                        <p className="text-slate-400 font-medium">Immutable sequence of all network operations and patch synchronizations.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="px-6 rounded-xl flex items-center gap-2 border-white/10 hover:bg-white/5" disabled>
                            <Download size={18} />
                            Export CSV
                        </Button>
                    </div>
                </div>

                <div className="glass p-4 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            value={deviceFilter}
                            onChange={(e) => setDeviceFilter(e.target.value)}
                            placeholder="Filter by device address..."
                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-12 py-2 text-xs focus:outline-none"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2 text-xs focus:outline-none appearance-none text-slate-400 font-bold uppercase tracking-wider"
                        >
                            <option value="all">All Status</option>
                            <option value="success">Success</option>
                            <option value="failure">Failure</option>
                        </select>
                    </div>
                </div>

                <Card title="Global Network Logs" subtitle="Showing the latest 20 cryptographically signed events.">
                    <div className="space-y-1">
                        {logs.map((log) => (
                            <div key={log._id} className="group flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white tracking-tight">
                                                PATCH_INSTALLATION
                                            </span>
                                            <Badge variant={log.status === "success" ? "success" : "error"} className="px-1.5 py-0 text-[8px]">
                                                {log.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium tracking-tight">
                                            Device <span className="text-slate-400 font-mono">{log.deviceAddress.slice(0, 8)}...{log.deviceAddress.slice(-6)}</span> reported Patch <span className="text-slate-400 font-mono">#P00{log.patchId}</span> ({log.source || "api"})
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Network Timestamp</span>
                                        <span className="text-xs font-mono text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
