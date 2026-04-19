export function logServerError(scope: string, error: unknown): void {
  const errorName = error instanceof Error ? error.name : typeof error;
  console.error(`[${scope}] ${errorName}`);
}
