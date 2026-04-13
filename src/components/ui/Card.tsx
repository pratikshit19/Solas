import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}

export const Card = ({ children, className, glass = false }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        glass ? "glass shadow-xl" : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
};

export const GlassContainer = ({ children, className }: CardProps) => {
  return (
    <div className={cn("glass rounded-3xl p-8 shadow-2xl relative overflow-hidden", className)}>
      {/* Decorative gradient blur */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
