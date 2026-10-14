'use client';

import dynamic from 'next/dynamic';

const ClientStorefront = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => <main className="page-shell"><div className="detail-skeleton" aria-label="Loading Glow Theory" /></main>,
});

export default function Storefront() { return <ClientStorefront />; }
