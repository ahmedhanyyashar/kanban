import { z } from "zod";

const schema = z.object({
  VITE_API_URL: z.url().optional(),
  // set by Vite itself: true under `vite`, false in a build
  DEV: z.boolean(),
});

const { VITE_API_URL, DEV } = schema.parse(import.meta.env);

// The only place environment variables are read; Vite exposes VITE_* to the browser.
export const env = {
  // Served by the API itself in production, so there is nothing to configure: the API is the page's own
  // address. In development it runs next door.
  VITE_API_URL:
    VITE_API_URL ?? (DEV ? "http://localhost:3001" : window.location.origin),
};
