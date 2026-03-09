import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            primary: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20",
            secondary: "bg-slate-700 text-slate-100 hover:bg-slate-600",
            outline: "border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300",
            ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white",
            danger: "bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-500/20",
            success: "bg-emerald-500 text-white hover:bg-emerald-400",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
            icon: "h-10 w-10 p-0 flex items-center justify-center",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export const Badge = ({
    children,
    variant = "success",
    className,
}: {
    children: React.ReactNode;
    variant?: "success" | "warning" | "error" | "info" | "neutral";
    className?: string;
}) => {
    const variants = {
        success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        error: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        neutral: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };

    return (
        <span
            className={cn(
                "px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border",
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
};

export const Skeleton = ({ className }: { className?: string }) => {
    return (
        <div className={cn("animate-pulse bg-slate-800 rounded-lg", className)} />
    );
};

export const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: any;
    title: string;
    description: string;
    action?: React.ReactNode;
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="bg-slate-900 p-4 rounded-2xl text-slate-600 mb-4 border border-white/5">
                <Icon size={32} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-500 max-w-xs mb-6 font-medium">{description}</p>
            {action}
        </div>
    );
};
