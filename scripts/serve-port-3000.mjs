import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const PORT = 3000;
const HOST = "127.0.0.1";
const mode = process.argv[2] === "start" ? "start" : "dev";

function runPowerShell(command) {
  return new Promise((resolve) => {
    const child = spawn(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command],
      { stdio: ["ignore", "pipe", "pipe"] }
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("close", (code) => {
      resolve({ code: code ?? 0, stdout, stderr });
    });
  });
}

async function findPortPids() {
  if (process.platform !== "win32") {
    return [];
  }

  const result = await runPowerShell(
    [
      `$connections = Get-NetTCPConnection -LocalPort ${PORT} -State Listen -ErrorAction SilentlyContinue`,
      "$connections | Select-Object -ExpandProperty OwningProcess -Unique",
    ].join("; ")
  );

  return result.stdout
    .split(/\r?\n/)
    .map((line) => Number(line.trim()))
    .filter((pid) => Number.isInteger(pid) && pid > 0 && pid !== process.pid);
}

async function killWindowsPid(pid) {
  const result = await runPowerShell(`Stop-Process -Id ${pid} -Force -ErrorAction Stop`);

  if (result.code === 0) return true;

  const taskkill = spawn("taskkill.exe", ["/PID", String(pid), "/F"], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  return new Promise((resolve) => {
    taskkill.on("close", (code) => {
      resolve(code === 0);
    });
  });
}

async function canBindPort() {
  return new Promise((resolve) => {
    const server = createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(PORT, HOST);
  });
}

async function releasePort3000() {
  if (await canBindPort()) {
    return;
  }

  const pids = await findPortPids();

  if (pids.length === 0) {
    throw new Error(`Porta ${PORT} ocupada, mas nenhum PID escutando foi encontrado.`);
  }

  console.log(`Porta ${PORT} ocupada por PID(s): ${pids.join(", ")}. Encerrando para priorizar o FolioTree...`);

  for (const pid of pids) {
    const killed = await killWindowsPid(pid);
    if (!killed) {
      throw new Error(
        `Nao foi possivel encerrar o PID ${pid} na porta ${PORT}. Feche esse processo manualmente e rode npm run ${mode} novamente.`
      );
    }
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    await delay(500);
    if (await canBindPort()) {
      return;
    }
  }

  throw new Error(`A porta ${PORT} continuou ocupada depois de encerrar os processos encontrados.`);
}

function startNext() {
  const nextBin = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  const args = [mode, "--hostname", HOST, "--port", String(PORT)];

  console.log(`Iniciando FolioTree em http://${HOST}:${PORT} (${mode})`);

  const child = spawn(process.execPath, [nextBin, ...args], {
    env: {
      ...process.env,
      AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST ?? "true",
    },
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

try {
  await releasePort3000();
  startNext();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
