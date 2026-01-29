"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { mainNavItems } from "@/config/menu"; // Import data terpusat
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DesktopNav() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `relative text-sm font-medium transition-colors duration-300 hover:text-blue-600 ${
      isActive ? "text-blue-600 font-bold" : "text-slate-600"
    } after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:bg-blue-600 after:transition-all after:duration-300 ${
      isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
    }`;
  };

  return (
    <nav className="hidden md:flex items-center gap-6">
      {mainNavItems.map((item, index) => {
        // 1. Jika item punya children, render sebagai Dropdown
        if (item.children && item.children.length > 0) {
          return (
            <DropdownMenu key={index}>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-blue-600 outline-none transition-colors group">
                {item.title}
                <ChevronDown className="h-3 w-3 transition-transform duration-300 group-data-[state=open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {item.children.map((child, childIndex) => (
                  <DropdownMenuItem key={childIndex} asChild>
                    <Link
                      href={child.href}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      {child.icon && (
                        <child.icon className="h-4 w-4 text-blue-500" />
                      )}
                      <span>{child.title}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        // 2. Jika tidak punya children, render sebagai Link biasa
        return (
          <Link
            key={index}
            href={item.href}
            className={getLinkClass(item.href)}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
