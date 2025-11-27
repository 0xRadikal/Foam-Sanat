// app/lib/server-bootstrap.ts
// Server bootstrap utilities to validate configuration early in the runtime lifecycle
import { validateEnv } from './env';

let hasBootstrapped = false;

export function bootstrapServer(): void {
  if (hasBootstrapped) return;

  validateEnv();
  hasBootstrapped = true;
}

// Run immediately on import to fail fast during server startup
bootstrapServer();
