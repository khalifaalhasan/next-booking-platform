"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AdminPageHeader from "@/components/admin/AdminPageheader";

// Schema Validasi Password
const passwordSchema = z
  .object({
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function AdminSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) throw error;

      toast.success("Password berhasil diperbarui! Silakan login ulang nanti.");
      form.reset();
    } catch (error: unknown) {
      // Type-safe error handling
      const msg =
        error instanceof Error ? error.message : "Gagal mengganti password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Pengaturan Akun"
        description="Kelola keamanan dan preferensi akun Anda."
      />

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle>Keamanan</CardTitle>
            </div>
            <CardDescription>
              Ubah password akun Anda secara berkala untuk menjaga keamanan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Baru</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            type="password"
                            placeholder="******"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konfirmasi Password Baru</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <Input
                            type="password"
                            placeholder="******"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    variant="destructive"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Password
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
