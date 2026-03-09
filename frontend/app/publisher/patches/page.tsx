"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/Cards";
import { Badge, Button } from "@/components/UI";
import { Modal } from "@/components/Forms";
import {
    Package,
    Search,
    PlusCircle,
    Eye,
    TrendingUp,
    Activity,
    CheckCircle2,
    XCircle,
    BarChart3,
    Users,
    Cpu,
    ArrowRight,
    ExternalLink,
    Download,
    ShieldCheck,
    Zap,
    Terminal,
    Monitor
} from "lucide-react";
import { PATCHES, INSTALL_LOGS, DEVICES } from "@/data/mockData";
import { useWallet } from "@/context/WalletContext";
import Link from "next/link";

export default function PublisherPatches() {
    const { address } = useWallet();
    const [selectedPatch, setSelectedPatch] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter patches by current publisher
    const myPatches = PATCHES.filter(p => p.publisher.toLowerCase() === address?.toLowerCase());

    const handleOpenDetails = (patch: any) => {
        setSelectedPatch(patch);
        setIsModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white leading-tight tracking-tight">Software Inventory</h1>
                        <p className="text-slate-400 font-medium">History of your published artifacts and distribution metrics.</p>
                    </div>
                    <Link href="/publisher/publish">
                        <Button className="px-8 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/10">
                            <PlusCircle size={20} />
                            Publish New Version
                        </Button>
                    </Link>
                </div>

                {/* Patches Table */}
                <Card>
                    <div className="table-container">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th>Identity Hash</th>
                                    <th>Software</th>
                                    <th>Distribution Status</th>
                                    <th>Installed Count</th>
                                    <th>Reliability %</th>
                                    <th className="text-right">Intelligence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myPatches.map((patch, idx) => (
                                    <tr key={idx} className="group hover:bg-white/[0.01]">
                                        <td className="font-mono text-emerald-500 text-xs font-bold">
                                            #P00{patch.id}
                                        </td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white tracking-tight">{patch.software}</span>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Build V{patch.version}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className={`h-1.5 w-1.5 rounded-full ${patch.active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                                                <span className={`text-[11px] font-bold uppercase tracking-wider ${patch.active ? "text-emerald-500" : "text-rose-500"}`}>
                                                    {patch.active ? "Broadcasting" : "Halted & Revoked"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-sm font-bold text-slate-300">
                                            <div className="bg-slate-900 w-fit px-3 py-1 rounded-lg border border-white/5">
                                                {patch.installCount} <span className="text-xs text-slate-500 ml-1">Nodes</span>
                                            </div>
                                        </td>
                                        <td className="text-sm font-bold">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 max-w-[80px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500" style={{ width: `${patch.successRate}%` }} />
                                                </div>
                                                <span className="text-emerald-500">{patch.successRate}%</span>
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <Button onClick={() => handleOpenDetails(patch)} variant="ghost" size="icon" className="hover:bg-emerald-500/10 transition-all">
                                                <Eye size={18} className="text-slate-400 group-hover:text-emerald-500" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Patch Intelligence Modal */}
                {selectedPatch && (
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title="Artifact Distribution Intelligence"
                    >
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900 rounded-2xl border border-white/5">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Release Date</p>
                                    <p className="text-xs font-bold mt-1 text-white">{selectedPatch.releaseDate}</p>
                                </div>
                                <div className="p-4 bg-slate-900 rounded-2xl border border-white/5">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Storage Capacity</p>
                                    <p className="text-xs font-bold mt-1 text-blue-500">2.4 MB on IPFS</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 uppercase font-inter">
                                    <TrendingUp size={16} className="text-emerald-500" />
                                    Deployment Breakdown
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 glass rounded-2xl border border-white/5 text-center">
                                        <p className="text-[10px] uppercase font-bold text-slate-500">Success</p>
                                        <p className="text-xl font-bold text-emerald-500 mt-1">{selectedPatch.successRate}%</p>
                                    </div>
                                    <div className="p-4 glass rounded-2xl border border-white/5 text-center">
                                        <p className="text-[10px] uppercase font-bold text-slate-500">Failures</p>
                                        <p className="text-xl font-bold text-rose-500 mt-1">{100 - selectedPatch.successRate}%</p>
                                    </div>
                                    <div className="p-4 glass rounded-2xl border border-white/5 text-center">
                                        <p className="text-[10px] uppercase font-bold text-slate-500">Waitlist</p>
                                        <p className="text-xl font-bold text-blue-500 mt-1">42</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 uppercase font-inter">
                                    <Users size={16} className="text-slate-400" />
                                    Targeted Nodes
                                </h4>
                                <div className="space-y-2">
                                    {INSTALL_LOGS.filter(l => l.patchId === selectedPatch.id).slice(0, 4).map((log, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-slate-900 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <Monitor size={14} className="text-slate-500" />
                                                <span className="text-xs font-mono text-slate-300">{log.device.slice(0, 10)}...{log.device.slice(-8)}</span>
                                            </div>
                                            <Badge variant={log.status === "success" ? "success" : "error"} className="px-1.5 py-0 text-[8px]">
                                                {log.status === "success" ? "CONFIRMED" : "FAILED"}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" className="flex-1 rounded-xl">View Protocol Docs</Button>
                                <Button variant="danger" className="flex-1 rounded-xl">Revoke Build Hash</Button>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </DashboardLayout>
    );
}
