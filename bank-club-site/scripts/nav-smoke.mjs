import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { readDbJson, readDbSnapshot, writeDbSnapshot } from "./db-file-lock.mjs";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3000";
const dbPath = path.join(process.cwd(), ".data", "bank-club-db.json");
const keepData = process.env.NAV_SMOKE_KEEP_DATA === "1";
const screenshotDir = process.env.NAV_SMOKE_SCREENSHOT_DIR || "/tmp/bank-club-nav-smoke";

const navCases = [
  { path: "/", activeLabel: "首頁" },
  { path: "/credit-loan", activeLabel: "信用貸款" },
  { path: "/house-loan", activeLabel: "房屋貸款" },
  { path: "/business-loan", activeLabel: "企業貸款" },
  { path: "/application-flow", activeLabel: "申辦流程" },
  { path: "/qa", activeLabel: "常見QA" },
];

function fail(message, details = []) {
  const error = new Error([message, ...details].join("\n"));
  error.name = "NavSmokeError";
  throw error;
}

async function assertNoFrameworkOverlay(page, label) {
  const overlayText = /Unhandled Runtime Error|Application error|Next\.js|webpack|Turbopack/i;
  const hasDialogOverlay = await page.locator("[data-nextjs-dialog-overlay]").isVisible({ timeout: 500 }).catch(() => false);
  const hasErrorText = await page.locator("body").getByText(overlayText).isVisible({ timeout: 500 }).catch(() => false);
  if (hasDialogOverlay || hasErrorText) fail(`${label}: framework error overlay is visible`);
}

async function activeNavLabels(page) {
  return page.locator(".main-nav > a.active, .main-nav > details > summary.active").allInnerTexts();
}

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) fail(`${label}: horizontal overflow ${overflow}px`);
}

async function waitForDb(predicate, description) {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    const db = await readDbJson(dbPath);
    if (predicate(db)) return db;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  fail(`timed out waiting for database state: ${description}`);
}

async function run() {
  const backup = keepData ? null : await readDbSnapshot(dbPath);
  await mkdir(screenshotDir, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const consoleMessages = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleMessages.push(`${message.type()}: ${message.text()}`);
    }
  });

  try {
    for (const item of navCases) {
      await page.goto(`${baseUrl}${item.path}`, { waitUntil: "load" });
      await assertNoFrameworkOverlay(page, item.path);
      await assertNoHorizontalOverflow(page, item.path);
      const labels = (await activeNavLabels(page)).map((label) => label.trim());
      if (labels.length !== 1 || labels[0] !== item.activeLabel) {
        fail(`${item.path}: expected active nav "${item.activeLabel}", got ${labels.join(", ") || "none"}`);
      }
      if ((await page.locator(".main-nav > a.active, .main-nav > details > summary.active").count()) !== 1) {
        fail(`${item.path}: expected exactly one active nav class`);
      }
    }

    const desktopNavLabels = (await page.locator(".main-nav > a, .main-nav > details > summary").allInnerTexts()).map((label) => label.trim());
    const expectedDesktopNavLabels = ["首頁", "信用貸款", "房屋貸款", "企業貸款", "申辦流程", "常見QA"];
    if (desktopNavLabels.join("|") !== expectedDesktopNavLabels.join("|")) {
      fail(`desktop header nav should match reference labels, got ${desktopNavLabels.join(", ")}`);
    }
    if ((await page.locator(".main-nav details").count()) !== 0) {
      fail("desktop header should match reference direct-keyword nav without dropdown groups");
    }

    const searchSessionId = `nav-search-${Date.now()}`;
    await page.goto(`${baseUrl}/`, { waitUntil: "load" });
    await page.evaluate((value) => {
      window.localStorage.setItem("bank_club_tracking_session_id", value);
    }, searchSessionId);
    await page.getByRole("link", { name: "搜尋文章" }).click();
    await page.waitForURL(/\/blog#article-search$/, { timeout: 8000 });
    await waitForDb(
      (db) => db.events.some((event) =>
        event.eventName === "header_search_click" &&
        event.sessionId === searchSessionId &&
        event.pagePath === "/" &&
        event.metadata?.sourcePage === "header",
      ),
      "header search click stored with session/source metadata",
    );

    await page.goto(`${baseUrl}/blog?q=${encodeURIComponent("財力")}`, { waitUntil: "load" });
    await assertNoFrameworkOverlay(page, "/blog search");
    const blogActiveLabels = (await activeNavLabels(page)).map((label) => label.trim());
    if (blogActiveLabels.length !== 0) {
      fail(`/blog should not highlight a top-level reference nav label, got ${blogActiveLabels.join(", ")}`);
    }

    const headerLineHref = await page.getByRole("link", { name: "LINE諮詢" }).first().getAttribute("href");
    if (!headerLineHref?.includes("source_page=header") || !headerLineHref?.includes("utm_medium=line_cta")) {
      fail(`header LINE CTA missing tracking params: ${headerLineHref || "missing"}`);
    }
    if ((await page.locator(".main-nav > a").filter({ hasText: "FB社團" }).count()) !== 0) {
      fail("desktop header should not render FB社團 as a top-level nav entry");
    }

    await page.goto(`${baseUrl}/application-flow`, { waitUntil: "load" });
    await page.getByRole("button", { name: "切換簡體中文" }).click();
    await page.waitForFunction(() => document.documentElement.lang === "zh-Hans");
    const simplifiedUrl = new URL(page.url());
    if (simplifiedUrl.searchParams.get("lang") !== "zh-CN") {
      fail(`language toggle should set lang=zh-CN in URL, got ${page.url()}`);
    }
    const simplifiedBrand = (await page.locator(".brand span").textContent())?.trim();
    const simplifiedNav = (await page.locator(".main-nav > a").nth(4).textContent())?.trim();
    if (simplifiedBrand !== "银行俱乐部" || simplifiedNav !== "申办流程") {
      fail(`language toggle should simplify visible header text, got brand=${simplifiedBrand}, nav=${simplifiedNav}`);
    }
    await page.getByRole("button", { name: "切換繁體中文" }).click();
    await page.waitForFunction(() => document.documentElement.lang === "zh-Hant");
    const traditionalBrand = (await page.locator(".brand span").textContent())?.trim();
    if (traditionalBrand !== "銀行俱樂部") {
      fail(`language toggle should restore traditional header text, got ${traditionalBrand}`);
    }

    await page.goto(`${baseUrl}/blog?q=${encodeURIComponent("財力")}`, { waitUntil: "load" });
    await page.screenshot({ path: path.join(screenshotDir, "blog-no-home-active.png"), fullPage: false });

    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(`${baseUrl}/contact`, { waitUntil: "load" });
    await assertNoFrameworkOverlay(page, "/contact mobile");
    await assertNoHorizontalOverflow(page, "/contact mobile");
    const mobileNavLinks = (await page.locator(".main-nav > a, .main-nav > details > summary").allInnerTexts()).map((label) => label.trim());
    if (mobileNavLinks.join("|") !== expectedDesktopNavLabels.join("|")) {
      fail(`/contact mobile: header nav should match reference labels, got ${mobileNavLinks.join(", ")}`);
    }
    await page.screenshot({ path: path.join(screenshotDir, "contact-mobile-header.png"), fullPage: false });

    const relevantConsoleMessages = consoleMessages.filter((message) => (
      !message.includes("favicon") &&
      !message.includes("was detected as the Largest Contentful Paint")
    ));
    if (relevantConsoleMessages.length) {
      fail("console reported warnings/errors during nav smoke", relevantConsoleMessages.slice(0, 10));
    }

    console.log(JSON.stringify({
      baseUrl,
      checks: [
        "home highlights only 首頁",
        "credit page highlights only 信用貸款",
        "house page highlights only 房屋貸款",
        "business page highlights only 企業貸款",
        "application flow highlights only 申辦流程",
        "QA page highlights only 常見QA",
        "header LINE CTA carries source tracking params",
        "desktop header matches reference direct-keyword nav",
        "header search icon navigates to article search and stores header_search_click",
        "language globe toggles simplified/traditional text and URL state",
        "mobile header has no horizontal overflow",
        "blog does not highlight an unrelated top-level nav item",
      ],
      screenshots: {
        blogNoHomeActive: path.join(screenshotDir, "blog-no-home-active.png"),
        contactMobileHeader: path.join(screenshotDir, "contact-mobile-header.png"),
      },
    }, null, 2));
  } finally {
    await browser.close();
    if (backup !== null) {
      await writeDbSnapshot(backup, { dbPath, label: "nav-smoke" });
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
