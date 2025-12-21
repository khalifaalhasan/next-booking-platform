import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

// Helper logic
export const getInitials = (name: string, email: string) => {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  return email?.substring(0, 2).toUpperCase() || "U";
};

export function useProfileData(user: User | null) {
  const supabase = createClient();

  // State Data
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    // 1. Set data dasar dari Auth Metadata (Cepat)
    setEmail(user.email || "");
    setFullName(user.user_metadata?.full_name || "");
    setAvatarUrl(user.user_metadata?.avatar_url || "");

    // 2. Cek Status Verifikasi
    const isGoogleUser = user.app_metadata.provider === "google";
    const isCustomVerified = user.user_metadata?.email_verified_custom === true;
    setIsVerified(isGoogleUser || isCustomVerified);

    try {
      // 3. Ambil data lengkap dari tabel 'profiles'
      const { data, error } = await supabase
        .from("profiles")
        .select("*") // Ambil semua kolom termasuk phone_number
        .eq("id", user.id)
        .single();

      if (data && !error) {
        // Prioritaskan data dari tabel profiles jika ada
        if (data.full_name) setFullName(data.full_name);
        if (data.phone_number) setPhone(data.phone_number);
        // Jika Anda menyimpan avatar di tabel profile juga, update disini
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const initials = getInitials(fullName, email);

  return {
    fullName,
    phone,
    email,
    avatarUrl,
    isVerified,
    initials,
    loading,
    refetch: fetchProfile, // Berguna setelah update data
  };
}
