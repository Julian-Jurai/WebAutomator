import Notifications from "./Notifications";
import spoof from "./utils/spoof";
import { createBrowser } from "./browser";

const createAutomator = ({
  isWifiConnected,
  isInternetConnected,
  greaseMonkeyScript
}) => {
  const NEVERSSL = "http://neverssl.com";
  const spoofStack = [];
  var inProgress = false;

  const spoofIfNeeded = async () => {
    try {
      if (spoofStack.length > 1) {
        Notifications.softRetryAttempt();
      } else {
        await spoof();
        console.log("Spoofed ✅");
        spoofStack.push(new Date());
      }
    } catch (error) {
      Notifications.error(error);
    }
  };

  const start = async () => {
    if (inProgress) return;

    inProgress = true;

    const {
      onPageLoadInjectScript,
      waitUntil,
      visit,
      closeBrowser
    } = await createBrowser();

    await spoofIfNeeded();

    // If wifii is not connected stop execution
    if (!(await isWifiConnected())) return;

    // Start Navigation
    try {
      onPageLoadInjectScript(greaseMonkeyScript);
      await visit(NEVERSSL);
      Notifications.navigatingToNeverSSL();
      await waitUntil(greaseMonkeyScript.metadata.completedUrl);
    } catch (error) {
      Notifications.error(error);
    } finally {
      await closeBrowser();
      inProgress = false;
    }

    if (await isInternetConnected()) {
      // Remove value to avoid soft retry next run
      spoofStack.pop();
      Notifications.internetConnected();
    } else {
      Notifications.internetConnectionAttemptFailed();
    }
  };

  return {
    start,
    spoofStack
  };
};

export default createAutomator;
