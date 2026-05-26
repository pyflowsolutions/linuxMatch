import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import '../../styles/tailwind.css'; // Ajustado con dos niveles de subida debido a la ruta [lang]/
import { Toaster } from 'sonner';
import { getDictionary } from './dictionaries';
import AppLayout from '@/components/AppLayout';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'LinuxMatch — Find Your Perfect Linux Distribution',
  description:
    'LinuxMatch helps you find the right Linux distro for your hardware and workflow — filter by RAM, CPU, storage, and use case to get matched instantly.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: 'es' | 'en' }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className={plusJakartaSans.className}>
        {/* Pasamos el diccionario completo y el idioma actual a la estructura global */}
        <AppLayout dict={dict} lang={lang}>
          {children}
        </AppLayout>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
            },
          }}
        />

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Flinuxmatch3678back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" />
      </body>
    </html>
  );
}