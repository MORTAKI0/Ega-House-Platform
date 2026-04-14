# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-session.e2e.spec.ts >> Cross-subdomain auth session >> login once and stay authenticated across protected subdomains
- Location: tests/auth-session.e2e.spec.ts:29:7

# Error details

```
Error: Login stayed on /login due to runtime error: Missing env.NEXT_PUBLIC_SUPABASE_URL
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - paragraph [ref=e5]: Root Domain Access
        - heading "Enter the control room." [level=1] [ref=e6]
        - paragraph [ref=e7]: Sign in once on the root domain and move across goals, tasks, timer, and review with the existing shared-session flow.
        - generic [ref=e8]:
          - generic [ref=e9]:
            - paragraph [ref=e10]: Goals
            - paragraph [ref=e11]: Strategic planning and roadmap workspaces.
          - generic [ref=e12]:
            - paragraph [ref=e13]: Tasks
            - paragraph [ref=e14]: Execution boards and structured delivery.
          - generic [ref=e15]:
            - paragraph [ref=e16]: Review
            - paragraph [ref=e17]: Reflection loops and operating cadence.
      - generic [ref=e22]:
        - paragraph [ref=e23]: Login
        - heading "Sign in to continue" [level=2] [ref=e24]
        - paragraph [ref=e25]: Use your email and password to unlock the protected EGA House workspaces.
        - generic [ref=e26]:
          - generic [ref=e27]:
            - generic [ref=e28]: Email
            - textbox "Email" [ref=e29]:
              - /placeholder: you@egawilldoit.online
              - text: a2003.2015@gmail.com
          - generic [ref=e30]:
            - generic [ref=e31]: Password
            - textbox "Password" [ref=e32]:
              - /placeholder: Enter your password
              - text: "12345678"
          - button "Sign in" [active] [ref=e33]
  - alert [ref=e34]
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | const protocol = process.env.E2E_AUTH_PROTOCOL ?? "https";
  4  | const platformRootDomain = process.env.E2E_AUTH_PLATFORM_DOMAIN ?? "egawilldoit.online";
  5  | const loginHost = process.env.E2E_AUTH_LOGIN_HOST ?? `www.${platformRootDomain}`;
  6  | const email = process.env.E2E_AUTH_EMAIL;
  7  | const password = process.env.E2E_AUTH_PASSWORD;
  8  | 
  9  | const workspaceHosts = {
  10 |   tasks: process.env.E2E_AUTH_TASKS_HOST ?? `tasks.${platformRootDomain}`,
  11 |   goals: process.env.E2E_AUTH_GOALS_HOST ?? `goals.${platformRootDomain}`,
  12 |   timer: process.env.E2E_AUTH_TIMER_HOST ?? `timer.${platformRootDomain}`,
  13 |   review: process.env.E2E_AUTH_REVIEW_HOST ?? `review.${platformRootDomain}`,
  14 | };
  15 | 
  16 | const workspaceHeadings = {
  17 |   tasks: "Tasks",
  18 |   goals: "Goals",
  19 |   timer: "Focus Timer",
  20 |   review: "Weekly Review",
  21 | } as const;
  22 | 
  23 | test.describe("Cross-subdomain auth session", () => {
  24 |   test.skip(
  25 |     !email || !password,
  26 |     "Set E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD to run real auth/session coverage.",
  27 |   );
  28 | 
  29 |   test("login once and stay authenticated across protected subdomains", async ({
  30 |     page,
  31 |   }) => {
  32 |     const runtimePageErrors: string[] = [];
  33 |     page.on("pageerror", (error) => {
  34 |       runtimePageErrors.push(error.message);
  35 |     });
  36 | 
  37 |     await page.goto(`${protocol}://${loginHost}/login`);
  38 |     await page.getByLabel("Email").fill(email ?? "");
  39 |     await page.getByLabel("Password").fill(password ?? "");
  40 |     await page.getByRole("button", { name: "Sign in" }).click();
  41 | 
  42 |     try {
  43 |       await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
  44 |         timeout: 20_000,
  45 |       });
  46 |     } catch (waitError) {
  47 |       if (runtimePageErrors.length > 0) {
> 48 |         throw new Error(
     |               ^ Error: Login stayed on /login due to runtime error: Missing env.NEXT_PUBLIC_SUPABASE_URL
  49 |           `Login stayed on /login due to runtime error: ${runtimePageErrors.join(" | ")}`,
  50 |         );
  51 |       }
  52 | 
  53 |       const loginErrorAlert = page.getByRole("alert").first();
  54 |       const hasLoginErrorAlert = await loginErrorAlert.isVisible().catch(() => false);
  55 | 
  56 |       if (hasLoginErrorAlert) {
  57 |         const alertText = (await loginErrorAlert.innerText()).trim();
  58 |         throw new Error(`Login stayed on /login with error: ${alertText || "Unknown error"}`);
  59 |       }
  60 | 
  61 |       throw waitError;
  62 |     }
  63 | 
  64 |     for (const [workspace, host] of Object.entries(workspaceHosts) as Array<
  65 |       [keyof typeof workspaceHosts, string]
  66 |     >) {
  67 |       await page.goto(`${protocol}://${host}/`, { waitUntil: "domcontentloaded" });
  68 |       await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
  69 |       await expect(
  70 |         page.getByRole("heading", { level: 1, name: workspaceHeadings[workspace] }),
  71 |       ).toBeVisible();
  72 |     }
  73 |   });
  74 | });
  75 | 
```