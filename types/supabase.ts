export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          user_id: string;
          service_id: string;
          start_time: string;
          end_time: string;
          total_price: number;
          total_paid: number | null;
          status:
            | "pending_payment"
            | "waiting_verification"
            | "confirmed"
            | "cancelled"
            | "completed";
          payment_status: "unpaid" | "partial" | "paid";
          customer_name: string | null;
          customer_phone: string | null;
          customer_email: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_id: string;
          start_time: string;
          end_time: string;
          total_price: number;
          total_paid?: number | null;
          status?:
            | "pending_payment"
            | "waiting_verification"
            | "confirmed"
            | "cancelled"
            | "completed";
          payment_status?: "unpaid" | "partial" | "paid";
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_id?: string;
          start_time?: string;
          end_time?: string;
          total_price?: number;
          total_paid?: number | null;
          status?:
            | "pending_payment"
            | "waiting_verification"
            | "confirmed"
            | "cancelled"
            | "completed";
          payment_status?: "unpaid" | "partial" | "paid";
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey";
            columns: ["service_id"];
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          user_id: string;
          amount: number;
          payment_type: string | null;
          payment_proof_url: string | null;
          status: "pending" | "verified" | "rejected";
          verified_at: string | null;
          verified_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          user_id: string;
          amount: number;
          payment_type?: string | null;
          payment_proof_url?: string | null;
          status?: "pending" | "verified" | "rejected";
          verified_at?: string | null;
          verified_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          user_id?: string;
          amount?: number;
          payment_type?: string | null;
          payment_proof_url?: string | null;
          status?: "pending" | "verified" | "rejected";
          verified_at?: string | null;
          verified_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey";
            columns: ["booking_id"];
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string | null;
          thumbnail_url: string | null;
          category: string | null;
          author_id: string | null;
          is_published: boolean;
          views_count: number;
          created_at: string;
          updated_at: string | null;
          is_featured: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content?: string | null;
          thumbnail_url?: string | null;
          category?: string | null;
          author_id?: string | null;
          is_published?: boolean;
          views_count?: number;
          created_at?: string;
          updated_at?: string | null;
          is_featured: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string | null;
          thumbnail_url?: string | null;
          category?: string | null;
          author_id?: string | null;
          is_published?: boolean;
          views_count?: number;
          created_at?: string;
          updated_at?: string | null;
          is_featured: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      blog_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      // ... (Update bagian posts di bawah ini)

      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          phone_number: string | null;
          role: "admin" | "user";
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone_number?: string | null;
          role?: "admin" | "user";
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone_number?: string | null;
          role?: "admin" | "user";
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          unit: "per_day" | "per_hour";
          specifications: Json | null;
          images: string[] | null;
          category_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price?: number;
          unit?: "per_day" | "per_hour";
          specifications?: Json | null;
          images?: string[] | null;
          category_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number;
          unit?: "per_day" | "per_hour";
          specifications?: Json | null;
          images?: string[] | null;
          category_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_: string]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_: string]: never;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
