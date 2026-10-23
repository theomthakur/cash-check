import "server-only";
import { z } from "zod";

const schema = z.object({
  APP_URL: z.url(),
  SNAPTRADE_CLIENT_ID: z.string().min(1),
  SNAPTRADE_CLIENT_SECRET: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  TOKEN_ENCRYPTION_KEY: z.string().min(1),
  SESSION_SIGNING_SECRET: z.string().min(32),
  OAUTH_COOKIE_SECRET: z.string().min(32),
});

export type ServerEnv = z.infer<typeof schema>;

export function env(): ServerEnv {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Server configuration is incomplete: ${parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
  }
  return parsed.data;
}
