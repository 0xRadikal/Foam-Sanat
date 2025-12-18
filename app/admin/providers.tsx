/* eslint-disable react/jsx-no-constructed-context-values */
'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';
import type { AdminSession } from '@/app/api/admin/lib/session';

export function AdminProviders({ children, session }: { children: React.ReactNode; session: AdminSession }) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
