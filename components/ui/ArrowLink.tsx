import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArrowLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function ArrowLink({
  href,
  children,
  className,
}: ArrowLinkProps) {
  return (
    <div className={cn("pt-4 mt-auto border-t border-slate-50", className)}>
      <Link
        href={href}
        className="group flex items-center justify-between w-full"
      >
        <span className="text-sm font-bold text-blue-600 group-hover:underline decoration-blue-300 underline-offset-4 transition-all">
          {children}
        </span>

        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
    </div>
  );
}
