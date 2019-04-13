import { puppeteerInit } from "./puppeteerSetup";
import spoof from "./utils/spoof";
import stringVoke from "./utils/stringVoke";
import notifyer from "./utils/notifyer";

import {
  isWifiConnectedAsync,
  isInternetConnectedAsync
} from "./utils/networkStatus";
import greaseMonkeyScript, { metadata } from "./lib/greaseMonkeyScript";
import { Status } from "./main";

const NEVERSSL = "http://neverssl.com";
const TIMEOUT = process.env.DEBUG_MODE ? 1000 * 1000 : 90 * 1000;

const goToNeverSSL = puppeteerPage => puppeteerPage.goto(NEVERSSL);

const injectGreaseMonkeyScript = page => {
  page.on("domcontentloaded", () =>
    page.addScriptTag({
      content: stringVoke(greaseMonkeyScript, {
        runInDebugMode: process.env.DEBUG_MODE
      })
    })
  );
};

const automator = async () => {
  Status.INPROGESS = true;

  notifyer(`We're about to get started 🚗`);
  console.log("Engaging Automator 🤖");

  if (Status.ATTEMPT_SOFT_RETRY) {
    console.log("Attempting Soft Retry...");
  } else await spoof();

  await isWifiConnectedAsync();
  console.log("Network Connected:✅");

  const { browser, page } = await puppeteerInit();

  injectGreaseMonkeyScript(page);

  try {
    await goToNeverSSL(page);
    console.log("Started Navigation To NeverSSL ✅");

    if (process.env.DEBUG_MODE) return; // Early return to avoid timeout error

    await browser.waitForTarget(
      target => target.url() === metadata.completedUrl,
      { timeout: TIMEOUT }
    );
  } catch (e) {
    console.error("An Error Was Encountered Before Target Was Reached ❌", e);
  } finally {
    if (process.env.DEBUG_MODE) return; // Keep browser open

    await page.close();
    await browser.close();
    if (await isInternetConnectedAsync()) {
      notifyer(`All clear! ✅`);
      console.log("Internet Connected:✅");
    } else {
      notifyer(`We've hit a snag, might need your input ⛔️`);
      Status.ATTEMPT_SOFT_RETRY = !Status.ATTEMPT_SOFT_RETRY;
    }
  }

  Status.INPROGESS = false;
};

export default automator;
