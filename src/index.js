import "babel-polyfill";
import prompt from "password-prompt";
import createConnectionListner from "./ConnectionStatus";
import greaseMonkeyScript from "./lib/greaseMonkeyScript";
import createAutomator from "./Automator";
import createStdinListner from "./StdinListener";

import ConsoleTable from "./ConsoleTable";

const { SSID } = greaseMonkeyScript.metadata;

const { listen: listenToStdin, bindHook } = createStdinListner();

const {
  close,
  isInternetConnected,
  isWifiConnected,
  listen: listenToConnection
} = createConnectionListner({ SSID, onDisconnect });

const { start: onDisconnect, spoofStack } = createAutomator({
  isWifiConnected,
  isInternetConnected,
  greaseMonkeyScript,
  bindHook
});

const cleanUp = () => {
  close();
};

bindHook({ spoofStack });

(async () => {
  // stack trace details
  process.on("unhandledRejection", r => console.log(r));

  process.env.PASSWORD = await prompt("password: ", { method: "hide" });
  process.env.DEBUG_MODE = process.argv[2] === "debug" ? true : "";

  setInterval(ConsoleTable.print, 2000);

  listenToConnection({ onDisconnect });
  listenToStdin();
})();
