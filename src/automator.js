import Notifications from "./Notifications";
import spoof from "./utils/spoof";
import { initializeBrowser } from "./browser";

const createAutomator = ({
  isWifiConnected,
  isInternetConnected,
  greaseMonkeyScript
}) => {
  const NEVERSSL = "http://neverssl.com";
  const spoofStack = [];
  const stopCbs = [];
  let inProgress = false;

  const addStopCB = cb => stopCbs.push(cb);

  const spoofIfNeeded = async () => {
    try {
      if (spoofStack.length > 1) {
        Notifications.softRetryAttempt();
      } else {
        await spoof();
        spoofStack.push(new Date());
      }
    } catch (error) {
      Notifications.error(error);
    }
  };

  const ensureWifiConnection = async () => {
    try {
      await isWifiConnected();
      Notifications.networkConnected();
    } catch (error) {
      Notifications.wifiiConnectAttemptFailed(error);
    }
  };

  const start = async () => {
    if (inProgress) return;

    inProgress = true;

    try {
      await spoofIfNeeded();
      await ensureWifiConnection();
      const {
        injectScript,
        waitUntil,
        visit,
        closeBrowser
      } = await initializeBrowser();

      addStopCB(closeBrowser);

      // Inject Scripts before navigation
      injectScript(greaseMonkeyScript);

      await visit(NEVERSSL);
      Notifications.navigatingToNeverSSL();

      await waitUntil(greaseMonkeyScript.metadata.completedUrl);
    } catch (error) {
      Notifications.error(error);
    } finally {
      closeBrowser();

      if (await isInternetConnected()) {
        // Remove value to avoid soft retry next run
        spoofStack.pop();
        Notifications.internetConnected();
      } else {
        Notifications.internetConnectionAttemptFailed();
      }

      inProgress = false;
    }
  };

  const stop = () => {
    stopCbs.forEach(cb => cb && cb());
  };

  return {
    start,
    stop,
    spoofStack
  };
};

export default createAutomator;
