import Automator from "./Automator";
import ConnectionStatus from "./utils/ConnectionStatus";
import { metadata } from "./lib/greaseMonkeyScript";

const {
  attemptToConnectToWifi,
  isInternetConnected,
  listen
} = new ConnectionStatus(metadata);

const { start: onDisconnect } = new Automator({
  ensureWifiConnection: attemptToConnectToWifi,
  isInternetConnected
});

listen(onDisconnect);
