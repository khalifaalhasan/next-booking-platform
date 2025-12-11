import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/ui/FadeIn";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  /**
   * Override alignment default.
   * Jika tidak diisi, otomatis: Mobile (Center) -> Desktop (Left).
   * Jika diisi 'center', akan selalu center di semua device.
   */
  align?: "auto" | "center" | "left";
  action?: {
    href: string;
    label: string;
  };
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  badge,
  align = "auto", // Default baru: Auto Responsive
  action,
  className,
}: SectionHeaderProps) {
  
  // Base classes untuk container flex
  // Mobile: flex-col items-center text-center
  // Desktop (md): flex-row items-end text-left justify-between
  const containerClasses = cn(
    "flex flex-col gap-4",
    align === "center"
      ? "items-center text-center"
      : align === "left"
      ? "items-start text-left md:flex-row md:items-end md:justify-between"
      : "items-center text-center md:items-start md:text-left md:flex-row md:items-end md:justify-between" // Mode Auto
  );

  return (
    <FadeIn className={cn("mb-10 md:mb-12", className)}>
      <div className={containerClasses}>
        
        {/* Blok Teks */}
        <div className={cn("space-y-2", align === "center" ? "max-w-2xl mx-auto" : "max-w-3xl")}>
          {badge && (
            <div
              className={cn(
                "flex items-center gap-2 mb-3 text-sm font-bold text-blue-600 uppercase tracking-wider",
                // Mobile: Center, Desktop: Left (kecuali dipaksa center)
                align === "center" ? "justify-center" : "justify-center md:justify-start"
              )}
            >
              {/* Garis hiasan hanya muncul di mode Left/Desktop */}
              {(align === "left" || align === "auto") && (
                <span className="hidden md:inline-block h-px w-8 bg-blue-600"></span>
              )}
              {badge}
            </div>
          )}

          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {title}
          </h2>

          {subtitle && (
            <p className="text-lg text-slate-500 leading-relaxed mx-auto md:mx-0">
              {subtitle}
            </p>
          )}
        </div>

        {/* Tombol Aksi (Hidden di Mobile, Muncul di Desktop) */}
        {action && (
          <div className="hidden md:block shrink-0 mb-1">
            <Link href={action.href}>
              <Button
                variant="ghost"
                className="group text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2 font-semibold"
              >
                {action.label}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </FadeIn>
  );
}