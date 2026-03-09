"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_ADDRESS, PUBLISHER_LIST, DEVICE_LIST } from "@/data/mockData";

type Role = "admin" | "publisher" | "device" | "unauthorized" | null;

interface WalletContextType {
    address: string | null;
    role: Role;
    isLoading: boolean;
    connectWallet: (mockAddress?: string) => void;
    disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [address, setAddress] = useState<string | null>(null);
    const [role, setRole] = useState<Role>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const getRole = (addr: string): Role => {
        if (addr.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) return "admin";
        if (PUBLISHER_LIST.some((p) => p.toLowerCase() === addr.toLowerCase())) return "publisher";
        if (DEVICE_LIST.some((d) => d.toLowerCase() === addr.toLowerCase())) return "device";
        return "unauthorized";
    };

    const connectWallet = (mockAddress?: string) => {
        setIsLoading(true);
        // Simulate wallet connection delay
        setTimeout(() => {
            const addr = mockAddress || ADMIN_ADDRESS; // Default to admin for easy testing if no address provided
            const detectedRole = getRole(addr);

            setAddress(addr);
            setRole(detectedRole);
            setIsLoading(false);

            if (detectedRole === "admin") router.push("/admin/dashboard");
            else if (detectedRole === "publisher") router.push("/publisher/dashboard");
            else if (detectedRole === "device") router.push("/device/dashboard");
            else router.push("/unauthorized");
        }, 1000);
    };

    const disconnectWallet = () => {
        setAddress(null);
        setRole(null);
        router.push("/");
    };

    return (
        <WalletContext.Provider
            value={{ address, role, isLoading, connectWallet, disconnectWallet }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}
