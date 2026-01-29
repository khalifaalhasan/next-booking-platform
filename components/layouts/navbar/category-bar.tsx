"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ArrowRight } from "lucide-react";
import { CategoryWithServices } from "./types";

interface CategoryBarProps {
  categories: CategoryWithServices[];
}

export function CategoryBar({ categories }: CategoryBarProps) {
  const pathname = usePathname();

  // Filter kategori yang punya layanan saja
  const validCategories = categories.filter(
    (cat) => cat.services && cat.services.length > 0
  );

  return (
    <div className="hidden md:block border-t border-gray-100 bg-white relative z-40 shadow-[0_2px_3px_-1px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 h-12">
          {validCategories.map((category) => {
            const isActiveCategory =
              pathname.includes(`/services`) &&
              pathname.includes(category.slug);
            
            return (
              <div
                key={category.id}
                className="group relative h-full flex items-center"
              >
                <Link
                  href={`/services?category=${category.slug}`}
                  className={`flex items-center text-sm font-medium transition-all cursor-pointer gap-2 ${
                    isActiveCategory
                      ? "text-blue-600 font-bold"
                      : "text-slate-600 group-hover:text-blue-600"
                  }`}
                >
                  <span className="text-base opacity-70 group-hover:opacity-100 transition">
                    {category.icon || "📂"}
                  </span>
                  {category.name}
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-300 text-slate-400 group-hover:text-blue-600 ${
                      isActiveCategory
                        ? "rotate-180 text-blue-600"
                        : "group-hover:rotate-180"
                    }`}
                  />
                </Link>

                {/* Mega Menu Content */}
                <div className="absolute left-0 top-full pt-0 invisible opacity-0 -translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-50">
                  <div className="w-[600px] bg-white rounded-xl shadow-2xl border border-gray-100 p-0 grid grid-cols-12 overflow-hidden mt-0.5 ring-1 ring-black/5">
                    <div className="col-span-4 bg-slate-50 p-6 flex flex-col justify-between border-r border-slate-100">
                      <div>
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl mb-4 border border-slate-100">
                          {category.icon || "📂"}
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1 leading-tight">
                          {category.name}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Eksplorasi pilihan terbaik untuk kategori ini.
                        </p>
                      </div>
                      <Link
                        href={`/services?category=${category.slug}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-4 group/link"
                      >
                        Lihat Semua{" "}
                        <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                    <div className="col-span-8 p-5 bg-white">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Layanan Populer
                      </h5>
                      {category.services.length > 0 ? (
                        <ul className="grid grid-cols-2 gap-2">
                          {category.services.slice(0, 8).map((service) => (
                            <li key={service.id}>
                              <Link
                                href={`/services/${service.slug}`}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors group/item"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/item:bg-blue-500 transition-colors"></div>
                                <span className="text-sm text-slate-600 group-hover/item:text-blue-700 font-medium line-clamp-1">
                                  {service.name}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm italic bg-slate-50/50 rounded-lg">
                          Belum ada layanan.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}