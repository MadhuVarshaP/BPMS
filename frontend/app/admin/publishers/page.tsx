"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/Cards";
import { Badge, Button } from "@/components/UI";
import { Modal, FormInput } from "@/components/Forms";
import {
    Users,
    Plus,
    Trash2,
    Package,
    CheckCircle2,
    AlertCircle,
    History,
    ShieldCheck,
    Search,
    ExternalLink
} from "lucide-react";
import { PUBLISHER_LIST, PATCHES, INSTALL_LOGS } from "@/data/mockData";

export default function AdminPublishers() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [address, setAddress] = useState("");

    const publishers = PUBLISHER_LIST.map(addr => {
        const publisherPatches = PATCHES.filter(p => p.publisher === addr);
        const totalInstalls = publisherPatches.reduce((acc, p) => acc + p.installCount, 0);
        return {
            address: addr,
            activePatches: publisherPatches.length,
            totalInstallations: totalInstalls,
            status: "authorized"
        };
    });

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white leading-tight tracking-tight">Publisher Network</h1>
                        <p className="text-slate-400 font-medium">Authorize developers and distribute patches through cryptographical identities.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                placeholder="Search publisher address..."
                                className="bg-slate-900 border border-white/5 rounded-xl px-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 w-full md:w-80 transition-all font-mono"
                            />
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="px-6 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-emerald-500/10">
                            <Plus size={18} />
                            Authorize Publisher
                        </Button>
                    </div>
                </div>

                <Card>
                    <div className="table-container">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th>Publisher Identity</th>
                                    <th>Active Patches</th>
                                    <th>Total Deployments</th>
                                    <th>Permission Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {publishers.map((pub, idx) => (
                                    <tr key={idx} className="group hover:bg-white/[0.01]">
                                        <td className="font-mono text-slate-300 text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-all">
                                                    <ShieldCheck size={18} />
                                                </div>
                                                <span className="font-semibold tracking-tight">
                                                    {pub.address.slice(0, 10)}...{pub.address.slice(-8)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-sm font-bold text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <Package size={14} className="text-blue-400" />
                                                {pub.activePatches}
                                            </div>
                                        </td>
                                        <td className="text-sm font-bold text-slate-400">
                                            {pub.totalInstallations.toLocaleString()} <span className="text-[10px] text-slate-500 ml-1 font-medium uppercase tracking-widest">Active nodes</span>
                                        </td>
                                        <td>
                                            <Badge variant="success">
                                                {pub.status}
                                            </Badge>
                                        </td>
                                        <td className="text-right">
                                            <Button variant="ghost" size="icon" className="group/btn hover:bg-rose-500/10 transition-all">
                                                <Trash2 size={18} className="group-hover/btn:text-rose-500" />
                                                <span className="sr-only">Revoke Access</span>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Grant Publisher Authorization"
                    footer={
                        <>
                            <Button onClick={() => setIsModalOpen(false)} variant="ghost" className="rounded-xl px-8">Discard</Button>
                            <Button onClick={() => setIsModalOpen(false)} className="rounded-xl px-12">Authorize Address</Button>
                        </>
                    }
                >
                    <div className="space-y-6">
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Grant patch-publishing permissions to a new entity. They will be able to upload, sign, and distribute software updates to authorized endpoints.
                        </p>
                        <FormInput
                            label="Publisher Public Address"
                            placeholder="0x..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-4">
                            <AlertCircle size={20} className="text-amber-500 mt-1 flex-shrink-0" />
                            <p className="text-xs text-amber-500/80 leading-relaxed font-medium">
                                Authorizing an address allows it to deploy executable code to all endpoints. Ensure the identity has been verified via hardware-based KYC.
                            </p>
                        </div>
                    </div>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
