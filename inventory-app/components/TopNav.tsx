"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Plus, LayoutGrid, History, Home } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/inventory", label: "Inventory", icon: LayoutGrid },
  { href: "/item/new", label: "Add Item", icon: Plus },
  { href: "/areas", label: "Areas", icon: Package },
  { href: "/history", label: "History", icon: History },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1 bg-slate-900 text-white px-6 py-3 sticky top-0 z-40">
      <Link href="/" className="flex items-center gap-2 mr-6 font-semibold text-lg">
        <Package className="h-5 w-5" />
        Home Inventory
      </Link>
      <div className="flex items-center gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-white/20 text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
