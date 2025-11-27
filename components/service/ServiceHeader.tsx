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
  addDays,
  addHours,
  subHours,
  startOfHour,
  areIntervalsOverlapping,
  differenceInDays,
  differenceInHours,
  differenceInCalendarDays,
} from "date-fns";
import { id } from "date-fns/locale";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { toast } from "sonner";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Check,
  ArrowRight,
  Minus,
  Plus,
} from "lucide-react";

// --- CUSTOM CSS ---
const css = `
  .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #2563eb; margin: 0; }
  .rdp-button:hover:not([disabled]) { color: #2563eb; background-color: #eff6ff; }
  
  .rdp-day_booked { 
    color: #ef4444 !important; 
    text-decoration: line-through; 
    opacity: 0.5; 
    pointer-events: none; 
  }

  .rdp-day_selected:not([disabled]), 
  .rdp-day_selected:focus:not([disabled]), 
  .rdp-day_selected:active:not([disabled]), 
  .rdp-day_selected:hover:not([disabled]) { 
    background-color: #2563eb !important; 
    color: white !important; 
    font-weight: bold;
  }

  .rdp-day_today { color: #2563eb; font-weight: 900; }

  @media (min-width: 768px) {
    .rdp-months { display: flex !important; flex-flow: row nowrap !important; gap: 2rem; }
    .rdp-month { margin: 0 !important; }
    .rdp-caption { text-align: center; }
    .rdp { --rdp-cell-size: 36px; }
  }

  @media (max-width: 768px) {
    .rdp { --rdp-cell-size: 38px; } 
    .rdp-months { justify-content: center; }
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

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"start" | "end">("start");
  const [mobileTimeTab, setMobileTimeTab] = useState<"start" | "end">("start");
  const containerRef = useRef<HTMLDivElement>(null);

  const [range, setRange] = useState<DateRange | undefined>();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [numMonths, setNumMonths] = useState(2);

  // Helper Cek Slot
  const isSlotAvailable = (start: Date, end: Date) => {
    return !existingBookings.some((b) =>
      areIntervalsOverlapping(
        { start, end },
        { start: new Date(b.start_time), end: new Date(b.end_time) }
      )
    );
  };

  // --- SMART DEFAULTS ---
  useEffect(() => {
    if (service.unit === "per_day" && !range) {
      let potentialStart = startOfDay(new Date());
      let potentialEnd = addDays(potentialStart, 1);
      let attempts = 0;
      while (!isSlotAvailable(potentialStart, potentialEnd) && attempts < 60) {
        potentialStart = addDays(potentialStart, 1);
        potentialEnd = addDays(potentialStart, 1);
        attempts++;
      }
      setRange({ from: potentialStart, to: potentialEnd });
    } else if (service.unit === "per_hour" && !startDate) {
      let potentialStart = startOfHour(addHours(new Date(), 1));
      let potentialEnd = addHours(potentialStart, 1);
      let attempts = 0;
      while (!isSlotAvailable(potentialStart, potentialEnd) && attempts < 48) {
        potentialStart = addHours(potentialStart, 1);
        potentialEnd = addHours(potentialStart, 1);
        attempts++;
      }
      setStartDate(potentialStart);
      setEndDate(potentialEnd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => setNumMonths(window.innerWidth < 768 ? 1 : 2);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        window.innerWidth >= 768 &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [containerRef]);

  const bookedDays = existingBookings.map((b) => ({
    from: new Date(b.start_time),
    to: new Date(b.end_time),
  }));
  const disabledDates = [{ before: startOfDay(new Date()) }];

  // --- HANDLERS ---

  const handleRangeSelect = (val: DateRange | undefined) => {
    if (range?.from && range?.to && val?.from && !val.to) {
      setRange({ from: val.from, to: undefined });
      return;
    }
    setRange(val);
  };

  const handleDayClick = (date: Date) => {
    const currentHour = startDate ? startDate.getHours() : 8;
    const newStart = setHours(setMinutes(date, 0), currentHour);
    setStartDate(newStart);
    setEndDate(addHours(newStart, 1));
    setMobileTimeTab("start");
  };

  // Handler Desktop List
  const handleStartHourClick = (hour: number) => {
    const baseDate = startDate || new Date();
    const newStart = setHours(setMinutes(baseDate, 0), hour);
    setStartDate(newStart);
    setEndDate(addHours(newStart, 1));
  };

  const handleEndTimestampClick = (timestamp: Date) => {
    setEndDate(timestamp);
  };

  // --- HANDLER STEPPER MOBILE (BARU) ---
  const handleMobileTimeAdjust = (
    type: "start" | "end",
    operation: "add" | "sub"
  ) => {
    if (!startDate) return;

    const baseDate =
      type === "start" ? startDate : endDate || addHours(startDate, 1);
    const newDate =
      operation === "add" ? addHours(baseDate, 1) : subHours(baseDate, 1);

    // Validasi Start: Tidak boleh masa lalu
    if (type === "start" && isBefore(newDate, new Date())) {
      toast.error("Waktu tidak valid");
      return;
    }

    // Validasi End: Tidak boleh <= Start
    if (type === "end" && !isBefore(startDate, newDate)) {
      toast.error("Waktu selesai harus setelah waktu mulai");
      return;
    }

    if (type === "start") {
      setStartDate(newDate);
      // Jika start digeser melewati end, end ikut geser (+1 jam)
      if (
        endDate &&
        ((isSameDay(newDate, endDate) &&
          newDate.getHours() >= endDate.getHours()) ||
          isBefore(endDate, newDate))
      ) {
        setEndDate(addHours(newDate, 1));
      }
    } else {
      setEndDate(newDate);
    }
  };

  const handleApply = () => {
    setIsOpen(false);
    toast.success("Jadwal tersimpan.");
  };

  const handleSearch = () => {
    let startStr = "",
      endStr = "";
    if (service.unit === "per_day") {
      if (!range?.from || !range?.to)
        return toast.error("Pilih tanggal check-in & check-out");
      startStr = range.from.toISOString();
      endStr = range.to.toISOString();
    } else {
      if (!startDate || !endDate)
        return toast.error("Pilih jam mulai & selesai");
      if (isBefore(endDate, startDate)) return toast.error("Waktu tidak valid");
      startStr = startDate.toISOString();
      endStr = endDate.toISOString();
    }
    const params = new URLSearchParams({ start: startStr, end: endStr });
    router.push(`/book/${service.slug}?${params.toString()}`);
  };

  const getHeaderInfo = () => {
    if (service.unit === "per_day") {
      if (!range?.from) return "📅 Kapan mau Check-in?";
      if (!range?.to) return "📅 Kapan mau Check-out?";
      const days = differenceInDays(range.to, range.from) || 1;
      return `✅ Total ${days} Malam terpilih`;
    } else {
      if (!startDate || !endDate) return "🕒 Pilih Jam";
      const hours = differenceInHours(endDate, startDate);
      return `✅ Total ${hours} Jam (${format(startDate, "HH:00")} - ${format(
        endDate,
        "HH:00"
      )})`;
    }
  };

  const getEndHourOptions = () => {
    if (!startDate) return [];
    const options = [];
    for (let i = 1; i <= 24; i++) {
      const nextTime = addHours(startDate, i);
      options.push(nextTime);
    }
    return options;
  };

  return (
    <>
      <style>{css}</style>
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between h-auto md:h-20 py-3 md:py-0 gap-4">
            {/* INFO SERVICE */}
            <div className="w-full md:w-1/3 flex items-center gap-3 overflow-hidden">
              <div className="bg-blue-50 text-blue-600 p-2 rounded-lg shrink-0">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-gray-900 truncate">
                  {service.name}
                </h2>
                <p className="text-xs text-gray-500 truncate">
                  Mulai{" "}
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(service.price)}
                  /{service.unit === "per_day" ? "Malam" : "Jam"}
                </p>
              </div>
            </div>

            {/* INPUT TRIGGER */}
            <div className="w-full md:flex-1 relative" ref={containerRef}>
              <div
                className="flex items-center border border-gray-300 rounded-full p-1 cursor-pointer hover:shadow-md transition bg-white"
                onClick={() => setIsOpen(!isOpen)}
              >
                {service.unit === "per_day" ? (
                  <div className="flex-1 px-4 py-2 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">
                        Masuk
                      </span>
                      <span
                        className={`text-sm ${
                          range?.from
                            ? "font-semibold text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        {range?.from
                          ? format(range.from, "dd MMM yyyy", { locale: id })
                          : "Pilih"}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 mx-2" />
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">
                        Keluar
                      </span>
                      <span
                        className={`text-sm ${
                          range?.to
                            ? "font-semibold text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        {range?.to
                          ? format(range.to, "dd MMM yyyy", { locale: id })
                          : "Pilih"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 px-4 py-2 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">
                        Mulai
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {startDate
                          ? format(startDate, "dd MMM, HH:00")
                          : "Pilih"}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 mx-2" />
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">
                        Selesai
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {endDate ? format(endDate, "dd MMM, HH:00") : "Pilih"}
                      </span>
                    </div>
                  </div>
                )}
                <div className="bg-blue-600 text-white p-3 rounded-full shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              {/* --- POPOVER CONTENT --- */}
              {isOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                  />

                  <div
                    className={`
                            absolute z-50 bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col rounded-2xl
                            fixed-mobile-bottom
                            md:top-[110%] md:left-1/2 md:-translate-x-1/2 md:w-[680px]
                        `}
                  >
                    <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between shrink-0">
                      <span className="text-sm font-bold text-blue-700 truncate max-w-[85%]">
                        {getHeaderInfo()}
                      </span>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden"
                      >
                        <X className="w-5 h-5 text-blue-400" />
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row h-full md:h-auto">
                      {/* 1. KALENDER */}
                      <div
                        className={`p-4 flex justify-center items-start border-b md:border-b-0 md:border-r border-gray-100 ${
                          service.unit === "per_day" ? "w-full" : "md:w-auto"
                        }`}
                      >
                        {service.unit === "per_day" ? (
                          <DayPicker
                            mode="range"
                            selected={range}
                            onSelect={handleRangeSelect}
                            numberOfMonths={numMonths}
                            locale={id}
                            disabled={disabledDates}
                            modifiers={{ booked: bookedDays }}
                            modifiersClassNames={{ booked: "rdp-day_booked" }}
                            pagedNavigation
                          />
                        ) : (
                          <DayPicker
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => {
                              if (date) handleDayClick(date);
                            }}
                            numberOfMonths={1}
                            locale={id}
                            disabled={disabledDates}
                            modifiers={{ booked: bookedDays }}
                            modifiersClassNames={{ booked: "rdp-day_booked" }}
                            pagedNavigation
                          />
                        )}
                      </div>

                      {/* 2. JAM SELECTOR (DESKTOP ONLY) */}
                      {service.unit === "per_hour" && (
                        <div className="hidden md:flex flex-row w-full md:w-auto divide-x divide-gray-100 h-[320px]">
                          <div className="flex-1 flex flex-col w-36 h-full">
                            <div className="p-3 bg-white sticky top-0 border-b font-bold text-xs text-gray-500 uppercase text-center z-10">
                              Mulai
                            </div>
                            <div className="p-2 space-y-1 overflow-y-auto custom-scrollbar flex-1">
                              {Array.from({ length: 24 }).map((_, h) => {
                                const isDisabled =
                                  startDate &&
                                  isSameDay(startDate, new Date()) &&
                                  h < new Date().getHours();
                                const isSelected = startDate?.getHours() === h;
                                return (
                                  <button
                                    key={h}
                                    disabled={isDisabled}
                                    onClick={() => handleStartHourClick(h)}
                                    className={`w-full py-2 text-sm rounded-md transition block text-center ${
                                      isDisabled
                                        ? "opacity-30 cursor-not-allowed"
                                        : "hover:bg-blue-50"
                                    } ${
                                      isSelected
                                        ? "bg-blue-600 text-white font-bold"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {h.toString().padStart(2, "0")}:00
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col w-44 bg-gray-50/50 h-full">
                            <div className="p-3 bg-gray-50 sticky top-0 border-b font-bold text-xs text-gray-500 uppercase text-center z-10">
                              Selesai
                            </div>
                            <div className="p-2 space-y-1 overflow-y-auto custom-scrollbar flex-1">
                              {startDate ? (
                                getEndHourOptions().map((timeObj, i) => {
                                  const isConflict = !isSlotAvailable(
                                    startDate,
                                    timeObj
                                  );
                                  const isSelected = endDate
                                    ? timeObj.getTime() === endDate.getTime()
                                    : false;
                                  const dayDiff = differenceInCalendarDays(
                                    timeObj,
                                    startDate
                                  );
                                  return (
                                    <button
                                      key={i}
                                      disabled={isConflict}
                                      onClick={() =>
                                        handleEndTimestampClick(timeObj)
                                      }
                                      className={`w-full py-2 text-sm rounded-md transition block text-center flex items-center justify-center gap-1 ${
                                        isConflict
                                          ? "opacity-30 cursor-not-allowed text-red-400 line-through"
                                          : "hover:bg-green-50"
                                      } ${
                                        isSelected
                                          ? "bg-green-600 text-white font-bold"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      <span>{format(timeObj, "HH:00")}</span>
                                      {dayDiff > 0 && (
                                        <span className="text-[10px] opacity-70">
                                          (+{dayDiff}hr)
                                        </span>
                                      )}
                                    </button>
                                  );
                                })
                              ) : (
                                <div className="p-4 text-center text-xs text-gray-400 italic mt-10">
                                  Pilih jam mulai dulu
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. JAM STEPPER (MOBILE ONLY - BARU) */}
                      {service.unit === "per_hour" && (
                        <div className="md:hidden w-full bg-slate-50 p-4 flex flex-col gap-4">
                          {/* TAB SWITCHER */}
                          <div className="flex p-1 bg-white rounded-lg border border-gray-200">
                            <button
                              onClick={() => setMobileTimeTab("start")}
                              className={`flex-1 py-2 text-xs font-bold rounded-md transition ${
                                mobileTimeTab === "start"
                                  ? "bg-blue-600 text-white shadow"
                                  : "text-gray-500"
                              }`}
                            >
                              MULAI
                            </button>
                            <button
                              onClick={() => setMobileTimeTab("end")}
                              className={`flex-1 py-2 text-xs font-bold rounded-md transition ${
                                mobileTimeTab === "end"
                                  ? "bg-blue-600 text-white shadow"
                                  : "text-gray-500"
                              }`}
                            >
                              SELESAI
                            </button>
                          </div>

                          {/* STEPPER CONTROL */}
                          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <button
                              onClick={() =>
                                handleMobileTimeAdjust(mobileTimeTab, "sub")
                              }
                              className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 active:scale-95 transition"
                            >
                              <Minus className="w-5 h-5" />
                            </button>

                            <div className="text-center">
                              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                {mobileTimeTab === "start"
                                  ? "Jam Mulai"
                                  : "Jam Selesai"}
                              </span>
                              <span className="block text-3xl font-bold text-blue-600">
                                {mobileTimeTab === "start"
                                  ? startDate
                                    ? format(startDate, "HH:00")
                                    : "--:--"
                                  : endDate
                                  ? format(endDate, "HH:00")
                                  : "--:--"}
                              </span>
                              <span className="block text-xs text-gray-500 mt-1">
                                {mobileTimeTab === "start"
                                  ? startDate
                                    ? format(startDate, "dd MMM yyyy", {
                                        locale: id,
                                      })
                                    : "-"
                                  : endDate
                                  ? format(endDate, "dd MMM yyyy", {
                                      locale: id,
                                    })
                                  : "-"}
                              </span>
                            </div>

                            <button
                              onClick={() =>
                                handleMobileTimeAdjust(mobileTimeTab, "add")
                              }
                              className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-full text-white hover:bg-blue-700 active:scale-95 transition"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
                      <button
                        onClick={handleApply}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-6 rounded-lg transition active:scale-95 flex items-center gap-2 shadow-sm"
                      >
                        <Check className="w-4 h-4" /> Terapkan
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-full md:w-auto">
              <button
                onClick={handleSearch}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition active:scale-95"
              >
                Booking
              </button>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          .fixed-mobile-bottom {
            position: fixed !important;
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            transform: none !important;
            width: 100% !important;
            min-width: 100% !important;
            border-radius: 20px 20px 0 0 !important;
            max-height: 85vh;
            overflow-y: auto;
          }
        }
      `}</style>
    </>
  );
}

// ... DateTimeTrigger Component sama ...
interface DateTimeTriggerProps {
  label: string;
  value: Date | undefined;
  onClick: () => void;
  isActive: boolean;
}

function DateTimeTrigger({
  label,
  value,
  onClick,
  isActive,
}: DateTimeTriggerProps) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
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
