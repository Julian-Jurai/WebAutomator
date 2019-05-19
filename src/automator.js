import { Notifications } from "./utils/notifyer";
import spoof from "./utils/spoof";
import { Hooks } from "./index";
import { initializeBrowser } from "./browser";
import {
  isWifiConnectedAsync,
  isInternetConnectedAsync
} from "./utils/networkStatus";
import greaseMonkeyScript, { metadata } from "./lib/greaseMonkeyScript";
import { Status } from "./main";

const NEVERSSL = "http://neverssl.com";
const spoofStack = [];

const automator = async () => {
  // Setup hooks for CLI
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
    injectScript,
    closeBrowser,
    waitUntil,
    visit
  } = await initializeBrowser();

  injectScript(greaseMonkeyScript);

  // Setup hooks for CLI
  Hooks.closeBrowser = closeBrowser;
  Hooks.spoofStack = spoofStack;

  try {
    await visit(NEVERSSL);
    Notifications.navigatingToNeverSSL();

    // Early return to avoid timeout error
    if (process.env.DEBUG_MODE) return;

    await waitUntil(metadata.completedUrl);
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
