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

  const emptySpoofStack = () => {
    while (spoofStack.length > 0) {
      spoofStack.pop();
    }
  };

  const spoofIfNeeded = async () => {
    try {
      if (spoofStack.length > 1) {
        Notifications.softRetryAttempt();
        emptySpoofStack();
      } else {
        await spoof();
        console.log("Spoofed ✅");
        spoofStack.push(new Date());
      }
    } catch (error) {
      Notifications.error(error);
    }
  };

  const run = async () => {
    await spoofIfNeeded();

    // If wifii is not connected stop execution
    if (!(await isWifiConnected())) return;

    const {
      onPageLoadInjectScript,
      waitUntil,
      visit,
      closeBrowser
    } = await createBrowser();

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
    }

    if (await isInternetConnected()) {
      // Remove value to avoid soft retry next run
      emptySpoofStack();
      Notifications.internetConnected();
    } else {
      Notifications.internetConnectionAttemptFailed();
    }
  };

  const start = async () => {
    if (inProgress) return;
    inProgress = true;
    try {
      console.log("running...");
      await run();
    } catch (error) {
      Notifications.error(error);
    } finally {
      inProgress = false;
    }
  };

  return {
    start,
    spoofStack
  };
};

export default createAutomator;
