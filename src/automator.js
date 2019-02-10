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
const TIMEOUT = 90 * 1000;
const goToNeverSSL = puppeteerPage => puppeteerPage.goto(NEVERSSL);

const injectGreaseMonkeyScript = page => {
  page.on("domcontentloaded", () =>
    page.addScriptTag({ content: stringVoke(greaseMonkeyScript) })
  );
};

const automator = async () => {
  Status.INPROGESS = true;

  if (Status.ATTEMPT_SOFT_RETRY) {
    console.log("Attempting Soft Retry 🌀");
  } else await spoof();

  notifyer(`We're about to get started 🚗`);

  await isWifiConnectedAsync();
  console.log("Network Connected 📡");

  const { browser, page } = await puppeteerInit();
  injectGreaseMonkeyScript(page);

  try {
    await goToNeverSSL(page);
    console.log("Started Navigation 🔭");

    await browser.waitForTarget(
      target => target.url() === metadata.completedUrl,
      { timeout: TIMEOUT }
    );
  } catch (e) {
    console.error("🤢", e);
  } finally {
    await page.close();
    await browser.close();

    if (await isInternetConnectedAsync()) {
      console.log("Session Restored ✅");
      console.log("🤖  👍");
      notifyer(`All clear! ✅`);
      Status.ATTEMPT_SOFT_RETRY = false;
    } else {
      notifyer(`We've hit a snag, might need your input ⛔️`);
      Status.ATTEMPT_SOFT_RETRY = !Status.ATTEMPT_SOFT_RETRY;
    }
  }

  Status.INPROGESS = false;
};

export default automator;
