import React from "react";
import { TrendingUp } from "lucide-react";

export const PopularServices = () => {
  const services = [
    { name: "Sewa Auditorium Utama", count: 42, percentage: "70%" },
    { name: "Kelas Pelatihan Bisnis", count: 28, percentage: "45%" },
    { name: "Sewa Co-Working Space", count: 15, percentage: "25%" },
    { name: "Konsultasi Legal", count: 9, percentage: "10%" },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="font-bold text-slate-800">Layanan Terpopuler</h3>
        <p className="text-xs text-slate-500">
          Berdasarkan total booking bulan ini
        </p>
      </div>
      <div className="p-6 space-y-5">
        {services.map((svc, idx) => (
          <div key={idx}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-slate-700">{svc.name}</span>
              <span className="text-slate-500">{svc.count} x</span>
            </div>
            {/* Simple Progress Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: svc.percentage }}
              />
            </div>
          </div>
        ))}

        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <TrendingUp size={16} />
          Analisa Lengkap
        </button>
      </div>
    </div>
  );
};
