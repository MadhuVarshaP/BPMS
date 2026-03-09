"use client";

import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/Cards";
import { Badge, Button } from "@/components/UI";
import {
    History,
    Search,
    Filter,
    Download,
    ExternalLink,
    Terminal,
    Cpu,
    Package,
    Calendar,
    CheckCircle2,
    XCircle,
    ShieldCheck,
    Zap
} from "lucide-react";
import { INSTALL_LOGS, PATCHES } from "@/data/mockData";

export default function AdminLogs() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white leading-tight tracking-tight">Audit Infrastructure</h1>
                        <p className="text-slate-400 font-medium">Immutable sequence of all network operations and patch synchronizations.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="px-6 rounded-xl flex items-center gap-2 border-white/10 hover:bg-white/5">
                            <Download size={18} />
                            Export CSV
                        </Button>
                        <Button className="px-6 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-emerald-500/10">
                            <ShieldCheck size={18} />
                            Verify Chain Integrity
                        </Button>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="glass p-4 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input placeholder="Filter by address..." className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-12 py-2 text-xs focus:outline-none" />
                    </div>
                    <div className="relative">
                        <Package size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <select className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-12 py-2 text-xs focus:outline-none appearance-none text-slate-400 font-bold uppercase tracking-wider">
                            <option>All Patches</option>
                            <option>Security Fixes</option>
                            <option>Feature Updates</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <div className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-12 py-2 text-xs text-slate-400 font-bold">Last 30 Days</div>
                    </div>
                    <div className="relative">
                        <Zap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <select className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-12 py-2 text-xs focus:outline-none appearance-none text-slate-400 font-bold uppercase tracking-wider">
                            <option>All Operations</option>
                            <option>Sync Successful</option>
                            <option>Sync Failed</option>
                        </select>
                    </div>
                </div>

                {/* Unified Audit Timeline */}
                <Card title="Global Network Logs" subtitle="Showing the latest 20 cryptographically signed events.">
                    <div className="space-y-1">
                        {[...INSTALL_LOGS, ...INSTALL_LOGS].slice(0, 15).map((log, i) => (
                            <div key={i} className="group flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 group-hover:bg-emerald-500/5 transition-all">
                                        {log.status === "success" ? <CheckCircle2 size={20} className="text-emerald-500" /> : <XCircle size={20} className="text-rose-500" />}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white tracking-tight">
                                                {log.status === "success" ? "SYNC_COMPLETED" : "SYNC_TERMINATED"}
                                            </span>
                                            <Badge variant={log.status === "success" ? "success" : "error"} className="px-1.5 py-0 text-[8px]">
                                                {log.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium tracking-tight">
                                            Device <span className="text-slate-400 font-mono">{log.device.slice(0, 8)}...{log.device.slice(-6)}</span> pulled Patch <span className="text-slate-400 font-mono">#P00{log.patchId}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Network Timestamp</span>
                                        <span className="text-xs font-mono text-slate-400">{log.timestamp}</span>
                                    </div>
                                    <button className="p-2 text-slate-600 hover:text-emerald-500 transition-colors">
                                        <ExternalLink size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center justify-between px-4">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Showing 15 of 2314 Events</p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-slate-900 border border-white/5 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all cursor-not-allowed">Previous</button>
                            <button className="px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-[10px] font-black text-white hover:bg-slate-800 uppercase tracking-widest transition-all">Next Page</button>
                        </div>
                    </div>
                </Card>

                {/* Live Terminal Simulation Overlay */}
                <div className="bg-[#020617] border border-white/5 p-6 rounded-2xl shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-3 w-3 rounded-full bg-rose-500/20" />
                        <div className="h-3 w-3 rounded-full bg-amber-500/20" />
                        <div className="h-3 w-3 rounded-full bg-emerald-500/20" />
                        <span className="text-[10px] ml-4 font-mono text-slate-600 uppercase tracking-widest font-bold">BPMS Core Engine - Live Output</span>
                    </div>
                    <div className="space-y-1 font-mono text-xs">
                        <p className="text-emerald-500/60">[SYSTEM] Initialization complete. Connected to decentralized relay cluster.</p>
                        <p className="text-slate-500">[FETCH] Checking patch integrity for #P005...</p>
                        <p className="text-slate-500">[VERIFY] SHA-256 Hash Match Found: 0x9a8f...2e3c</p>
                        <p className="text-blue-500/60">[BRIDGE] Broadcasting sync notification to 6 authorized nodes.</p>
                        <p className="text-slate-500">[LOG] Event committed to local audit buffer.</p>
                        <div className="h-4 w-2 bg-emerald-500 animate-pulse inline-block align-middle ml-1" />
                    </div>
                    {/* Visual scanline effect */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/[0.01] to-transparent h-20 w-full animate-[scan_4s_linear_infinite]" />
                </div>
            </div>

            <style jsx>{`
        @keyframes scan {
          from { top: -100px; }
          to { top: 100%; }
        }
      `}</style>
        </DashboardLayout>
    );
}
