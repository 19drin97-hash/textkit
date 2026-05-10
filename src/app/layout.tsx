import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TextKit KI – Professionelle Texte mit KI',
  description: 'KI-gestützte Texttools für Profis. E-Mails verbessern, Texte optimieren, Zusammenfassungen erstellen.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="de">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
