import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#082D5B',
};

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Morocco Tech Builders | Construire sa Présence en Ligne',
  description:
    "Morocco Tech Builders — Session d'échange & atelier pratique sur GitHub, portfolio et LinkedIn pour les stagiaires Développement Digital OFPPT Marrakech. Animé par Abderrahmane Raquibi.",
  keywords: ['Morocco Tech Builders', 'OFPPT', 'Développement Digital', 'GitHub', 'Portfolio', 'LinkedIn', 'Marrakech', 'Tech Morocco'],
  openGraph: {
    title: 'Morocco Tech Builders | Construire sa Présence en Ligne',
    description: 'Atelier pratique pour valoriser votre profil de développeur.',
    type: 'website',
    locale: 'fr_MA',
    images: ['/logo.svg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${inter.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
