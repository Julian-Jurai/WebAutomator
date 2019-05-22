import Notifications from "./Notifications";
import spoof from "./utils/spoof";
import { initializeBrowser } from "./browser";

const NEVERSSL = "http://neverssl.com";

export default class Automator {
  constructor({
    ensureWifiConnection,
    isInternetConnected,
    cliHooks,
    greaseMonkeyScript
  }) {
    this.inProgress = false;
    this.spoofStack = [];

    this.ensureWifiConnection = ensureWifiConnection;
    this.cliHooks = cliHooks;
    this.greaseMonkeyScript = greaseMonkeyScript;
    this.isInternetConnected = isInternetConnected;

    // Setup hooks for CLI
    this.cliHooks.spoofStack = this.spoofStack;
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

    try {
      await this.ensureWifiConnection();
      Notifications.networkConnected();
    } catch (error) {
      Notifications.wifiiConnectAttemptFailed(error);
    }

    const {
      injectScript,
      closeBrowser,
      waitUntil,
      visit
    } = await initializeBrowser();

    // Inject Scripts before navigation
    injectScript(this.greaseMonkeyScript);

    // Setup hooks for CLI
    this.cliHooks.closeBrowser = closeBrowser;

    try {
      await visit(NEVERSSL);
      Notifications.navigatingToNeverSSL();

      // Early return to avoid timeout error
      if (process.env.DEBUG_MODE) return;

      await waitUntil(this.greaseMonkeyScript.metadata.completedUrl);
    } catch (e) {
      Notifications.error(e);
    } finally {
      // Keep browser open when debugging
      if (process.env.DEBUG_MODE) return;

      await closeBrowser();

      if (await this.isInternetConnected()) {
        Notifications.internetConnected();
        this.spoofStack.pop();
      } else {
        Notifications.internetConnectionAttemptFailed();
      }
      this.inProgress = false;
    }
  }
}
