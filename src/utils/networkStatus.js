import WiFiControl from "wifi-control";
import { Notifications } from "../Notifications";
import { metadata } from "../lib/greaseMonkeyScript";
import ping from "net-ping";

const GOOGLE_DNS = "8.8.8.8";

WiFiControl.init();

const debugModeEnabled = process.env.DEBUG_MODE;

export const resetNetworkInterface = () => {
  debugModeEnabled && console.log("Attempting To Reset Network Interfaces...");
  WiFiControl.resetWiFi((error, response) => {
    if (error) Notifications.resetNetworkInterfaceError(error, response);
  });
};

export const isWifiConnected = (attemptToConnect = true) => {
  const message = WiFiControl.getIfaceState();
  const isConnected = message.connection === "connected";
  const isCorrectSSID = message.ssid === metadata.SSID;
  const isSuccess = message.success === true;

  let success;

  if (isConnected && isSuccess) {
    if (isCorrectSSID) {
      success = true;
    } else {
      Notifications.incorrectSSIDConnection(metadata.SSID);
    }
  } else {
    attemptToConnect && attemptToConnectToWifi();
    success = false;
  }

  debugModeEnabled && console.log("Network Connected:", success ? "✅" : "❌");
  return success;
};

const attemptToConnectToWifi = () => {
  debugModeEnabled && console.log("Attempting to connect to wifi...");

  const ap = {
    ssid: metadata.SSID
  };

  WiFiControl.connectToAP(ap, (error, response) => {
    if (error) {
      Notifications.wifiiConnectAttemptFailed(error);
    }
    debugModeEnabled &&
      response &&
      console.error("Wifi Connection Attempt succesful ✅");
  });
};

export const isWifiConnectedAsync = async () => {
  let networkConnected = isWifiConnected();
  let intervalTime = 20 * 1000;
  let limit = 5;
  let counter = 0;
  let interval;

  if (!networkConnected) {
    await new Promise((resolve, reject) => {
      interval = setInterval(() => {
        counter += 1;
        networkConnected = isWifiConnected();

        if (counter > limit) {
          throw Error("Timeout Error, Network Connection Not Established ❌");
        }

        if (networkConnected) {
          clearInterval(interval);
          resolve();
        }
      }, intervalTime);
    });
  }
};

const session = ping.createSession();

export const isInternetConnected = () => {
  return new Promise((resolve, reject) => {
    session.pingHost(GOOGLE_DNS, (error, target) => {
      let success = true;
      if (error) {
        debugModeEnabled && console.log(target + ": " + error.toString());
        success = false;
      }
      internetConnectionStatus(success);
      resolve();
    });
  });
};
