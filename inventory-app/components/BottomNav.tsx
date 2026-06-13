"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Plus, Package, History, Home } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/inventory", label: "Inventory", icon: LayoutGrid },
  { href: "/item/new", label: "Add", icon: Plus, highlight: true },
  { href: "/areas", label: "Areas", icon: Package },
  { href: "/history", label: "History", icon: History },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 pb-safe">
      <div className="flex items-center justify-around">
        {navItems.map(({ href, label, icon: Icon, highlight }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 flex-1 text-xs transition-colors ${
                highlight
                  ? "text-slate-900"
                  : isActive
                  ? "text-slate-900"
                  : "text-slate-400"
              }`}
            >
              {highlight ? (
                <span className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-900 text-white -mt-5 shadow-lg">
                  <Icon className="h-5 w-5" />
                </span>
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
