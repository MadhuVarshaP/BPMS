"use client";

import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/Cards";
import {
    BarChart3,
    TrendingUp,
    Users,
    Activity,
    Clock,
    ShieldCheck,
    Monitor,
    ArrowUpRight,
    TrendingDown,
    Globe,
    Database,
    PieChart,
    Target
} from "lucide-react";
import { PATCHES, INSTALL_LOGS } from "@/data/mockData";
import { useWallet } from "@/context/WalletContext";

export default function PublisherAnalytics() {
    const { address } = useWallet();
    const myPatches = PATCHES.filter(p => p.publisher.toLowerCase() === address?.toLowerCase());

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black text-white leading-tight tracking-tight">Deployment Intelligence</h1>
                    <p className="text-slate-400 font-medium">Deep analytics and telemetry for your blockchain-verified artifacts.</p>
                </div>

                {/* Top Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: "Global Nodes", value: "2.4K", change: "+14.2%", type: "up", icon: Monitor, color: "text-emerald-500" },
                        { label: "Bandwidth Saved", value: "1.2 TB", change: "+5.6%", type: "up", icon: Database, color: "text-blue-500" },
                        { label: "Failure Delta", value: "0.4%", change: "-2.1%", type: "down", icon: TrendingDown, color: "text-rose-500" },
                        { label: "Identity Trust", value: "99.9%", change: "MAX", type: "neutral", icon: ShieldCheck, color: "text-emerald-500" },
                    ].map((stat, i) => (
                        <div key={i} className="glass p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-xl bg-slate-900 ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                                    <stat.icon size={22} />
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${stat.type === "up" ? "text-emerald-500" : stat.type === "down" ? "text-rose-500" : "text-slate-500"}`}>
                                    {stat.change}
                                    <ArrowUpRight size={12} className={stat.type === "down" ? "rotate-90" : ""} />
                                </div>
                            </div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 font-inter">{stat.label}</p>
                            <p className="text-3xl font-black text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Install Trend Placeholder */}
                    <Card title="Installation Velocity" className="lg:col-span-2 min-h-[400px]">
                        <div className="flex flex-col items-center justify-center h-full gap-8 py-12 opacity-40">
                            <div className="flex items-end gap-3 h-48">
                                {[30, 45, 35, 60, 50, 80, 70, 95, 85, 100].map((h, i) => (
                                    <div key={i} className="w-8 bg-emerald-500/50 rounded-t-lg transition-all hover:bg-emerald-500 hover:scale-110 cursor-pointer" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                            <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <span>JAN</span>
                                <span>FEB</span>
                                <span>MAR</span>
                                <span>APR</span>
                                <span>MAY</span>
                                <span>JUN</span>
                            </div>
                        </div>
                    </Card>

                    {/* Distribution Pie Chart Placeholder */}
                    <div className="space-y-6">
                        <Card title="Platform Adoption">
                            <div className="flex flex-col items-center gap-8 py-4">
                                <div className="relative w-40 h-40">
                                    <PieChart size={160} className="text-blue-500 opacity-20" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-2xl font-black text-white">85%</p>
                                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">macOS ARM</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full space-y-3">
                                    {[
                                        { label: "macOS ARM64", val: "85%", color: "bg-emerald-500" },
                                        { label: "Windows x64", val: "12%", color: "bg-blue-500" },
                                        { label: "Linux-v86", val: "3%", color: "bg-slate-700" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${item.color}`} />
                                                <span className="text-slate-400">{item.label}</span>
                                            </div>
                                            <span className="text-white">{item.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        <Card title="Top Target Regions">
                            <div className="space-y-4 pt-2">
                                {[
                                    { region: "North America", count: "1.2K", icon: Globe, color: "text-blue-500" },
                                    { region: "Western Europe", count: "842", icon: Target, color: "text-emerald-500" },
                                    { region: "East Asia", count: "312", icon: Activity, color: "text-rose-500" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className={`p-2.5 rounded-xl bg-slate-900 ${item.color} group-hover:scale-110 transition-transform`}>
                                            <item.icon size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-white uppercase tracking-tighter">{item.region}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{item.count} ACTIVE NODES</p>
                                        </div>
                                        <ArrowUpRight size={14} className="text-slate-700 group-hover:text-white transition-all" />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
