//.env validation through express (in fastapi: pydantic base settings) for safe parse the data validation
import dotenv from "dotenv";
import {z} from "zod";

dotenv.config({ quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .refine((v) => v.startsWith("mongodb://") || v.startsWith("mongodb+srv://"), {
      message: "MONGODB_URI must start with mongodb:// or mongodb+srv://",
    }),
  CLIENT_ORIGIN: z
    .url()
    .default("http://localhost:5173")
    .refine((v) => !v.endsWith("/"), { message: "CLIENT_ORIGIN must not end with '/'" }),
  //jwt auth layers
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be atleast 32 characters"),
  ACCESS_TOKEN_TTL: z
    .string()
    .regex(/^\d+[smhd]$/, "ACCESS_TOKEN_TTL must look like 15m, 1h or 7d")
    .default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(7),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
});

const parsed = envSchema.safeParse(process.env);

let parsedEnv;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (err) {
  console.error("Invalid environment configuration:");
  const issues = err?.issues ?? err?.errors;
  if (Array.isArray(issues)) {
    for (const issue of issues) {
      console.error(`  - ${issue.path?.join(".") || "(root)"}: ${issue.message}`);
    }
  } else {
    console.error(err);
  }
  process.exit(1);
}

export const env = Object.freeze(parsed.data);