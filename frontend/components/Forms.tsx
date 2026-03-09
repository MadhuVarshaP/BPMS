import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./UI";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="glass-dark border border-white/10 rounded-2xl w-full max-w-lg relative z-10 shadow-emerald-500/10 shadow-2xl animate-fade-in overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>

                {footer && (
                    <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3 bg-white/2 pt-4 pb-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export const FormInput = ({
    label,
    placeholder,
    value,
    onChange,
    type = "text",
    error,
}: {
    label: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    error?: string;
}) => {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400 ml-1">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={cn(
                    "w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all",
                    error && "border-rose-500 focus:ring-rose-500/50 focus:border-rose-500/50"
                )}
            />
            {error && <p className="text-xs text-rose-500 ml-1">{error}</p>}
        </div>
    );
};
