'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tables } from '@/types/supabase';
import { format, setHours, setMinutes } from 'date-fns';
import { id } from 'date-fns/locale';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

type Service = Tables<'services'>;
type Booking = Tables<'bookings'>;

interface ServiceHeaderProps {
  service: Service;
  existingBookings: Booking[];
}

export default function ServiceHeader({ service, existingBookings }: ServiceHeaderProps) {
  const router = useRouter();
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // State Harian
  const [range, setRange] = useState<DateRange | undefined>();

  // State Per Jam (Kita simpan sebagai Object Date biar mudah diolah)
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Tutup kalender saat klik luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [calendarRef]);

  // Logic Disabled Dates
  const disabledDays = existingBookings.map((b) => ({
    from: new Date(b.start_time),
    to: new Date(b.end_time),
  }));

  const handleSearch = () => {
    let startStr = '';
    let endStr = '';

    if (service.unit === 'per_day') {
      if (!range?.from || !range?.to) {
        alert('Pilih tanggal check-in dan check-out');
        return;
      }
      startStr = range.from.toISOString();
      endStr = range.to.toISOString();
    } else {
      // Logic Per Jam
      if (!startDate || !endDate) {
        alert('Pilih waktu mulai dan selesai');
        return;
      }
      // Validasi jam
      if (startDate >= endDate) {
        alert('Waktu selesai harus setelah waktu mulai');
        return;
      }
      startStr = startDate.toISOString();
      endStr = endDate.toISOString();
    }

    const params = new URLSearchParams({ start: startStr, end: endStr });
    router.push(`/book/${service.slug}?${params.toString()}`);
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm py-3 px-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center gap-4 justify-between">
        
        {/* Info Service */}
        <div className="flex items-center gap-3 w-full md:w-1/3">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">🏢</div>
          <div className="truncate">
            <h2 className="font-bold text-gray-900 truncate">{service.name}</h2>
            <p className="text-xs text-gray-500">
              Mulai {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(service.price)} / {service.unit === 'per_day' ? 'Malam' : 'Jam'}
            </p>
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="w-full md:flex-1 bg-gray-50 rounded-lg border border-gray-200 p-1 flex items-center relative" ref={calendarRef}>
          
          {service.unit === 'per_day' ? (
            // === MODE HARIAN (Range Picker) ===
            <div className="w-full relative">
              <button 
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 rounded-md transition"
              >
                <span className="text-gray-500">📅</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Check-in — Check-out</p>
                  <p className="text-sm font-medium text-gray-900">
                    {range?.from ? format(range.from, 'dd MMM yyyy') : 'Pilih Tanggal'} 
                    {' — '}
                    {range?.to ? format(range.to, 'dd MMM yyyy') : '...'}
                  </p>
                </div>
              </button>

              {showCalendar && (
                <div className="absolute top-14 left-0 md:left-1/2 md:-translate-x-1/2 bg-white shadow-2xl rounded-xl border border-gray-100 p-4 z-50 animate-fade-in">
                  <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={setRange}
                    disabled={[{ before: new Date() }, ...disabledDays]}
                    numberOfMonths={2}
                    pagedNavigation
                  />
                </div>
              )}
            </div>
          ) : (
            // === MODE PER JAM (Custom Date + Time Picker) ===
            <div className="w-full flex gap-2 relative">
              {/* Input Mulai */}
              <DateTimeTrigger 
                label="Mulai" 
                value={startDate} 
                onClick={() => setShowCalendar('start')} 
                isActive={showCalendar === 'start'}
              />

              <div className="w-px bg-gray-200 my-1"></div>

              {/* Input Selesai */}
              <DateTimeTrigger 
                label="Selesai" 
                value={endDate} 
                onClick={() => setShowCalendar('end')} 
                isActive={showCalendar === 'end'}
              />

              {/* Popover Gabungan (Date + Time) */}
              {showCalendar && (typeof showCalendar === 'string') && (
                <div className="absolute top-14 left-0 w-full md:w-auto md:min-w-[500px] bg-white shadow-2xl rounded-xl border border-gray-100 p-0 z-50 flex flex-col md:flex-row overflow-hidden animate-fade-in">
                  
                  {/* Kolom Kiri: Kalender */}
                  <div className="p-4 border-b md:border-b-0 md:border-r border-gray-100">
                    <p className="text-xs font-bold text-gray-400 mb-2 uppercase text-center">Pilih Tanggal</p>
                    <DayPicker
                      mode="single"
                      selected={showCalendar === 'start' ? startDate : endDate}
                      onSelect={(date) => {
                         if (!date) return;
                         // Pertahankan jam jika sudah ada, atau set default jam 08:00
                         const current = showCalendar === 'start' ? startDate : endDate;
                         const hours = current ? current.getHours() : 8;
                         const newDate = setHours(date, hours);
                         
                         if (showCalendar === 'start') setStartDate(newDate);
                         else setEndDateTimeWithLogic(newDate, startDate, setEndDate);
                      }}
                      disabled={[{ before: new Date() }, ...disabledDays]}
                      captionLayout="buttons"
                    />
                  </div>

                  {/* Kolom Kanan: List Jam */}
                  <div className="w-full md:w-48 bg-gray-50 max-h-[350px] overflow-y-auto custom-scrollbar">
                     <p className="text-xs font-bold text-gray-400 p-3 uppercase sticky top-0 bg-gray-50 border-b">Pilih Jam</p>
                     <div className="flex flex-col">
                        {Array.from({ length: 15 }).map((_, i) => {
                           const hour = i + 7; // Mulai jam 07:00 sampai 21:00
                           const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
                           
                           // Cek apakah jam ini sedang dipilih
                           const activeDate = showCalendar === 'start' ? startDate : endDate;
                           const isSelected = activeDate && activeDate.getHours() === hour;

                           return (
                             <button
                               key={hour}
                               onClick={() => {
                                 // Update hanya jam-nya saja
                                 const current = showCalendar === 'start' ? startDate : endDate;
                                 const baseDate = current || new Date(); // Kalau belum pilih tanggal, pake hari ini
                                 const newDate = setHours(setMinutes(baseDate, 0), hour);

                                 if (showCalendar === 'start') setStartDate(newDate);
                                 else setEndDateTimeWithLogic(newDate, startDate, setEndDate);
                               }}
                               className={`px-4 py-3 text-left text-sm hover:bg-blue-50 transition ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700'}`}
                             >
                               {timeLabel}
                             </button>
                           )
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
            className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
          >
            {service.unit === 'per_day' ? 'Cari Kamar' : 'Cek Jadwal'}
          </button>
        </div>

      </div>
    </div>
  );
}

// --- SUB COMPONENTS / HELPERS ---

// 1. Trigger Button (Tampilan Input)
function DateTimeTrigger({ label, value, onClick, isActive }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex-1 px-4 py-2 cursor-pointer rounded-md transition hover:bg-gray-100 ${isActive ? 'bg-blue-50 ring-1 ring-blue-500' : ''}`}
    >
      <label className="text-[10px] text-gray-400 font-bold uppercase block cursor-pointer">{label}</label>
      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
         {value ? format(value, 'dd MMM, HH:00') : <span className="text-gray-400">--/--, --:--</span>}
      </div>
    </div>
  );
}

// 2. Logic helper untuk set End Date (Validasi sederhana)
function setEndDateTimeWithLogic(newEnd: Date, start: Date | undefined, setEnd: (d: Date) => void) {
    if (start && newEnd <= start) {
        alert("Waktu selesai harus lebih besar dari waktu mulai!");
        return;
    }
    setEnd(newEnd);
}