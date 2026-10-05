import type { Metadata } from 'next';
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono, Permanent_Marker } from 'next/font/google';
import './globals.css';
import { PhotoboothBackdrop } from '../components/PhotoboothBackdrop.tsx';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
});

const instrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '700'],
});

const permanentMarker = Permanent_Marker({
  subsets: ['latin'],
  variable: '--font-marker',
  display: 'swap',
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Pose Please - Photobooth Night Cam Party',
  description: 'Party game multiplayer real-time adu pose meme di depan webcam ala photobooth disposable camera!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`h-full antialiased ${bricolage.variable} ${instrument.variable} ${jetbrainsMono.variable} ${permanentMarker.variable}`}
    >
      <body className="min-h-[100dvh] flex flex-col bg-[#EFE6D2] text-[#14110F] selection:bg-[#FFD93B] selection:text-[#14110F] relative">
        <PhotoboothBackdrop />
        <div className="relative z-10 min-h-[100dvh] flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
