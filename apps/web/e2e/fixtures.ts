import {
  test as base,
  type APIRequestContext,
  type BrowserContextOptions,
} from "@playwright/test";

const api = "http://localhost:3001";
const origin = "http://localhost:3100";

type Credentials = { email: string; password: string };

/** Makes an account through the API, so a test that is not about signing up does not repeat the form. */
async function signUp(
  request: APIRequestContext,
  name: string,
): Promise<Credentials> {
  const credentials = {
    email: `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`,
    password: "password1234",
  };
  const response = await request.post(`${api}/api/auth/sign-up/email`, {
    headers: { Origin: origin },
    data: { name, ...credentials },
  });
  if (!response.ok())
    throw new Error(
      `Could not create the test account: ${response.status()} (429 means too many sign-ups in a minute: wait and run again)`,
    );
  return credentials;
}

type StorageState = Exclude<
  BrowserContextOptions["storageState"],
  string | undefined
>;

/**
 * One account for the whole run, made once through the API: every test starts signed in as that
 * person. Sign-up is rate limited, so accounts are few. A test that signs out, ends the session or
 * needs an empty workspace uses `isolated` instead.
 */
export const test = base.extend<
  object,
  { account: Credentials & { state: StorageState } }
>({
  account: [
    async ({ browser }, provide) => {
      const context = await browser.newContext();
      const credentials = await signUp(context.request, "Test Person");
      const state = await context.storageState();
      await context.close();
      await provide({ ...credentials, state });
    },
    { scope: "worker" },
  ],
  storageState: async ({ account }, provide) => {
    await provide(account.state);
  },
});

/** A page whose browser is signed in as a person made for this test alone. */
export const isolated = base.extend({
  page: async ({ page, context }, provide) => {
    await signUp(context.request, "Test Person");
    await provide(page);
  },
});

export { expect } from "@playwright/test";
