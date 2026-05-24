"use client";

import dynamic from 'next/dynamic';

// Defer loading of heavy AuthModal component completely on client side
const AuthModal = dynamic(() => import('./AuthModal'), { ssr: false });

export default function ClientAuthModal() {
  return <AuthModal />;
}
