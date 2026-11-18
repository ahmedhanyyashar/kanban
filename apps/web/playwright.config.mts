import { defineConfig, devices } from "@playwright/test";

const signedIn = [
  "**/auth.spec.ts",
  "**/journey.spec.ts",
  "**/signed-in.spec.ts",
];

// The public-page scans need no API: a job that runs only those sets E2E_API=off.
const withApi = process.env["E2E_API"] !== "off";

export default defineConfig({
  testDir: "./e2e",
  // Sign-up is rate limited (five a minute) and the specs sign up, so one worker keeps the count known.
  workers: 1,
  reporter: [["html", { outputFolder: "./.reports/playwright/html" }]],
  outputDir: "./.reports/playwright/results",
  use: { baseURL: "http://localhost:3100" },
  // the engines people use, and a phone-sized screen. The signed-in specs run in one engine:
  // they need the API, and the engines differ little in what they check.
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: signedIn,
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testIgnore: signedIn,
    },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testIgnore: signedIn },
  ],
  webServer: [
    ...(withApi
      ? [
          {
            // the API the signed-in specs talk to; it needs DATABASE_URL and the auth settings in its environment
            command: "pnpm --filter backend dev",
            url: "http://localhost:3001/health/live",
            reuseExistingServer: !process.env["CI"],
            timeout: 120_000,
          },
        ]
      : []),
    {
      command: "pnpm dev",
      url: "http://localhost:3100",
      reuseExistingServer: !process.env["CI"],
    },
  ],
});
