//strict schema validation for password, register, login schemas   (fastapi: pydantic models)
import { z } from "zod";

const email = z.string().trim().toLowerCase().pipe(z.email().max(254));

const newPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((v) => Buffer.byteLength(v, "utf8") <= 72, {
    message: "Password must be at most 72 bytes",
  })
  .refine((v) => /[A-Za-z]/.test(v), { message: "Password must contain a letter" })
  .refine((v) => /\d/.test(v), { message: "Password must contain a number" });

export const registerSchema = z.strictObject({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50),
  email,
  password: newPassword,
});

export const loginSchema = z.strictObject({
  email,
  password: z.string().min(1, "Password is required").max(128),
});