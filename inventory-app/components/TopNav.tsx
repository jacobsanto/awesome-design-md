"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Plus, Package, History } from "lucide-react";

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
    <nav
      className="hidden md:flex flex-col h-full flex-shrink-0"
      style={{
        width: "240px",
        background: "var(--notion-bg-secondary)",
        borderRight: "1px solid var(--notion-border)",
      }}
    >
      {/* App title */}
      <div className="px-3 py-4" style={{ borderBottom: "1px solid var(--notion-border-light)" }}>
        <Link
          href="/"
          className="block px-2 py-1"
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--notion-text)",
            textDecoration: "none",
          }}
        >
          Home Inventory
        </Link>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-2 py-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 w-full px-2 transition-colors"
              style={{
                height: "28px",
                borderRadius: "3px",
                fontSize: "13px",
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "var(--notion-text)" : "var(--notion-text-secondary)",
                background: isActive ? "var(--notion-bg-hover)" : "transparent",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "var(--notion-bg-hover)";
                  (e.currentTarget as HTMLElement).style.color = "var(--notion-text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--notion-text-secondary)";
                }
              }}
            >
              <Icon className="flex-shrink-0" style={{ width: "14px", height: "14px" }} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
