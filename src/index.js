import "babel-polyfill";
import prompt from "password-prompt";
import ConnectionStatus from "./ConnectionStatus";
import Notifications from "./Notifications";
import greaseMonkeyScript from "./lib/greaseMonkeyScript";
import Automator from "./Automator";

export const Hooks = {};

const listenForDisconnect = () => {
  const {
    attemptToConnectToWifi,
    isInternetConnected,
    listener
  } = new ConnectionStatus(greaseMonkeyScript.metadata);

  const automatorConfig = {
    ensureWifiConnection: attemptToConnectToWifi,
    isInternetConnected,
    greaseMonkeyScript,
    cliHooks: Hooks
  };

  const automator = new Automator(automatorConfig);

  listener({ onDisconnect: automator.start });
};

const listenToStdin = () => {
  var stdin = process.openStdin();
  stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that
    // with toString() and then trim()

    const input = d.toString().trim();
    if (Boolean(input.match(/(soft)|(sf)/))) {
      Hooks.spoofStack.push(new Date());
      Notifications.softRetryOnNextAttempt();
    } else if (Boolean(input.match(/(reset)|(rs)/))) {
      Hooks.closeBrowser && Hooks.closeBrowser();
      while (Hooks.spoofStack.length > 1) {
        Hooks.spoofStack.pop();
      }
      Notifications.spoofOnNextAttempt();
    } else if (Boolean(input.match(/(print spoof stack)|(prs)/))) {
      Notifications.spoofStack(Hooks.spoofStack);
    } else {
      console.log("You Typed:", input);
    }
  });
};

(async () => {
  // stack trace details
  process.on("unhandledRejection", r => console.log(r));

  process.env.PASSWORD = await prompt("password: ", { method: "hide" });
  process.env.DEBUG_MODE = process.argv[2] === "debug" ? true : "";
  listenToStdin();
  listenForDisconnect();
})();
