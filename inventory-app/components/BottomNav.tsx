"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Plus, Package, History } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/inventory", label: "Inventory", icon: LayoutGrid },
  { href: "/item/new", label: "Add", icon: Plus },
  { href: "/areas", label: "Areas", icon: Package },
  { href: "/history", label: "History", icon: History },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe"
      style={{
        background: "var(--notion-bg)",
        borderTop: "1px solid var(--notion-border)",
      }}
    >
      <div className="flex items-center justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 py-2 px-3 flex-1 transition-colors"
              style={{
                fontSize: "11px",
                color: isActive ? "var(--notion-text)" : "var(--notion-text-tertiary)",
                textDecoration: "none",
              }}
            >
              <Icon style={{ width: "18px", height: "18px" }} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
