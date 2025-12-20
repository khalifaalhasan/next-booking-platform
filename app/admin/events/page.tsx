import { createClient } from "@/utils/supabase/server";
import PageHeader from "@/components/admin/AdminPageheader";
import EventManager from "@/components/admin/events/EventManager";
import { Tables } from "@/types/supabase";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false }); // Urutkan berdasarkan tanggal acara terdekat

  if (error) console.error(error);

  const typedEvents = (events as unknown as Tables<"events">[]) || [];

  return (
    <>
      <PageHeader
        title="Manajemen Event"
        description="Kelola agenda kegiatan, workshop, dan acara UPT."
      />
      <EventManager initialData={typedEvents} />
    </>
  );
}
