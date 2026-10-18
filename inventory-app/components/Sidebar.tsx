"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, LayoutGrid, Plus, MapPin, History, Home } from "lucide-react";

const navItems = [
  { href: "/",          label: "Dashboard",   icon: Home },
  { href: "/inventory", label: "Inventory",    icon: LayoutGrid },
  { href: "/item/new",  label: "Add Item",     icon: Plus },
  { href: "/areas",     label: "Areas",        icon: MapPin },
  { href: "/history",   label: "History",      icon: History },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-[240px] flex-shrink-0 h-full flex flex-col border-r border-[#E9E8E4] overflow-y-auto"
      style={{ background: "#F7F6F3" }}
    >
      {/* Logo */}
      <div className="px-3 pt-4 pb-2">
        <Link href="/" className="flex items-center gap-2 px-2 py-1.5 rounded-[3px] hover:bg-[#EFEFEF] transition-colors">
          <Package className="h-4 w-4 text-[#37352F] flex-shrink-0" />
          <span className="text-[14px] font-semibold text-[#37352F] truncate">Home Inventory</span>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-[#E9E8E4] mb-1" />

      {/* Nav items */}
      <nav className="flex-1 px-2 py-1 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-2 h-7 rounded-[3px] text-[13px] transition-colors duration-100 ${
                isActive
                  ? "bg-[#EFEFEF] text-[#37352F] font-medium"
                  : "text-[#787774] hover:bg-[#EFEFEF] hover:text-[#37352F]"
              }`}
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-2 border-t border-[#E9E8E4]">
        <p className="text-[11px] text-[#C4C1BB] px-2">Personal inventory</p>
      </div>
    </aside>
  );
}
