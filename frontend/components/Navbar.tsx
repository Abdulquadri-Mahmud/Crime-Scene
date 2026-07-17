"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Search, Lock, Menu } from "lucide-react";

const LINKS = [
  { href: "/report/new", label: "File a report", icon: FileText },
  { href: "/report/track", label: "Track report", icon: Search },
  { href: "/admin/login", label: "Officer access", icon: Lock },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-panel shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo & Branding */}
        <Link href="/" className="flex items-center gap-3 group no-print">
          <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-seal to-sealDark rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
            <span className="font-display text-white font-bold text-lg">CR</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold text-ink leading-none">Crime Registry</span>
            <span className="font-mono text-xs text-seal font-semibold">Community Reports</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition-all stamp-focus relative group ${
                  isActive
                    ? "text-seal"
                    : "text-ink/70 hover:text-seal"
                }`}
              >
                <Icon size={20} />
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute -bottom-4 left-0 right-0 h-1 bg-gradient-to-r from-seal to-sealDark rounded-t-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          <button className="p-2 rounded-lg border border-line hover:bg-surface transition-colors">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
