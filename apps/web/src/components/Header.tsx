'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';

export function Header() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLanguage();

  const navItems = [
    { href: '/', label: t.nav.home },
    { href: '/about', label: t.nav.about },
    { href: '/projects', label: t.nav.projects },
    { href: '/research', label: t.nav.research },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* Top utility bar */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-end items-center h-8 text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLocale('ko')}
                className={`px-2 py-1 rounded transition-colors ${
                  locale === 'ko'
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                KR
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => setLocale('en')}
                className={`px-2 py-1 rounded transition-colors ${
                  locale === 'en'
                    ? 'text-gray-900 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-lg font-semibold text-gray-900 tracking-tight">
              Policy Research Lab
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'text-blue-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
