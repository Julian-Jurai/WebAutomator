import Notifications from "./Notifications";
import spoof from "./utils/spoof";
import { Hooks } from "./index";
import { initializeBrowser } from "./browser";
import greaseMonkeyScript, { metadata } from "./lib/greaseMonkeyScript";

const NEVERSSL = "http://neverssl.com";

export default class Automator {
  constructor({ ensureWifiConnection, isInternetConnected }) {
    this.inProgress = false;
    this.spoofStack = [];
    this.ensureWifiConnection = ensureWifiConnection;
    this.isInternetConnected = isInternetConnected;

    this.start = this.start.bind(this);
  }
  async start() {
    // Return if a session is already in progress
    if (this.inProgress) return;

    this.inProgress = true;

    if (this.spoofStack.length > 1) {
      Notifications.softRetryAttempt();
    } else {
      await spoof();
      this.spoofStack.push(new Date());
    }

    await this.ensureWifiConnection();

    Notifications.networkConnected();

    const {
      injectScript,
      closeBrowser,
      waitUntil,
      visit
    } = await initializeBrowser();

    // Inject Scripts before navigation
    injectScript(greaseMonkeyScript);

    // Setup hooks for CLI
    Hooks.closeBrowser = closeBrowser;
    Hooks.spoofStack = this.spoofStack;

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

      if (await this.isInternetConnected()) {
        Notifications.internetConnected(e);
        this.spoofStack.pop();
      } else {
        Notifications.internetConnectionAttemptFailed();
      }
      this.inProgress = false;
    }
  }
}
