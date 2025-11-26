"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tables } from "@/types/supabase";
import {
  format,
  setHours,
  setMinutes,
  isSameDay,
  isBefore,
  startOfDay,
} from "date-fns";
import { id } from "date-fns/locale";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { toast } from "sonner"; // 1. Import Sonner

// --- CUSTOM CSS ---
const css = `
  /* Tanggal Booked (Merah Teks, Coret, Tidak Blok) */
  .rdp-day_booked { 
    color: #ef4444 !important;
    text-decoration: line-through; 
    font-weight: bold;
    background-color: transparent !important;
    opacity: 1 !important;
    pointer-events: none;
  }
  
  /* Tanggal Terpilih (Biru Blok) */
  .rdp-day_selected:not([disabled]), 
  .rdp-day_selected:focus:not([disabled]), 
  .rdp-day_selected:active:not([disabled]), 
  .rdp-day_selected:hover:not([disabled]) { 
    background-color: #2563eb !important; 
    color: white !important; 
    font-weight: bold;
  }

  /* Hari Ini */
  .rdp-day_today { 
    color: #2563eb; 
    font-weight: bold; 
  }
`;

type Service = Tables<"services">;
type Booking = Tables<"bookings">;

interface ServiceHeaderProps {
  service: Service;
  existingBookings: Booking[];
}

export default function ServiceHeader({
  service,
  existingBookings,
}: ServiceHeaderProps) {
  const router = useRouter();
  const [showCalendar, setShowCalendar] = useState<boolean | "start" | "end">(
    false
  );
  const calendarRef = useRef<HTMLDivElement>(null);

  // State Harian
  const [range, setRange] = useState<DateRange | undefined>();

  // State Per Jam
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [calendarRef]);

  // 1. LIST TANGGAL MERAH (BOOKED)
  const bookedDays = existingBookings.map((b) => ({
    from: new Date(b.start_time),
    to: new Date(b.end_time),
  }));

  // 2. LOGIC MATIKAN TANGGAL
  const getDisabledDates = (mode: "start" | "end") => {
    const basicDisabled = [{ before: startOfDay(new Date()) }];

    if (mode === "end" && startDate) {
      return [...basicDisabled, { before: startDate }];
    }
    return basicDisabled;
  };

  // 3. LOGIC MATIKAN JAM
  const isTimeDisabled = (hour: number, mode: "start" | "end") => {
    if (
      mode === "end" &&
      startDate &&
      endDate &&
      isSameDay(startDate, endDate)
    ) {
      return hour <= startDate.getHours();
    }
    return false;
  };

  // --- HANDLER SEARCH (UPDATE SONNER) ---
  const handleSearch = () => {
    let startStr = "";
    let endStr = "";

    if (service.unit === "per_day") {
      if (!range?.from || !range?.to) {
        // Ganti alert dengan toast
        toast.error("Tanggal Belum Lengkap", {
          description: "Silakan pilih tanggal Check-in dan Check-out.",
        });
        return;
      }
      startStr = range.from.toISOString();
      endStr = range.to.toISOString();
    } else {
      if (!startDate || !endDate) {
        toast.error("Waktu Belum Lengkap", {
          description: "Silakan pilih jam mulai dan selesai.",
        });
        return;
      }
      if (isBefore(endDate, startDate)) {
        toast.error("Waktu Tidak Valid", {
          description: "Waktu selesai tidak boleh sebelum waktu mulai.",
        });
        return;
      }
      startStr = startDate.toISOString();
      endStr = endDate.toISOString();
    }

    const params = new URLSearchParams({ start: startStr, end: endStr });
    router.push(`/book/${service.slug}?${params.toString()}`);
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm py-3 px-4 font-sans">
      <style>{css}</style>
      <div className="container mx-auto flex flex-col md:flex-row items-center gap-4 justify-between">
        {/* Info Service */}
        <div className="flex items-center gap-3 w-full md:w-1/3">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0">
            🏢
          </div>
          <div className="truncate">
            <h2 className="font-bold text-gray-900 truncate">{service.name}</h2>
            <p className="text-xs text-gray-500">
              Mulai{" "}
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(service.price)}{" "}
              / {service.unit === "per_day" ? "Malam" : "Jam"}
            </p>
          </div>
        </div>

        {/* INPUT AREA */}
        <div
          className="w-full md:flex-1 bg-gray-50 rounded-lg border border-gray-200 p-1 flex items-center relative"
          ref={calendarRef}
        >
          {service.unit === "per_day" ? (
            // === MODE HARIAN ===
            <div className="w-full relative">
              <button
                onClick={() => setShowCalendar(true)}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 rounded-md transition"
              >
                <span className="text-gray-500">📅</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Check-in — Check-out
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {range?.from
                      ? format(range.from, "dd MMM yyyy", { locale: id })
                      : "Pilih Tanggal"}
                    {" — "}
                    {range?.to
                      ? format(range.to, "dd MMM yyyy", { locale: id })
                      : "..."}
                  </p>
                </div>
              </button>

              {showCalendar && (
                <div className="absolute top-14 left-0 md:left-1/2 md:-translate-x-1/2 bg-white shadow-2xl rounded-xl border border-gray-100 p-4 z-50 animate-fade-in">
                  <DayPicker
                    mode="range"
                    locale={id}
                    selected={range}
                    onSelect={setRange}
                    disabled={getDisabledDates("start")}
                    modifiers={{ booked: bookedDays }}
                    modifiersClassNames={{ booked: "rdp-day_booked" }}
                    numberOfMonths={2}
                    pagedNavigation
                  />

                  {/* LEGEND */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                        <span>Pilihan Anda</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border border-gray-300 bg-white"></div>
                        <span>Tersedia</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-red-500 line-through">
                          12
                        </span>
                        <span>Sudah Dipesan</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowCalendar(false)}
                      className="text-blue-600 font-bold hover:underline ml-4"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // === MODE PER JAM ===
            <div className="w-full flex gap-2 relative">
              <DateTimeTrigger
                label="Mulai"
                value={startDate}
                onClick={() => setShowCalendar("start")}
                isActive={showCalendar === "start"}
              />

              <div className="w-px bg-gray-200 my-1"></div>

              <DateTimeTrigger
                label="Selesai"
                value={endDate}
                onClick={() => setShowCalendar("end")}
                isActive={showCalendar === "end"}
              />

              {/* Popover Gabungan */}
              {showCalendar && typeof showCalendar === "string" && (
                <div className="absolute top-14 left-0 w-full md:w-auto md:min-w-[500px] bg-white shadow-2xl rounded-xl border border-gray-100 p-0 z-50 flex flex-col md:flex-row overflow-hidden animate-fade-in">
                  {/* Kolom Kiri: Kalender */}
                  <div className="p-4 border-b md:border-b-0 md:border-r border-gray-100">
                    <p className="text-xs font-bold text-gray-400 mb-2 uppercase text-center">
                      Pilih Tanggal{" "}
                      {showCalendar === "start" ? "Mulai" : "Selesai"}
                    </p>
                    <DayPicker
                      mode="single"
                      locale={id}
                      selected={showCalendar === "start" ? startDate : endDate}
                      onSelect={(date) => {
                        if (!date) return;
                        const currentMode = showCalendar;
                        const currentTime =
                          currentMode === "start" ? startDate : endDate;
                        const hours = currentTime ? currentTime.getHours() : 8;

                        const newDate = setHours(setMinutes(date, 0), hours);

                        if (currentMode === "start") {
                          setStartDate(newDate);
                          if (endDate && isBefore(endDate, newDate))
                            setEndDate(undefined);
                        } else {
                          setEndDate(newDate);
                        }
                      }}
                      disabled={getDisabledDates(showCalendar)}
                      modifiers={{ booked: bookedDays }}
                      modifiersClassNames={{ booked: "rdp-day_booked" }}
                      captionLayout="buttons"
                    />

                    {/* LEGEND SIMPLE (PER JAM) */}
                    <div className="mt-4 pt-2 border-t border-gray-100 flex flex-wrap gap-2 text-[10px] text-gray-500 justify-center">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-red-500 line-through">
                          12
                        </span>{" "}
                        Booked
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>{" "}
                        Pilih
                      </div>
                    </div>
                  </div>

                  {/* Kolom Kanan: List Jam */}
                  <div className="w-full md:w-48 bg-gray-50 max-h-[350px] overflow-y-auto custom-scrollbar">
                    <p className="text-xs font-bold text-gray-400 p-3 uppercase sticky top-0 bg-gray-50 border-b z-10">
                      Pilih Jam
                    </p>
                    <div className="flex flex-col p-2 gap-1">
                      {Array.from({ length: 15 }).map((_, i) => {
                        const hour = i + 7;
                        const isDisabled = isTimeDisabled(hour, showCalendar);
                        const activeDate =
                          showCalendar === "start" ? startDate : endDate;
                        const isSelected =
                          activeDate && activeDate.getHours() === hour;

                        return (
                          <button
                            key={hour}
                            disabled={isDisabled}
                            onClick={() => {
                              const currentMode = showCalendar;
                              const currentDate =
                                currentMode === "start" ? startDate : endDate;
                              const baseDate = currentDate || new Date();
                              const newDate = setHours(
                                setMinutes(baseDate, 0),
                                hour
                              );

                              if (currentMode === "start")
                                setStartDate(newDate);
                              else setEndDate(newDate);
                            }}
                            className={`
                                 px-4 py-2 text-left text-sm rounded-md transition
                                 ${
                                   isDisabled
                                     ? "opacity-30 cursor-not-allowed bg-slate-100 decoration-slice"
                                     : "hover:bg-blue-100"
                                 }
                                 ${
                                   isSelected
                                     ? "bg-blue-600 text-white hover:bg-blue-700 font-bold"
                                     : "text-gray-700"
                                 }
                               `}
                          >
                            {hour.toString().padStart(2, "0")}:00
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tombol Aksi */}
        <div className="w-full md:w-auto">
          <button
            onClick={handleSearch}
            className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg active:scale-95"
          >
            {service.unit === "per_day"
              ? "Booking Sekarang"
              : "Booking Sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---
function DateTimeTrigger({ label, value, onClick, isActive }: any) {
  return (
    <div
      onClick={onClick}
      className={`flex-1 px-4 py-2 cursor-pointer rounded-md transition hover:bg-gray-100 flex flex-col justify-center ${
        isActive ? "bg-blue-50 ring-1 ring-blue-500" : ""
      }`}
    >
      <label className="text-[10px] text-gray-400 font-bold uppercase block cursor-pointer">
        {label}
      </label>
      <div className="text-sm font-bold text-gray-900 flex items-center gap-2 overflow-hidden">
        {value ? (
          <>
            <span className="text-blue-600">{format(value, "HH:00")}</span>
            <span className="text-gray-400 font-normal text-xs truncate">
              {format(value, "dd MMM", { locale: id })}
            </span>
          </>
        ) : (
          <span className="text-gray-300 font-normal">--:--</span>
        )}
      </div>
    </div>
  );
}
