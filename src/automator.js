import { Notifications } from "./utils/notifyer";
import spoof from "./utils/spoof";
import { Hooks } from "./index";
import { initializeBrowser } from "./puppeteerSetup";
import {
  isWifiConnectedAsync,
  isInternetConnectedAsync
} from "./utils/networkStatus";
import greaseMonkeyScript, { metadata } from "./lib/greaseMonkeyScript";
import { Status } from "./main";

const NEVERSSL = "http://neverssl.com";
const TIMEOUT = 90 * 1000;
const spoofStack = [];

// Setup hooks for CLI

const automator = async () => {
  Hooks.spoofStack = spoofStack;
  Status.INPROGESS = true;

  if (spoofStack.length > 1) {
    Notifications.softRetryAttempt();
  } else {
    await spoof();
    spoofStack.push(new Date());
  }

  await isWifiConnectedAsync();
  Notifications.networkConnected();

  const {
    browser,
    page,
    injectScript,
    closeBrowser
  } = await initializeBrowser();

  // Setup hooks for CLI
  Hooks.closeBrowser = closeBrowser;

  injectScript(greaseMonkeyScript);

  try {
    await page.goto(NEVERSSL);
    Notifications.navigatingToNeverSSL();

    // Early return to avoid timeout error
    if (process.env.DEBUG_MODE) return;

    await browser.waitForTarget(
      target => target.url() === metadata.completedUrl,
      { timeout: TIMEOUT }
    );
  } catch (e) {
    Notifications.error(e);
  } finally {
    // Keep browser open when debugging
    if (process.env.DEBUG_MODE) return;

    await closeBrowser();

    if (await isInternetConnectedAsync()) {
      Notifications.internetConnected(e);
      spoofStack.pop();
    } else {
      Notifications.internetConnectionAttemptFailed(e);
    }
  }

  Status.INPROGESS = false;
};

export default automator;
