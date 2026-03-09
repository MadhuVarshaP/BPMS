"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType = "info") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={cn(
                            "glass-dark border p-4 rounded-xl shadow-2xl animate-fade-in flex items-start gap-3 transition-all",
                            toast.type === "success" ? "border-emerald-500/20" :
                                toast.type === "error" ? "border-rose-500/20" :
                                    toast.type === "warning" ? "border-amber-500/20" : "border-blue-500/20"
                        )}
                    >
                        <div className={cn(
                            "p-2 rounded-lg",
                            toast.type === "success" ? "bg-emerald-500/10 text-emerald-500" :
                                toast.type === "error" ? "bg-rose-500/10 text-rose-500" :
                                    toast.type === "warning" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                        )}>
                            {toast.type === "success" && <CheckCircle2 size={18} />}
                            {toast.type === "error" && <XCircle size={18} />}
                            {toast.type === "warning" && <AlertCircle size={18} />}
                            {toast.type === "info" && <Info size={18} />}
                        </div>
                        <div className="flex-1 pt-1">
                            <p className="text-sm font-bold text-white tracking-tight">{toast.message}</p>
                        </div>
                        <button onClick={() => removeToast(toast.id)} className="p-1 text-slate-500 hover:text-white transition-all">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
