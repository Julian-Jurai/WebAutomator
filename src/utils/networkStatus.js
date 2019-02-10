import WiFiControl from "wifi-control";
import { metadata } from "../lib/greaseMonkeyScript";
import request from "request";

const GOOGLE = "https://google.com/";

const SSIDMisMatchError = ssid =>
  new Error(
    `You are connected to the wrong network. Please ensure SSID matches the ${ssid}`
  );

WiFiControl.init();

const withLogging = false;

export const resetNetworkInterface = () => {
  withLogging && console.log("Attempting to reset network interfaces");
  WiFiControl.resetWiFi((err, response) => {
    if (err) console.log(err);
    console.log(response);
  });
};

export const isWifiConnected = (
  withLogging = false,
  attemptToConnect = true
) => {
  const message = WiFiControl.getIfaceState();
  const isConnected = message.connection === "connected";
  const isCorrectSSID = message.ssid === metadata.SSID;
  const isSuccess = message.success === true;

  let success;

  if (isConnected && isSuccess) {
    if (isCorrectSSID) {
      success = true;
    } else {
      throw SSIDMisMatchError(ssid);
    }
  } else {
    attemptToConnect && attemptToConnectToWifi();
    success = false;
  }

  withLogging && console.log("Network connected:", success ? "✅" : "❌");
  return success;
};

const attemptToConnectToWifi = () => {
  withLogging && console.log("Attempting to connect to wifi..");

  const ap = {
    ssid: metadata.SSID
  };

  WiFiControl.connectToAP(ap, (err, response) => {
    if (err) console.log(err);
    withLogging &&
      response &&
      console.error("Wifi connection attempt succesful ✅");
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
          throw Error(`Timeout error, network connection not established`);
        }

        if (networkConnected) {
          clearInterval(interval);
          resolve();
        }
      }, 2000);
    });
  }
};

export const isInternetConnectedAsync = () =>
  new Promise((resolve, reject) => {
    request(GOOGLE, (error, response, body) => {
      let success;
      if (error) {
        success = false;
      }

      if (response) {
        success = response.statusCode == 200;
      }

      withLogging && console.log("Internet connected:", success ? "✅" : "❌");

      resolve(success);
    });
  });