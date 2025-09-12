'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Drawer from '@/components/home/Drawer';

export default function DrawerWrapper() {
  const { isAuthenticatedAdmin, isLoading } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Prevent SSR vs Client mismatch
  if (!mounted) return null;

  if (isLoading) return null; // could show skeleton here if you want

  return !isAuthenticatedAdmin ? <Drawer /> : null;
}
