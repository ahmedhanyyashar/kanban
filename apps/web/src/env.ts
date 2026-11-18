import { z } from "zod";

const schema = z.object({
  VITE_API_URL: z.url().default("http://localhost:3001"),
});

// The only place environment variables are read; Vite exposes VITE_* to the browser.
export const env = schema.parse(import.meta.env);
