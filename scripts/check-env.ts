import { loadEnvConfig } from "@next/env";
import { parseServerEnv } from "../lib/env";

loadEnvConfig(process.cwd());

const result = parseServerEnv(process.env);

if (!result.success) {
  console.error("Invalid environment configuration:");
  for (const issue of result.error.issues) {
    console.error(`- ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

console.log("Environment configuration is valid.");
