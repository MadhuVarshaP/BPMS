"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/Cards";
import { Badge, Button } from "@/components/UI";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { bpmsContractAbi } from "@/lib/contractAbi";
import { getContractWithSigner, getFrontendContractAddress } from "@/lib/ethers";

type AccessRequest = {
  _id: string;
  walletAddress: string;
  requestedRole: "publisher";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export default function AdminRequestsPage() {
  const { address } = useWallet();
  const { showToast } = useToast();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === "pending"),
    [requests]
  );

  const fetchRequests = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${baseUrl}/api/admin/requests/publisher?status=pending`, {
        headers: {
          "x-wallet-address": address
        },
        cache: "no-store"
      });
      const data = (await response.json()) as {
        requests?: AccessRequest[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch access requests");
      }
      setRequests(data.requests || []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to fetch requests", "error");
    } finally {
      setIsLoading(false);
    }
  }, [address, showToast]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  async function approveRequest(request: AccessRequest) {
    if (!address || actionId) return;
    setActionId(request._id);
    try {
      const contractAddress = getFrontendContractAddress();
      const contract = await getContractWithSigner(contractAddress, bpmsContractAbi);
      const tx = await contract.authorizePublisher(request.walletAddress);
      await tx.wait();

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${baseUrl}/api/admin/authorize-publisher`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": address
        },
        body: JSON.stringify({
          walletAddress: request.walletAddress,
          requestId: request._id
        })
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to sync publisher approval");
      }

      showToast("Publisher approved successfully", "success");
      await fetchRequests();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Approval failed", "error");
    } finally {
      setActionId(null);
    }
  }

  async function rejectRequest(requestId: string) {
    if (!address || actionId) return;
    setActionId(requestId);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${baseUrl}/api/admin/requests/publisher/${requestId}/reject`, {
        method: "POST",
        headers: {
          "x-wallet-address": address
        }
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to reject request");
      }
      showToast("Publisher request rejected", "info");
      await fetchRequests();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Rejection failed", "error");
    } finally {
      setActionId(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
            Access Requests
          </h1>
          <p className="text-slate-400 font-medium">
            Review publisher onboarding requests and approve via blockchain first.
          </p>
        </div>

        <Card>
          {isLoading ? (
            <p className="text-slate-400">Loading pending requests...</p>
          ) : pendingRequests.length === 0 ? (
            <div className="flex items-center gap-3 text-slate-400">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span>No pending publisher requests.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request._id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-slate-900/40"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="warning">
                        <Clock3 size={12} className="inline mr-1" />
                        Pending
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(request.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-200 font-mono break-all">{request.walletAddress}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => void approveRequest(request)}
                      isLoading={actionId === request._id}
                      className="min-w-28"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => void rejectRequest(request._id)}
                      disabled={actionId === request._id}
                      className="min-w-28"
                    >
                      <XCircle size={16} className="mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
