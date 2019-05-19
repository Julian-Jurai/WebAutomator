import WiFiControl from "wifi-control";
import { metadata } from "../lib/greaseMonkeyScript";
import ping from "net-ping";

const session = ping.createSession();

const GOOGLE_DNS = "8.8.8.8";

WiFiControl.init();

const withLogging = process.env.DEBUG_MODE;

export const resetNetworkInterface = () => {
  withLogging && console.log("Attempting To Reset Network Interfaces...");
  WiFiControl.resetWiFi((err, response) => {
    if (err) console.error(err);
    console.log(response);
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
      console.error(
        `You are connected to the wrong network.Please ensure SSID matches the ${
          metadata.SSID
        } ❌`
      );
    }
  } else {
    attemptToConnect && attemptToConnectToWifi();
    success = false;
  }

  withLogging && console.log("Network Connected:", success ? "✅" : "❌");
  return success;
};

const attemptToConnectToWifi = () => {
  withLogging && console.log("Attempting to connect to wifi...");

  const ap = {
    ssid: metadata.SSID
  };

  WiFiControl.connectToAP(ap, (err, response) => {
    if (err) {
      console.error("Wifi Connection Attempt Unsuccesful ❌", err);
    }
    withLogging &&
      response &&
      console.error("Wifi Connection Attempt succesful ✅");
  });
};

export const isWifiConnectedAsync = async () => {
  let networkConnected = isWifiConnected();
  let timeout = 20 * 1000;
  let counter = 0;
  let interval;

  if (!networkConnected) {
    await new Promise((resolve, reject) => {
      interval = setInterval(() => {
        counter += 1;
        networkConnected = isWifiConnected();

        if (counter > timeout) {
          throw Error("Timeout Error, Network Connection Not Established ❌");
        }

        if (networkConnected) {
          clearInterval(interval);
          resolve();
        }
      }, 2000);
    });
  }
};

export const isInternetConnected = () =>
  new Promise((resolve, reject) => {
    session.pingHost(GOOGLE_DNS, (error, target) => {
      if (error) {
        withLogging && console.log(target + ": " + error.toString());
        console.log("Internet connected: ❌");
      } else console.log("Internet connected: ✅");
      resolve();
    });
  });
