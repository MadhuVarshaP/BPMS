"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/Cards";
import { Button, Badge } from "@/components/UI";
import { FormInput } from "@/components/Forms";
import {
    PlusCircle,
    Package,
    Terminal,
    Activity,
    ShieldCheck,
    ExternalLink,
    Download,
    Trash2,
    Upload,
    X,
    Database,
    Cpu,
    CheckCircle2,
    Loader2,
    FileCode,
    Hash,
    Info
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useRouter } from "next/navigation";

export default function PublisherPublish() {
    const [formData, setFormData] = useState({
        name: "",
        version: "",
        ipfs: "",
        fileHash: "",
    });
    const [isPublishing, setIsPublishing] = useState(false);
    const [previewActive, setPreviewActive] = useState(false);
    const router = useRouter();

    const handlePublish = () => {
        setIsPublishing(true);
        // Simulation
        setTimeout(() => {
            setIsPublishing(false);
            router.push("/publisher/patches");
        }, 2000);
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black text-white leading-tight tracking-tight">Deploy Artifact</h1>
                    <p className="text-slate-400 font-medium">Verify software integrity and commit patch hash to the immutable registry.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Submission Form */}
                    <Card title="Publishing Terminal" subtitle="All fields are required for cryptographic verification.">
                        <div className="space-y-6 pt-4">
                            <FormInput
                                label="Software Namespace"
                                placeholder="e.g. VSCode-OSX-Arm64"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />

                            <div className="grid grid-cols-2 gap-6">
                                <FormInput
                                    label="Build Version"
                                    placeholder="e.g. 1.85.2"
                                    value={formData.version}
                                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                />
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 ml-1">Target Platform</label>
                                    <select className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none text-sm font-bold uppercase tracking-widest">
                                        <option>macOS ARM64</option>
                                        <option>macOS Intel</option>
                                        <option>Windows x64</option>
                                        <option>Linux ARM64</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6 pt-4 border-t border-white/5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 ml-1 flex items-center gap-2">
                                        <Database size={16} className="text-blue-500/60" />
                                        IPFS Gateway Hash (CID)
                                    </label>
                                    <input
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-700 font-mono text-xs focus:outline-none transition-all"
                                        placeholder="QmYxpizjUMmEc2D22m5BAbC...1234"
                                        value={formData.ipfs}
                                        onChange={(e) => setFormData({ ...formData, ipfs: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-400 ml-1 flex items-center gap-2">
                                        <Hash size={16} className="text-emerald-500/60" />
                                        Build Integrity Hash (SHA-256)
                                    </label>
                                    <input
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-700 font-mono text-xs focus:outline-none transition-all"
                                        placeholder="0x9a8f...2e3cBA49...771B"
                                        value={formData.fileHash}
                                        onChange={(e) => setFormData({ ...formData, fileHash: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-8 flex gap-4">
                                <Button variant="ghost" className="flex-1 rounded-xl py-6 font-bold" onClick={() => router.back()}>Cancel Operation</Button>
                                <Button
                                    className="flex-[2] rounded-xl py-6 font-black uppercase tracking-widest shadow-xl shadow-emerald-500/10"
                                    isLoading={isPublishing}
                                    onClick={handlePublish}
                                    disabled={!formData.name || !formData.version}
                                >
                                    Commit to Network
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Live Preview Card */}
                    <div className="space-y-6 sticky top-28">
                        <div className="glass p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
                            {/* Visual Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />

                            <div className="flex justify-between items-start mb-10">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                                    <ShieldCheck size={32} className="text-emerald-500" />
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Protocol Version</span>
                                    <span className="text-xs font-mono text-emerald-500/80">BPMS-1.0-SEC</span>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-white tracking-tighter">
                                        {formData.name || "Software Name"}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="success">Build V{formData.version || "0.0.0"}</Badge>
                                        <Badge variant="info">macOS-ARM64</Badge>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <FileCode size={16} />
                                        <p className="text-xs font-mono truncate max-w-xs">{formData.ipfs || "CID not specified"}</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <Hash size={16} />
                                        <p className="text-xs font-mono truncate max-w-xs">{formData.fileHash || "SHA-256 awaiting input"}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Loader2 size={16} className={`text-emerald-500 ${isPublishing ? "animate-spin" : "opacity-20"}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</span>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-tight">
                                        {isPublishing ? "Broadcasting..." : "Awaiting Signature"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 flex gap-4 items-start">
                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                <Info size={16} />
                            </div>
                            <div>
                                <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">Infrastructure Notice</h5>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                    Once committed, the build metadata is pinned globally across IPFS cluster nodes. Changes require a new version release.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
