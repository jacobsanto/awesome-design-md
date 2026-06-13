"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Plus, MapPin, History, Home } from "lucide-react";

const navItems = [
  { href: "/",          label: "Home",      icon: Home },
  { href: "/inventory", label: "Inventory", icon: LayoutGrid },
  { href: "/item/new",  label: "Add",       icon: Plus },
  { href: "/areas",     label: "Areas",     icon: MapPin },
  { href: "/history",   label: "History",   icon: History },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E9E8E4] pb-safe">
      <div className="flex items-stretch">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[10px] transition-colors duration-100 ${
                isActive ? "text-[#37352F]" : "text-[#9B9A97]"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-[#37352F]" : "text-[#9B9A97]"}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
