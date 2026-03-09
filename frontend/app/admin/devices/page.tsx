"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/Cards";
import { Badge, Button } from "@/components/UI";
import { Modal, FormInput } from "@/components/Forms";
import {
    Cpu,
    Search,
    Plus,
    Trash2,
    Eye,
    ExternalLink,
    Filter,
    ChevronDown,
    Monitor,
    Activity,
    History,
    TrendingUp,
    XCircle,
    CheckCircle2
} from "lucide-react";
import { DEVICES, INSTALL_LOGS, PATCHES } from "@/data/mockData";

export default function AdminDevices() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<any>(null);
    const [address, setAddress] = useState("");

    const handleOpenDetails = (device: any) => {
        setSelectedDevice(device);
        setIsDetailsOpen(true);
    };

    const dashboardStats = [
        { label: "Total Active", value: DEVICES.length, icon: CheckCircle2, color: "text-emerald-500" },
        { label: "Compliance Low", value: DEVICES.filter(d => d.compliance < 50).length, icon: XCircle, color: "text-rose-500" },
        { label: "Revoked", value: DEVICES.filter(d => d.status === "revoked").length, icon: History, color: "text-slate-500" },
    ];

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white leading-tight tracking-tight">System Devices</h1>
                        <p className="text-slate-400 font-medium">Manage and authorize endpoint hardware in the secure network.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                placeholder="Search device address..."
                                className="bg-slate-900 border border-white/5 rounded-xl px-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 w-full md:w-80 transition-all font-mono"
                            />
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="px-6 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-emerald-500/10">
                            <Plus size={18} />
                            Register Device
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {dashboardStats.map((stat, idx) => (
                        <div key={idx} className="glass p-5 rounded-2xl border border-white/5 flex items-center gap-6">
                            <div className={`p-4 rounded-xl bg-slate-900 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-xs uppercase font-bold text-slate-500 tracking-wider font-inter">{stat.label}</p>
                                <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Devices Table */}
                <Card>
                    <div className="table-container">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th>Device Address</th>
                                    <th>Status</th>
                                    <th>Last Installation</th>
                                    <th>Installed Patches</th>
                                    <th>Compliance %</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DEVICES.map((device, idx) => (
                                    <tr key={idx} className="group hover:bg-white/[0.01]">
                                        <td className="font-mono text-slate-300 text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all">
                                                    <Monitor size={18} />
                                                </div>
                                                <span className="font-semibold tracking-tight">
                                                    {device.address.slice(0, 10)}...{device.address.slice(-8)}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge variant={device.status === "registered" ? "success" : "error"}>
                                                {device.status}
                                            </Badge>
                                        </td>
                                        <td className="text-sm text-slate-400 font-medium">
                                            <div className="flex items-center gap-2">
                                                <Activity size={12} className="text-emerald-500" />
                                                {device.lastInstallation}
                                            </div>
                                        </td>
                                        <td className="text-sm font-bold text-slate-300">
                                            <div className="bg-slate-900 w-fit px-3 py-1 rounded-lg border border-white/5">
                                                {device.installedPatchesCount} <span className="text-xs text-slate-500 ml-1">Patches</span>
                                            </div>
                                        </td>
                                        <td className="text-sm font-bold">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 max-w-[80px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${device.compliance > 80 ? "bg-emerald-500" : device.compliance > 50 ? "bg-amber-500" : "bg-rose-500"}`}
                                                        style={{ width: `${device.compliance}%` }}
                                                    />
                                                </div>
                                                <span className={device.compliance > 80 ? "text-emerald-500" : device.compliance > 50 ? "text-amber-500" : "text-rose-500"}>
                                                    {device.compliance}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button onClick={() => handleOpenDetails(device)} variant="ghost" size="icon" className="group/btn hover:bg-emerald-500/10 transition-all">
                                                    <Eye size={18} className="group-hover/btn:text-emerald-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="group/btn hover:bg-rose-500/10 transition-all">
                                                    <Trash2 size={18} className="group-hover/btn:text-rose-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Register Device Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Register Device Credentials"
                    footer={
                        <>
                            <Button onClick={() => setIsModalOpen(false)} variant="ghost" className="rounded-xl px-8">Cancel</Button>
                            <Button onClick={() => setIsModalOpen(false)} className="rounded-xl px-12">Submit Authorization</Button>
                        </>
                    }
                >
                    <div className="space-y-6">
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Register a new hardware endpoint. The device will be issued a unique system token for cryptographical patch verification.
                        </p>
                        <FormInput
                            label="Hardware Wallet Address"
                            placeholder="0x..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-4">
                            <History size={20} className="text-emerald-500 mt-1" />
                            <p className="text-xs text-emerald-500/80 leading-relaxed font-medium">
                                The system will automatically perform a zero-trust compliance check once the device initiates its first sync heartbeat.
                            </p>
                        </div>
                    </div>
                </Modal>

                {/* Device Details Modal */}
                {selectedDevice && (
                    <Modal
                        isOpen={isDetailsOpen}
                        onClose={() => setIsDetailsOpen(false)}
                        title="Device Intelligence Report"
                    >
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900 rounded-2xl border border-white/5">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Address Hash</p>
                                    <p className="text-xs font-mono font-bold mt-1 text-white truncate">{selectedDevice.address}</p>
                                </div>
                                <div className="p-4 bg-slate-900 rounded-2xl border border-white/5">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Uptime Status</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <p className="text-xs font-bold text-emerald-500">Connected</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 uppercase">
                                    <Activity size={16} className="text-emerald-500" />
                                    Installation Timeline
                                </h4>
                                <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-white/5">
                                    {INSTALL_LOGS.filter(l => l.device === selectedDevice.address).map((log, i) => (
                                        <div key={i} className="flex gap-4 relative">
                                            <div className={`mt-1.5 w-[22px] h-[22px] rounded-full border-2 border-slate-900 z-10 flex items-center justify-center ${log.status === "success" ? "bg-emerald-500" : "bg-rose-500"}`}>
                                                {log.status === "success" ? <CheckCircle2 size={10} className="text-white" /> : <XCircle size={10} className="text-white" />}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs font-bold text-white">PATCH #P00{log.patchId} - {PATCHES.find(p => p.id === log.patchId)?.software}</p>
                                                    <span className="text-[10px] font-mono text-slate-500">{log.timestamp}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-medium mt-1">Verified via SHA-256 integrity check.</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button className="w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/5">
                                Trigger Manual Remote Sync
                            </Button>
                        </div>
                    </Modal>
                )}
            </div>
        </DashboardLayout>
    );
}
