export type ServiceLite = { id: string; name: string; slug: string };

export type CategoryWithServices = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  services: ServiceLite[];
};