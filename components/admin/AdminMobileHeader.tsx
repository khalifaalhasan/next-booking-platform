"use client";

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import AdminSidebar from "./AdminSidebar"; // Reuse Sidebar Desktop

export default function AdminMobileHeader() {
  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b bg-white sticky top-0 z-50">
      <span className="font-bold text-slate-900">Admin Panel</span>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
           {/* Panggil Sidebar yang sama di dalam Sheet */}
           <AdminSidebar className="border-none" />
        </SheetContent>
      </Sheet>
    </div>
  );
}