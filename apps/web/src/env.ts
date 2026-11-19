import { z } from "zod";

const schema = z.object({
  VITE_API_URL: z.url().optional(),
  // a public demo account: when both are set, the sign-in page offers a one-click sign-in as it
  VITE_DEMO_EMAIL: z.email().optional(),
  VITE_DEMO_PASSWORD: z.string().min(1).optional(),
  // set by Vite itself: true under `vite`, false in a build
  DEV: z.boolean(),
});

const { VITE_API_URL, VITE_DEMO_EMAIL, VITE_DEMO_PASSWORD, DEV } = schema.parse(
  import.meta.env,
);

// The only place environment variables are read; Vite exposes VITE_* to the browser.
export const env = {
  // Served by the API itself in production, so there is nothing to configure: the API is the page's own
  // address. In development it runs next door.
  VITE_API_URL:
    VITE_API_URL ?? (DEV ? "http://localhost:3001" : window.location.origin),
  demo:
    VITE_DEMO_EMAIL && VITE_DEMO_PASSWORD
      ? { email: VITE_DEMO_EMAIL, password: VITE_DEMO_PASSWORD }
      : null,
};
