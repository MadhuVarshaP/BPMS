import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Card = ({
    children,
    className,
    title,
    subtitle,
    headerAction,
}: {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    headerAction?: React.ReactNode;
}) => {
    return (
        <div className={cn("glass-dark rounded-xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-emerald-500/5", className)}>
            {(title || subtitle || headerAction) && (
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <div>
                        {title && <h3 className="text-lg font-semibold text-white/90">{title}</h3>}
                        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
                    </div>
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}
            <div className="p-6">{children}</div>
        </div>
    );
};

export const StatCard = ({
    icon: Icon,
    label,
    value,
    trend,
    trendType = "neutral",
    className,
}: {
    icon: any;
    label: string;
    value: string | number;
    trend?: string;
    trendType?: "up" | "down" | "neutral";
    className?: string;
}) => {
    return (
        <div className={cn("glass p-5 rounded-xl border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300", className)}>
            <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={20} />
                </div>
                {trend && (
                    <div className={cn(
                        "text-xs font-bold flex items-center gap-1",
                        trendType === "up" ? "text-emerald-500" : trendType === "down" ? "text-rose-500" : "text-slate-400"
                    )}>
                        {trend}
                    </div>
                )}
            </div>
            <div className="mt-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
                <h4 className="text-2xl font-bold text-white mt-1">{value}</h4>
            </div>
            {/* Subtle background glow */}
            <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-emerald-500/5 blur-2xl rounded-full transition-all duration-500 group-hover:bg-emerald-500/10" />
        </div>
    );
};
