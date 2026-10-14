import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'Glow Theory — Your Glow, Your Rules',
  description: 'Skincare, beauty, and self-care for your own kind of glow.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
