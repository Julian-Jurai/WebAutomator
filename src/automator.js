import notifyer from "./utils/notifyer";
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
Hooks.spoofStack = spoofStack;

const Notifications = {
  starting: () => {
    notifyer(`We're about to get started 🚗`);
    console.log("Engaging Automator 🤖");
  },
  navigatingToNeverSSL: () => {
    console.log("Started Navigation To NeverSSL ✅");
  },
  softRetryAttempt: () => {
    console.log("Attempting Soft Retry...");
    console.log("Last spoofed:", spoofStack.pop());
    console.log("Current time:", new Date());
  },
  networkConnected: () => {
    console.log("Network Connected:✅");
  },
  internetConnected: () => {
    notifyer(`All clear! ✅`);
    console.log("Internet Connected:✅");
  },
  internetConnectionAttemptFailed: () => {
    notifyer(`We've hit a snag, might need your input ⛔️`);
  },
  error: e => {
    console.error("An Error Was Encountered Before Target Was Reached ❌", e);
  }
};

const automator = async () => {
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
