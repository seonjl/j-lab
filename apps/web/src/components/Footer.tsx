'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t.footer.about}
            </h3>
            <p className="text-sm leading-relaxed">
              {t.footer.aboutText}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t.footer.quickLinks}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/projects" className="text-sm hover:text-white transition-colors">
                  {t.nav.projects}
                </Link>
              </li>
              <li>
                <Link href="/research" className="text-sm hover:text-white transition-colors">
                  {t.nav.research}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors">
                  {t.nav.about}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t.footer.contact}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>email@example.com</li>
              <li>GitHub</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Policy Research Lab. {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
