import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Mona Sans is not in next/font/google, using Inter as high-quality substitute
// with similar geometric grotesque characteristics
const inter = Inter({
  subsets: ['latin'],
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
    images: ['/logo.jpg'],
  },
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
