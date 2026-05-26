'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { Search, Menu, X, LogIn, Terminal, PlusCircle,  } from 'lucide-react';

const navItems = [
  { label: 'Distro Finder', href: '/', icon: Search },
  { label: 'Distro Detail', href: '/distro-detail', icon: Terminal },
];

export default function Topbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-card/95 backdrop-blur-sm border-b border-border card-shadow">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <AppLogo size={32} />
              <span className="font-extrabold text-lg tracking-tight text-foreground hidden sm:block">
                Linux<span className="text-primary">Match</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems?.map((item) => {
                const isActive = pathname === item?.href;
                return (
                  <Link
                    key={`nav-${item?.href}`}
                    href={item?.href}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-semibold transition-colors duration-150 ${
                      isActive
                        ? 'bg-primary-light text-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon size={15} />
                    {item?.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/sign-up-login"
                className="hidden sm:flex btn-outline text-xs px-3 py-2"
              >
                <LogIn size={14} />
                Sign In
              </Link>
              <Link
                href="/sign-up-login"
                className="btn-primary text-xs px-3 py-2"
              >
                <PlusCircle size={14} />
                Submit Distro
              </Link>
              <button
                className="md:hidden btn-ghost p-2"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
          <div
            className="absolute top-16 left-0 right-0 bg-card border-b border-border card-shadow-md animate-slide-up"
            onClick={(e) => e?.stopPropagation()}
          >
            <nav className="px-4 py-3 space-y-1">
              {navItems?.map((item) => {
                const isActive = pathname === item?.href;
                return (
                  <Link
                    key={`mobile-nav-${item?.href}`}
                    href={item?.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-primary-light text-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon size={16} />
                    {item?.label}
                  </Link>
                );
              })}
              <div className="pt-2 pb-1 border-t border-border flex flex-col gap-2">
                <Link
                  href="/sign-up-login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary text-sm justify-center"
                >
                  <LogIn size={15} />
                  Sign In
                </Link>
                <Link
                  href="/sign-up-login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary text-sm justify-center"
                >
                  <PlusCircle size={15} />
                  Submit Distro
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}