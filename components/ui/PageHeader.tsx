"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import React from "react";

interface PageHeaderProps {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  const pathname = usePathname();

  // Logic untuk membuat breadcrumbs dari URL
  const generateBreadcrumbs = () => {
    // Memecah path, misal: "/dashboard/settings" -> ["dashboard", "settings"]
    const paths = pathname.split("/").filter((path) => path);

    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join("/")}`;
      // Mengubah "my-profile" menjadi "My Profile"
      const label = path
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const isLast = index === paths.length - 1;

      return { href, label, isLast };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="relative bg-white border-b border-slate-100">
      {/* Background decoration (optional: subtle pattern) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* --- BREADCRUMBS --- */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center space-x-1.5 text-sm text-slate-500 mb-2"
          >
            <Link
              href="/"
              className="flex items-center hover:text-slate-900 transition-colors duration-200"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only">Home</span>
            </Link>

            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                {crumb.isLast ? (
                  <span className="font-medium text-slate-900 cursor-default">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-slate-900 transition-colors duration-200"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* --- TITLE & DESCRIPTION --- */}
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
