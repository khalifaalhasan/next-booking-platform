"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import SpinnerLoading from "@/components/ui/SpinnerLoading";

type LoadingContextType = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Efek: Setiap kali URL berubah (navigasi selesai), matikan loading
  useEffect(() => {
    // PERBAIKAN: Bungkus dalam setTimeout agar state update terjadi di next tick
    // Ini menghilangkan warning 'set-state-in-effect'
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 0); 

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {isLoading && <SpinnerLoading />}
      {children}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};