"use client";

import React, { useCallback, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/Cards";
import { Badge, Button } from "@/components/UI";
import { FormInput } from "@/components/Forms";
import {
    Package,
    ShieldCheck,
    AlertCircle,
    Download,
    Fingerprint,
    Cpu,
    Activity,
    CheckCircle2,
    XCircle,
    Loader2
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import { bpmsContractAbi } from "@/lib/contractAbi";
import { getContractWithSigner, getFrontendContractAddress } from "@/lib/ethers";
import { normalizeHash, sha256OfBuffer } from "@/lib/patchIntegrity";

type DeviceRow = {
    deviceId: string;
    status?: string;
    lastSeen?: string;
    currentSoftwareNamespace?: string;
    currentVersion?: string;
    targetPlatform?: string;
    displayName?: string;
};

type PatchRec = {
    _id: string;
    patchId: number;
    softwareName: string;
    version: string;
    targetPlatform?: string;
    ipfsHash: string;
    fileHash: string;
};

type LogRow = {
    _id: string;
    patchId: number;
    status: "success" | "failure";
    timestamp: string;
    txHash?: string;
};

type Stats = {
    device: DeviceRow | null;
    successLogs: number;
    failureLogs: number;
    successRate: number;
    updatesAvailable: number;
    activePatchesOnRegistry: number;
};

type InstallPhase =
    | "idle"
    | "checking"
    | "downloading"
    | "verifying"
    | "installing"
    | "reporting"
    | "success"
    | "error";

const PHASE_PROGRESS: Record<InstallPhase, number> = {
    idle: 0,
    checking: 12,
    downloading: 35,
    verifying: 55,
    installing: 72,
    reporting: 88,
    success: 100,
    error: 0
};

function findPatchInstalledLogIndex(
    contract: { interface: { parseLog: (log: { topics: string[]; data: string }) => { name?: string } | null } },
    receipt: { logs?: ReadonlyArray<{ address: string; topics: readonly string[]; data: string; index: number }> },
    contractAddress: string
): number | undefined {
    const addr = contractAddress.toLowerCase();
    if (!receipt.logs) return undefined;
    for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== addr) continue;
        try {
            const p = contract.interface.parseLog({
                topics: [...log.topics],
                data: log.data
            });
            if (p?.name === "PatchInstalled") return Number(log.index);
        } catch {
            continue;
        }
    }
    return undefined;
}

export default function DeviceDashboard() {
    const { address } = useWallet();
    const { showToast } = useToast();

    const [deviceMissing, setDeviceMissing] = useState(false);
    const [device, setDevice] = useState<DeviceRow | null>(null);
    const [profileNs, setProfileNs] = useState("");
    const [profileVer, setProfileVer] = useState("");
    const [profilePlat, setProfilePlat] = useState("");
    const [profileName, setProfileName] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    const [stats, setStats] = useState<Stats | null>(null);
    const [logs, setLogs] = useState<LogRow[]>([]);
    const [upToDate, setUpToDate] = useState(true);
    const [recommended, setRecommended] = useState<PatchRec | null>(null);
    const [updateHint, setUpdateHint] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);

    const [phase, setPhase] = useState<InstallPhase>("idle");
    const [phaseMessage, setPhaseMessage] = useState("");
    const [installing, setInstalling] = useState(false);

    const loadAll = useCallback(async () => {
        if (!address) return;
        try {
            const me = await apiGet("/api/device/me", address).catch(() => null) as
                | { device?: DeviceRow }
                | null;
            if (!me?.device) {
                setDeviceMissing(true);
                setDevice(null);
            } else {
                setDeviceMissing(false);
                setDevice(me.device);
                setProfileNs(me.device.currentSoftwareNamespace || "");
                setProfileVer(me.device.currentVersion || "");
                setProfilePlat(me.device.targetPlatform || "");
                setProfileName(me.device.displayName || "");
            }
        } catch {
            setDeviceMissing(true);
        }

        try {
            const [statsRes, logsRes, checkRes] = await Promise.all([
                apiGet("/api/device/stats", address),
                apiGet("/api/device/logs", address),
                apiGet("/api/device/update-check", address).catch(() => ({
                    upToDate: true,
                    recommendedPatch: null
                }))
            ]);
            setStats(statsRes as Stats);
            setLogs(((logsRes as { logs?: LogRow[] }).logs || []).slice(0, 12));
            const chk = checkRes as {
                upToDate: boolean;
                recommendedPatch: PatchRec | null;
                hint?: string;
            };
            setUpToDate(Boolean(chk.upToDate));
            setRecommended(chk.recommendedPatch || null);
            setUpdateHint(typeof chk.hint === "string" ? chk.hint : null);
        } catch {
            /* stats may fail if device record missing */
        }
    }, [address]);

    useEffect(() => {
        void loadAll();
    }, [loadAll]);

    async function saveProfile() {
        if (!address || deviceMissing) return;
        setSavingProfile(true);
        try {
            const res = (await apiPatch(
                "/api/device/profile",
                {
                    currentSoftwareNamespace: profileNs.trim(),
                    currentVersion: profileVer.trim(),
                    targetPlatform: profilePlat.trim().toLowerCase(),
                    displayName: profileName.trim()
                },
                address
            )) as { device: DeviceRow };
            setDevice(res.device);
            showToast("Device profile saved", "success");
            await loadAll();
        } catch (e) {
            showToast(e instanceof Error ? e.message : "Save failed", "error");
        } finally {
            setSavingProfile(false);
        }
    }

    async function checkForUpdates() {
        if (!address || deviceMissing) return;
        setChecking(true);
        setPhase("checking");
        setPhaseMessage("Checking registry for applicable patches…");
        try {
            const chk = (await apiGet("/api/device/update-check", address)) as {
                upToDate: boolean;
                recommendedPatch: PatchRec | null;
                hint?: string;
            };
            setUpToDate(chk.upToDate);
            setRecommended(chk.recommendedPatch || null);
            setUpdateHint(typeof chk.hint === "string" ? chk.hint : null);
            if (chk.upToDate || !chk.recommendedPatch) {
                showToast("Your system is up to date.", "success");
            } else {
                showToast(
                    `Update available: ${chk.recommendedPatch.softwareName} v${chk.recommendedPatch.version}`,
                    "info"
                );
            }
        } catch (e) {
            showToast(e instanceof Error ? e.message : "Check failed", "error");
        } finally {
            setChecking(false);
            setPhase("idle");
            setPhaseMessage("");
        }
    }

    async function runInstallPipeline() {
        if (!address || !recommended || deviceMissing) return;
        setInstalling(true);
        setPhase("downloading");
        setPhaseMessage("Downloading patch from IPFS…");
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const contractAddress = getFrontendContractAddress();

        try {
            const dl = await fetch(
                `${baseUrl}/api/device/patch/${recommended.patchId}/download`,
                { headers: { "x-wallet-address": address } }
            );
            if (!dl.ok) {
                throw new Error("Download failed — check IPFS gateway or patch CID");
            }
            const buf = await dl.arrayBuffer();

            setPhase("verifying");
            setPhaseMessage("Computing SHA-256 and comparing to on-chain fileHash…");
            const localHash = normalizeHash(await sha256OfBuffer(buf));

            const contract = await getContractWithSigner(contractAddress, bpmsContractAbi);
            const onChain = await contract.patches(recommended.patchId);
            const chainHash = normalizeHash(String(onChain.fileHash));

            if (localHash !== chainHash) {
                setPhase("error");
                setPhaseMessage("Integrity check failed — hash mismatch. Update aborted.");
                showToast("Integrity check failed. File does not match blockchain hash.", "error");
                try {
                    await apiPost(
                        "/api/device/report",
                        { patchId: recommended.patchId, status: "failure" },
                        address
                    );
                } catch {
                    /* best-effort log */
                }
                setInstalling(false);
                setTimeout(() => {
                    setPhase("idle");
                    setPhaseMessage("");
                }, 4500);
                return;
            }

            setPhase("installing");
            setPhaseMessage("Simulating install (replace binaries / run installer)…");
            await new Promise((r) => setTimeout(r, 900));

            setPhase("reporting");
            setPhaseMessage("Recording installation on-chain…");
            const tx = await contract.reportInstallation(recommended.patchId, true);
            const receipt = await tx.wait();
            if (!receipt) throw new Error("No receipt from network");

            const logIndex = findPatchInstalledLogIndex(contract, receipt, contractAddress);

            await apiPost(
                "/api/device/report",
                {
                    patchId: recommended.patchId,
                    status: "success",
                    txHash: tx.hash,
                    logIndex: logIndex ?? undefined
                },
                address
            );

            setPhase("success");
            setPhaseMessage("Installation recorded on-chain and synced to backend.");
            showToast("Update installed and reported successfully.", "success");
            setRecommended(null);
            setUpToDate(true);
            await loadAll();
        } catch (e) {
            setPhase("error");
            setPhaseMessage(e instanceof Error ? e.message : "Installation failed");
            showToast(e instanceof Error ? e.message : "Installation failed", "error");
            setInstalling(false);
            setTimeout(() => {
                setPhase("idle");
                setPhaseMessage("");
            }, 4500);
            return;
        }
        setInstalling(false);
        setTimeout(() => {
            setPhase("idle");
            setPhaseMessage("");
        }, 3500);
    }

    const progress = PHASE_PROGRESS[phase];
    const lastLog = logs[0];

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="warning" className="uppercase text-[10px]">
                                Patch agent
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            Device control panel
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl">
                            Check → fetch → verify (SHA-256 vs chain) → install (simulated) →
                            <code className="text-emerald-500/90 mx-1">reportInstallation</code> → backend log.
                        </p>
                    </div>
                </div>

                {deviceMissing && (
                    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm">
                        No device record in the backend. Ask an admin to register this wallet on-chain and sync via{" "}
                        <span className="font-mono">Register Device</span>.
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card
                        className="lg:col-span-1"
                        title="Identity"
                        subtitle="Wallet + registration status"
                    >
                        <div className="space-y-4 pt-4">
                            <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                                    Wallet
                                </p>
                                <p className="text-xs font-mono text-emerald-400 break-all">{address}</p>
                            </div>
                            {device && (
                                <>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">
                                                Device ID
                                            </p>
                                            <p className="font-mono text-white">{device.deviceId}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">
                                                Status
                                            </p>
                                            <Badge variant="success">{device.status || "registered"}</Badge>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500">
                                        Last seen:{" "}
                                        {device.lastSeen
                                            ? new Date(device.lastSeen).toLocaleString()
                                            : "—"}
                                    </p>
                                </>
                            )}
                        </div>
                    </Card>

                    <Card
                        className="lg:col-span-2"
                        title="System profile"
                        subtitle="Used to filter patches (namespace, platform, current version)"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            <FormInput
                                label="Display name"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                placeholder="Drone fleet A-12"
                            />
                            <FormInput
                                label="Software namespace"
                                value={profileNs}
                                onChange={(e) => setProfileNs(e.target.value)}
                                placeholder="Must match patch software name"
                            />
                            <FormInput
                                label="Current version"
                                value={profileVer}
                                onChange={(e) => setProfileVer(e.target.value)}
                                placeholder="e.g. 1.0.5"
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-400 ml-1">
                                    Target platform
                                </label>
                                <select
                                    value={profilePlat}
                                    onChange={(e) => setProfilePlat(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                                >
                                    <option value="">Any / not set</option>
                                    <option value="windows">windows</option>
                                    <option value="linux">linux</option>
                                    <option value="arm64">arm64</option>
                                    <option value="drone-os">drone-os</option>
                                </select>
                            </div>
                        </div>
                        <Button
                            className="mt-4"
                            disabled={deviceMissing || savingProfile}
                            isLoading={savingProfile}
                            onClick={() => void saveProfile()}
                        >
                            Save profile
                        </Button>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="p-5 rounded-xl border border-white/5 bg-slate-900/40 flex items-center gap-4">
                        <Cpu className="text-amber-500 shrink-0" size={28} />
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500">Current version</p>
                            <p className="text-xl font-black text-white">
                                {profileVer || "—"}
                            </p>
                        </div>
                    </div>
                    <div className="p-5 rounded-xl border border-white/5 bg-slate-900/40 flex items-center gap-4">
                        <Package className="text-blue-500 shrink-0" size={28} />
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500">Updates available</p>
                            <p className="text-xl font-black text-white">
                                {stats?.updatesAvailable ?? 0}
                            </p>
                        </div>
                    </div>
                    <div className="p-5 rounded-xl border border-white/5 bg-slate-900/40 flex items-center gap-4">
                        <Activity className="text-emerald-500 shrink-0" size={28} />
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-500">Last install</p>
                            <p className="text-sm font-bold text-white">
                                {lastLog
                                    ? `${lastLog.status === "success" ? "✓" : "✗"} patch #${lastLog.patchId}`
                                    : "No history"}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                                {lastLog ? new Date(lastLog.timestamp).toLocaleString() : ""}
                            </p>
                        </div>
                    </div>
                </div>

                <Card
                    title="Patch status"
                    subtitle={upToDate ? "Up to date" : "A newer build matches your profile"}
                >
                    <div className="pt-4 space-y-4">
                        {updateHint && (
                            <p className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                                {updateHint}
                            </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 ">
                            {upToDate ? (
                                <Badge variant="success" className="inline-flex items-center justify-between gap-2 py-1">
                                    <CheckCircle2 size={14} /> Up to date
                                </Badge>
                            ) : (
                                <Badge variant="warning" className="inline-flex items-center justify-between gap-2 py-1">
                                    <AlertCircle size={14} /> Update available
                                </Badge>
                            )}
                        </div>

                        {recommended && (
                            <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 space-y-2">
                                <p className="text-sm font-bold text-white">
                                    {recommended.softwareName}{" "}
                                    <span className="text-emerald-400">v{recommended.version}</span>
                                </p>
                                <p className="text-xs text-slate-500 font-mono">
                                    Patch #{recommended.patchId} · IPFS {recommended.ipfsHash.slice(0, 18)}…
                                </p>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={() => void checkForUpdates()}
                                isLoading={checking}
                                disabled={deviceMissing}
                                className="gap-2"
                            >
                                <Fingerprint size={18} />
                                Check for updates
                            </Button>
                            <Button
                                onClick={() => void runInstallPipeline()}
                                disabled={deviceMissing || !recommended || installing || checking}
                                isLoading={installing}
                                className="gap-2 bg-emerald-600 hover:bg-emerald-500"
                            >
                                <Download size={18} />
                                Install update
                            </Button>
                        </div>

                        {(installing || phase !== "idle") && phase !== "checking" && (
                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                                    <span>Progress</span>
                                    <span>{phase}</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${
                                            phase === "error" ? "bg-rose-500" : "bg-emerald-500"
                                        }`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 flex items-center gap-2">
                                    {installing && phase !== "error" && phase !== "success" && (
                                        <Loader2 size={14} className="animate-spin text-emerald-500" />
                                    )}
                                    {phaseMessage}
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card title="Installation history" subtitle="Backend mirror of reports (incl. chain sync)">
                    <div className="overflow-x-auto pt-2">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[10px] uppercase text-slate-500 border-b border-white/5">
                                    <th className="pb-2 pr-4">Patch</th>
                                    <th className="pb-2 pr-4">Version</th>
                                    <th className="pb-2 pr-4">Status</th>
                                    <th className="pb-2">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log._id} className="border-b border-white/5">
                                        <td className="py-3 font-mono text-emerald-400">
                                            #{log.patchId}
                                        </td>
                                        <td className="py-3 text-slate-400">—</td>
                                        <td className="py-3">
                                            {log.status === "success" ? (
                                                <span className="text-emerald-400 flex items-center gap-1">
                                                    <ShieldCheck size={14} /> Success
                                                </span>
                                            ) : (
                                                <span className="text-rose-400 flex items-center gap-1">
                                                    <XCircle size={14} /> Failure
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 text-xs text-slate-500 font-mono">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {logs.length === 0 && (
                            <p className="text-center text-slate-500 text-sm py-8">
                                No installation events yet.
                            </p>
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
