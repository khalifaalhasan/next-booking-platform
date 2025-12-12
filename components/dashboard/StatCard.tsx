import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue: string;
  icon: LucideIcon;
  colorClass: string; // contoh: 'bg-blue-50 text-blue-600'
}

export const StatCard = ({
  label,
  value,
  subValue,
  icon: Icon,
  colorClass,
}: StatCardProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-800">{value}</h3>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClass}`}
        >
          <Icon size={24} />
        </div>
      </div>
      <p className="mt-4 text-xs font-medium text-slate-400">{subValue}</p>
    </div>
  );
};
