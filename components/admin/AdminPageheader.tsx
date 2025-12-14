import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode; // Tempat untuk tombol aksi (seperti tombol Tambah)
}

export default function AdminPageHeader({
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="text-slate-500 text-sm mt-1">{description}</p>
        )}
      </div>

      {/* Area untuk Tombol Aksi */}
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
