import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import '@fontsource-variable/fraunces';
import './globals.css';
import { Providers } from '@/components/shell/Providers';

export const metadata: Metadata = {
  title: { default: 'CEO AUTOPILOT', template: '%s · CEO AUTOPILOT' },
  description: 'La tua azienda. La tua energia. Una sola torre di controllo.',
  manifest: '/manifest.webmanifest',
  applicationName: 'CEO AUTOPILOT',
  appleWebApp: { capable: true, title: 'CEO AUTOPILOT', statusBarStyle: 'black-translucent' },
  icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-192.png' },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#0B1426',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" data-theme="dark">
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
