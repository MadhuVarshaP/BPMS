"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/Cards";
import { Badge, Button } from "@/components/UI";
import { Modal } from "@/components/Forms";
import {
    Package,
    Search,
    Eye,
    Download,
    ShieldCheck,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Clock,
    Activity,
    History,
    Lock,
    Zap,
    Cpu,
    RefreshCw,
    Terminal,
    Monitor
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { INSTALL_LOGS, PATCHES } from "@/data/mockData";

export default function DevicePatches() {
    const { address } = useWallet();
    const [selectedPatch, setSelectedPatch] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter logs for THIS device that were SUCCESSFUL
    const mySuccessfulLogs = INSTALL_LOGS.filter(l =>
        l.device.toLowerCase() === address?.toLowerCase() && l.status === "success"
    );

    // Get unique patches from logs
    const installedPatchIds = Array.from(new Set(mySuccessfulLogs.map(l => l.patchId)));
    const myPatches = PATCHES.filter(p => installedPatchIds.includes(p.id));

    const handleOpenDetails = (patch: any) => {
        setSelectedPatch(patch);
        setIsModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white leading-tight tracking-tight tracking-tighter">Installed Inventory</h1>
                        <p className="text-slate-400 font-medium font-inter">Verified software artifacts currently running on this hardware endpoint.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                placeholder="Find in inventory..."
                                className="bg-slate-900 border border-white/5 rounded-xl px-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 w-full md:w-80 transition-all font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Patches Table */}
                <Card>
                    <div className="table-container">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th>Patch Identity</th>
                                    <th>Software Name</th>
                                    <th>Installed Build</th>
                                    <th>Activation Date</th>
                                    <th>Integrity Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myPatches.map((patch, idx) => {
                                    const log = mySuccessfulLogs.find(l => l.patchId === patch.id);
                                    return (
                                        <tr key={idx} className="group hover:bg-white/[0.01]">
                                            <td className="font-mono text-emerald-500 text-xs font-bold uppercase tracking-widest">
                                                #P0-0{patch.id}
                                            </td>
                                            <td>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white tracking-tight">{patch.software}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 font-inter">DECENTRALIZED BINARY</span>
                                                </div>
                                            </td>
                                            <td className="text-sm font-bold text-slate-300">
                                                V{patch.version}
                                            </td>
                                            <td className="text-xs text-slate-500 font-medium">
                                                {log?.timestamp || patch.releaseDate}
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck size={14} className="text-emerald-500" />
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Verified OK</span>
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button onClick={() => handleOpenDetails(patch)} variant="ghost" size="icon" className="hover:bg-emerald-500/10 transition-all group/btn">
                                                        <Eye size={18} className="text-slate-500 group-hover/btn:text-emerald-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="hover:bg-rose-500/10 transition-all group/btn">
                                                        <RefreshCw size={18} className="text-slate-500 group-hover/btn:text-rose-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {myPatches.length === 0 && (
                        <div className="py-24 text-center">
                            <div className="flex flex-col items-center gap-4 py-8 opacity-20">
                                <History size={48} className="text-slate-500" />
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Accessing Verified Logs...</p>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Patch Detail Modal for Device */}
                {selectedPatch && (
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title="Artifact Manifest Verification"
                    >
                        <div className="space-y-8">
                            <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white tracking-tight">Status: Active & Verified</h4>
                                        <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-widest mt-0.5">SHA-256 INTEGRITY MATCHED</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">IPFS Storage Proof</label>
                                    <div className="bg-[#020617] p-3 rounded-xl border border-white/5 font-mono text-[10px] text-slate-400 break-all leading-relaxed">
                                        {selectedPatch.ipfsHash}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Binary Identifier (Hash)</label>
                                    <div className="bg-[#020617] p-3 rounded-xl border border-white/5 font-mono text-[10px] text-slate-400 break-all leading-relaxed">
                                        {selectedPatch.fileHash}
                                    </div>
                                </div>
                            </div>

                            <Card className="bg-slate-900 border-white/5 mt-4" title="Distributor Manifest">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-slate-500 font-bold uppercase tracking-wider">Signed By</span>
                                        <span className="text-slate-300 font-mono truncate max-w-[140px]">{selectedPatch.publisher}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="text-slate-500 font-bold uppercase tracking-wider">Certification Date</span>
                                        <span className="text-slate-300 font-mono">{selectedPatch.releaseDate}</span>
                                    </div>
                                </div>
                            </Card>

                            <Button className="w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/10">
                                Perform Deep Re-Verification
                            </Button>
                        </div>
                    </Modal>
                )}
            </div>
        </DashboardLayout>
    );
}
