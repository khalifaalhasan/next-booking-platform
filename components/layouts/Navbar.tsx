import Link from "next/link"
import { Menu, Building2 } from "lucide-react" // Icon
import UserNav from "@/components/layouts/UserNav" // Komponen UserNav yg tadi kita bahas
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        
        {/* 1. LOGO & MOBILE MENU */}
        <div className="flex items-center gap-2">
          
          {/* Mobile Menu Trigger (Hanya muncul di HP) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-medium hover:text-blue-600">
                  Home
                </Link>
                <Link href="/services" className="text-lg font-medium hover:text-blue-600">
                  Services
                </Link>
                <Link href="/about" className="text-lg font-medium hover:text-blue-600">
                  Tentang Kami
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl hidden sm:inline-block text-slate-900">
              Pusat Bisnis
            </span>
          </Link>
        </div>

        {/* 2. DESKTOP NAVIGATION (Tengah) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="transition-colors hover:text-blue-600">
            Home
          </Link>
          <Link href="/services" className="transition-colors hover:text-blue-600">
            Services
          </Link>
          <Link href="/about" className="transition-colors hover:text-blue-600">
            Tentang Kami
          </Link>
        </nav>

        {/* 3. USER ACTION (Kanan) */}
        <div className="flex items-center gap-2">
          {/* Panggil UserNav disini */}
          <UserNav />
        </div>

      </div>
    </header>
  )
}