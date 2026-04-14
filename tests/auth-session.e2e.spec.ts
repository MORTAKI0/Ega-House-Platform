import { expect, test } from "@playwright/test";

const protocol = process.env.E2E_AUTH_PROTOCOL ?? "https";
const platformRootDomain = process.env.E2E_AUTH_PLATFORM_DOMAIN ?? "egawilldoit.online";
const loginHost = process.env.E2E_AUTH_LOGIN_HOST ?? platformRootDomain;
const email = process.env.E2E_AUTH_EMAIL;
const password = process.env.E2E_AUTH_PASSWORD;

const workspaceHosts = {
  tasks: process.env.E2E_AUTH_TASKS_HOST ?? `tasks.${platformRootDomain}`,
  goals: process.env.E2E_AUTH_GOALS_HOST ?? `goals.${platformRootDomain}`,
  timer: process.env.E2E_AUTH_TIMER_HOST ?? `timer.${platformRootDomain}`,
  review: process.env.E2E_AUTH_REVIEW_HOST ?? `review.${platformRootDomain}`,
};

const workspaceHeadings = {
  tasks: "Tasks",
  goals: "Goals",
  timer: "Focus Timer",
  review: "Weekly Review",
} as const;

test.describe("Cross-subdomain auth session", () => {
  test.skip(
    !email || !password,
    "Set E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD to run real auth/session coverage.",
  );

  test("login once and stay authenticated across protected subdomains", async ({
    page,
  }) => {
    await page.goto(`${protocol}://${loginHost}/login`);
    await page.getByLabel("Email").fill(email ?? "");
    await page.getByLabel("Password").fill(password ?? "");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
      timeout: 20_000,
    });

    for (const [workspace, host] of Object.entries(workspaceHosts) as Array<
      [keyof typeof workspaceHosts, string]
    >) {
      await page.goto(`${protocol}://${host}/`, { waitUntil: "domcontentloaded" });
      await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
      await expect(
        page.getByRole("heading", { level: 1, name: workspaceHeadings[workspace] }),
      ).toBeVisible();
    }
  });
});
