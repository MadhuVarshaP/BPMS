"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/Cards";
import { Button } from "@/components/UI";
import {
    ShieldAlert,
    Trash2,
    Globe,
    Cpu,
    Users,
    Package,
    Key,
    DatabaseIcon,
    Server,
    RefreshCw
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { apiGet } from "@/lib/api";

type Metrics = {
    totalPatches: number;
    activeDevices: number;
};

type PublishersResponse = { count: number };

export default function AdminSettings() {
    const { address } = useWallet();
    const { showToast } = useToast();
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [publisherCount, setPublisherCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    async function loadMetrics() {
        if (!address) return;
        const [metricsRes, publishersRes] = await Promise.all([
            apiGet("/api/admin/metrics", address),
            apiGet("/api/admin/publishers", address)
        ]);
        setMetrics(metricsRes as Metrics);
        setPublisherCount((publishersRes as PublishersResponse).count || 0);
    }

    useEffect(() => {
        if (!address) return;
        let cancelled = false;
        loadMetrics().then(() => { if (cancelled) return; });
        return () => { cancelled = true; };
    }, [address]);

    async function handleSyncChain() {
        if (!address || isSyncing) return;
        setIsSyncing(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const response = await fetch(`${baseUrl}/api/admin/sync-chain`, {
                method: "POST",
                headers: { "x-wallet-address": address },
            });
            const data = (await response.json()) as {
                synced?: number;
                skipped?: number;
                total?: number;
                error?: string;
            };
            if (!response.ok) throw new Error(data.error || "Sync failed");
            showToast(
                `Chain sync: ${data.synced} new, ${data.skipped} existing, ${data.total} on-chain`,
                "success"
            );
            await loadMetrics();
        } catch (error) {
            showToast(error instanceof Error ? error.message : "Sync failed", "error");
        } finally {
            setIsSyncing(false);
        }
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black text-white leading-tight tracking-tight tracking-tighter">Network Protocol</h1>
                    <p className="text-slate-400 font-medium font-inter">Global parameters and decentralized infrastructure configuration.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* System Info Section */}
                    <div className="space-y-6">
                        <Card title="Blockchain Registry" subtitle="Core contract and network binding parameters.">
                            <div className="space-y-6 pt-4">
                                <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Registry Contract Address</p>
                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Verified</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Globe size={16} className="text-slate-500" />
                                        <span className="text-xs font-mono text-slate-300">${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 space-y-2">
                                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sync Protocol</p>
                                        <p className="text-sm font-bold text-white tracking-tight uppercase">Base Sepolia</p>
                                    </div>
                                    <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 space-y-2">
                                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Block Confirmations</p>
                                        <p className="text-sm font-bold text-white tracking-tight">12 Blocks</p>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full rounded-xl py-3 border-white/5 text-slate-400 hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest"
                                    onClick={handleSyncChain}
                                    isLoading={isSyncing}
                                >
                                    <RefreshCw size={14} className="mr-2" />
                                    Sync All Patches from Chain
                                </Button>
                            </div>
                        </Card>

                        <Card title="Decentralized Storage" subtitle="IPFS/Filecoin gateway configuration.">
                            <div className="space-y-6 pt-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-emerald-500 transition-all">
                                        <DatabaseIcon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white tracking-tight">Main Pinning Gateway</p>
                                        <p className="text-xs text-slate-500 font-medium">ipfs.infura.io:5001</p>
                                    </div>
                                    <div>
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500">
                                        <Server size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-white tracking-tight">Backup Relay</p>
                                        <p className="text-xs text-slate-500 font-medium">bafybeih...ipfs.node</p>
                                    </div>
                                    <div>
                                        <div className="h-2 w-2 rounded-full bg-emerald-500/20" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Role Summary & Danger Zone */}
                    <div className="space-y-6">
                        <Card title="Registry Distribution" subtitle="Active identities authorized in the PKI infrastructure.">
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {[
                                    { label: "Admin Hash", count: 1, icon: Key, color: "text-emerald-500" },
                                    { label: "Publisher Nodes", count: publisherCount, icon: Users, color: "text-blue-500" },
                                    { label: "Device Certificates", count: metrics?.activeDevices || 0, icon: Cpu, color: "text-amber-500" },
                                    { label: "Patch Records", count: metrics?.totalPatches || 0, icon: Package, color: "text-slate-500" },
                                ].map((item, i) => (
                                    <div key={i} className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <item.icon size={16} className={item.color} />
                                            <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider font-inter">{item.label}</p>
                                        </div>
                                        <p className="text-2xl font-black text-white">{item.count}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card title="Enterprise Risk Protocol" subtitle="Irreversible administrative commands.">
                            <div className="space-y-6 pt-4">
                                <div className="p-5 rounded-2xl border border-rose-500/10 bg-rose-500/5 group hover:bg-rose-500/10 transition-all cursor-pointer">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
                                            <Trash2 size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-white tracking-tight">Purge Network Mock Data</h4>
                                            <p className="text-xs text-slate-400 mt-1 leading-relaxed font-inter">Clear all local storage, indexed logs, and session caches. This action cannot be reversed.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl border border-white/5 bg-slate-900 group hover:border-emerald-500/20 transition-all cursor-pointer">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                                            <ShieldAlert size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-white tracking-tight">Rotate Master Admin Key</h4>
                                            <p className="text-xs text-slate-400 mt-1 leading-relaxed font-inter">Initiate multi-signature re-keying process across the registry federation nodes.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
