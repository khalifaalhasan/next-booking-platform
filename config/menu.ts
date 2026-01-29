import {
  Home,
  Info,
  Newspaper,
  FileText,
  Package,
  MoreHorizontal,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon?: any;
  children?: NavItem[]; // Untuk dropdown/submenu
}

export const mainNavItems: NavItem[] = [
  {
    title: "Beranda",
    href: "/",
    icon: Home,
  },
  {
    title: "Tentang Kami",
    href: "/about",
    icon: Info,
  },
  {
    title: "Blog",
    href: "/blog",
    icon: Newspaper,
  },
  {
    title: "Lainnya",
    href: "#", // Placeholder karena punya anak
    icon: MoreHorizontal,
    children: [
      {
        title: "Inventaris BMN",
        href: "/bmn",
        icon: Package,
      },
      {
        title: "SOP Layanan",
        href: "/sop",
        icon: FileText,
      },
    ],
  },
];
