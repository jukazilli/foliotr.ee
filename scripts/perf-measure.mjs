import nextEnv from "@next/env";
import { encode } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const baseUrl = process.argv[2] ?? "http://127.0.0.1:3000";
const rounds = Number(process.argv[3] ?? "5");
const loginEmail = process.env.PERF_AUDIT_EMAIL;
const loginPassword = process.env.PERF_AUDIT_PASSWORD;

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index] ?? 0;
}

async function timed(label, fn) {
  const started = performance.now();
  const result = await fn();
  return {
    label,
    ms: Math.round(performance.now() - started),
    ...result,
  };
}

async function createAuthCookie() {
  if (loginEmail && loginPassword) {
    return loginWithCredentials(loginEmail, loginPassword);
  }

  const user = await prisma.user.findFirst({
    where: {
      profile: {
        onboardingDone: true,
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      profile: {
        select: {
          displayName: true,
          headline: true,
          bio: true,
          location: true,
          pronouns: true,
          websiteUrl: true,
          publicEmail: true,
          phone: true,
          birthDate: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("No onboarded user found for perf measurements.");
  }

  const tokenPayload = {
      id: user.id,
      sub: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
  };
  const cookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
  ];
  const cookies = await Promise.all(
    cookieNames.map(async (name) => {
      const token = await encode({
        secret: process.env.AUTH_SECRET,
        salt: name,
        token: tokenPayload,
      });
      return `${name}=${token}`;
    })
  );

  return {
    cookie: cookies.join("; "),
    user,
  };
}

function appendCookies(current, setCookieHeaders) {
  const jar = new Map();

  for (const item of current.split(";").map((value) => value.trim()).filter(Boolean)) {
    const [name, ...rest] = item.split("=");
    jar.set(name, rest.join("="));
  }

  for (const header of setCookieHeaders) {
    const [pair] = header.split(";");
    const [name, ...rest] = pair.split("=");
    if (name && rest.length > 0) {
      jar.set(name, rest.join("="));
    }
  }

  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

async function loginWithCredentials(email, password) {
  let cookie = "";
  const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`, {
    redirect: "manual",
  });
  cookie = appendCookies(cookie, csrfResponse.headers.getSetCookie?.() ?? []);
  const csrf = await csrfResponse.json();

  const loginResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      csrfToken: csrf.csrfToken,
      email,
      password,
      redirect: "false",
      json: "true",
    }),
  });
  cookie = appendCookies(cookie, loginResponse.headers.getSetCookie?.() ?? []);

  if (![200, 302].includes(loginResponse.status)) {
    throw new Error(`Perf login failed with status ${loginResponse.status}: ${await loginResponse.text()}`);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      profile: {
        select: {
          displayName: true,
          headline: true,
          bio: true,
          location: true,
          pronouns: true,
          websiteUrl: true,
          publicEmail: true,
          phone: true,
          birthDate: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("Perf login user not found after credentials login.");
  }

  return { cookie, user };
}

async function request(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...init,
  });

  const text = await response.text();
  return {
    status: response.status,
    bytes: Buffer.byteLength(text),
  };
}

async function main() {
  const { cookie, user } = await createAuthCookie();
  const headers = { cookie };
  const profilePayload = {
    displayName: user.profile?.displayName ?? user.name ?? "",
    headline: user.profile?.headline ?? "",
    bio: user.profile?.bio ?? "",
    location: user.profile?.location ?? "",
    pronouns: user.profile?.pronouns ?? "",
    websiteUrl: user.profile?.websiteUrl ?? "",
    publicEmail: user.profile?.publicEmail ?? "",
    phone: user.profile?.phone ?? "",
    birthDate: user.profile?.birthDate
      ? user.profile.birthDate.toISOString().slice(0, 10)
      : null,
  };

  const checks = [
    ["GET /dashboard", () => request("/dashboard", { headers })],
    ["GET /profile", () => request("/profile", { headers })],
    ["GET /templates", () => request("/templates", { headers })],
    [
      "PUT /api/profile",
      () =>
        request("/api/profile", {
          method: "PUT",
          headers: {
            ...headers,
            "content-type": "application/json",
          },
          body: JSON.stringify(profilePayload),
        }),
    ],
  ];

  const rows = [];
  for (const [label, fn] of checks) {
    for (let index = 0; index < rounds; index += 1) {
      rows.push(await timed(label, fn));
    }
  }

  const grouped = Object.groupBy(rows, (row) => row.label);
  console.log(JSON.stringify({ baseUrl, rounds, rows, grouped }, null, 2));

  console.log("\nSummary");
  for (const [label, values] of Object.entries(grouped)) {
    const times = values.map((row) => row.ms);
    const statuses = [...new Set(values.map((row) => row.status))].join(",");
    const bytes = values[values.length - 1]?.bytes ?? 0;
    console.log(
      `${label}: status=${statuses} bytes=${bytes} min=${Math.min(...times)}ms p50=${percentile(times, 50)}ms p95=${percentile(times, 95)}ms max=${Math.max(...times)}ms`
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
