export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;

const SUGGESTION_SUFFIXES = [
  "me",
  "io",
  "dev",
  "web",
  "studio",
  "work",
  "pro",
  "lab",
] as const;

export function normalizeUsernameInput(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/[._-]{2,}/g, ".")
    .replace(/^[._-]+|[._-]+$/g, "")
    .slice(0, USERNAME_MAX_LENGTH);
}

function fitUsername(candidate: string) {
  return candidate
    .replace(/[._-]{2,}/g, ".")
    .replace(/^[._-]+|[._-]+$/g, "")
    .slice(0, USERNAME_MAX_LENGTH)
    .replace(/[._-]+$/g, "");
}

function withSuffix(base: string, separator: "." | "_" | "-", suffix: string | number) {
  const suffixText = String(suffix);
  const maxBaseLength = USERNAME_MAX_LENGTH - separator.length - suffixText.length;
  const root = fitUsername(base.slice(0, Math.max(USERNAME_MIN_LENGTH, maxBaseLength)));
  return fitUsername(`${root}${separator}${suffixText}`);
}

export function buildUsernameCandidates(input: string, seed = Date.now()) {
  const normalized = normalizeUsernameInput(input);
  const base = normalized.length >= USERNAME_MIN_LENGTH ? normalized : "folio";
  const numericSeed = Math.abs(seed);
  const year = new Date(seed).getFullYear();
  const shortNumber = String((numericSeed % 900) + 100);
  const longNumber = String((numericSeed % 9000) + 1000);

  const candidates = [
    withSuffix(base, ".", year),
    withSuffix(base, "_", shortNumber),
    withSuffix(base, ".", SUGGESTION_SUFFIXES[numericSeed % SUGGESTION_SUFFIXES.length]),
    withSuffix(base, "-", longNumber),
    withSuffix(base, "_", SUGGESTION_SUFFIXES[(numericSeed + 3) % SUGGESTION_SUFFIXES.length]),
    fitUsername(`${base}${shortNumber}`),
    withSuffix(base, ".", "oficial"),
    withSuffix(base, "_", "folio"),
  ];

  return Array.from(new Set(candidates)).filter(
    (candidate) =>
      candidate.length >= USERNAME_MIN_LENGTH &&
      candidate.length <= USERNAME_MAX_LENGTH &&
      /^[a-z0-9._-]+$/.test(candidate) &&
      candidate !== normalized
  );
}

export async function suggestAvailableUsernames(
  input: string,
  exists: (candidate: string) => Promise<boolean>,
  options?: { count?: number; seed?: number }
) {
  const count = options?.count ?? 3;
  const seed = options?.seed ?? Date.now();
  const available: string[] = [];
  const seen = new Set<string>();

  async function tryCandidate(candidate: string) {
    if (available.length >= count || seen.has(candidate)) return;
    seen.add(candidate);
    if (!(await exists(candidate))) {
      available.push(candidate);
    }
  }

  for (const candidate of buildUsernameCandidates(input, seed)) {
    await tryCandidate(candidate);
  }

  let attempt = 0;
  while (available.length < count && attempt < 30) {
    const number = ((seed + attempt * 137) % 90000) + 10000;
    const separator = attempt % 2 === 0 ? "_" : ".";
    await tryCandidate(withSuffix(input, separator, number));
    attempt += 1;
  }

  return available;
}
