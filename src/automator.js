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

const goToNeverSSL = puppeteerPage => puppeteerPage.goto(NEVERSSL);

const injectGreaseMonkeyScript = page => {
  page.on("domcontentloaded", () =>
    page.addScriptTag({ content: stringVoke(greaseMonkeyScript) })
  );
};

const automator = async () => {
  Status.INPROGESS = true;
  await spoof();
  notifyer(`We're about to get started 🚗`);
  console.log("4. Spoofed: 💨");

  await isWifiConnectedAsync();
  console.log("5. Network Connected 📡");

  const { browser, page } = await puppeteerInit();
  injectGreaseMonkeyScript(page);

  try {
    await goToNeverSSL(page);
    console.log("6. Start Navigation 🔭");

    await browser.waitForTarget(
      target => target.url() === metadata.completedUrl
    );
  } catch (e) {
    console.error("🤢", e);
  } finally {
    await page.close();
    await browser.close();

    if (await isInternetConnectedAsync()) {
      console.log("7. Session Restored ✅");
      console.log("🤖  👍");
      notifyer(`All clear! ✅`);
    } else {
      notifyer(`We've hit a snag, might need your input ⛔️`);
    }
  }

  Status.INPROGESS = false;
};

export default automator;
