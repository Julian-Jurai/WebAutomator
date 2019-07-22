import Notifications from "./Notifications";
import spoof from "./utils/spoof";
import { createBrowser } from "./browser";
import ConsoleTable from "./ConsoleTable";

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
        ConsoleTable.setCurrentStep("Soft Retry");
        emptySpoofStack();
      } else {
        await spoof();
        ConsoleTable.setCurrentStep("Spoofed");
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
      ConsoleTable.setCurrentStep("/GET neverssl.com");
      await waitUntil(greaseMonkeyScript.metadata.completedUrl);
    } catch (error) {
      Notifications.error(error);
    } finally {
      await closeBrowser();
    }

    if (await isInternetConnected()) {
      // Remove value to avoid soft retry next run
      emptySpoofStack();
      ConsoleTable.setCurrentStep("Automator Run Success");
      ConsoleTable.setCurrentStep("");
      ConsoleTable.setError("");
    } else {
      ConsoleTable.setCurrentStep("Automator Run Failure");
    }
  };

  const start = async () => {
    if (inProgress) return;
    inProgress = true;
    try {
      ConsoleTable.setCurrentStep("Automator Start");
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
