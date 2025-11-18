'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log to monitoring service (replace with real integration such as Sentry or LogRocket)
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <main className="flex min-h-screen items-center justify-center p-6">
          <div className="max-w-md space-y-4 rounded-lg bg-white p-6 text-center shadow-md">
            <h2 className="text-2xl font-semibold">Something went wrong!</h2>
            <p className="text-sm text-gray-600">
              An unexpected error occurred. Our team has been notified.
            </p>
            <button
              type="button"
              onClick={reset}
              className="w-full rounded-md bg-orange-500 px-4 py-2 text-white shadow hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
