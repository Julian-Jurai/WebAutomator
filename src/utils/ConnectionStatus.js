import WiFiControl from "wifi-control";
import ping from "net-ping";
import Notifications from "../Notifications";

const GOOGLE_DNS = "8.8.8.8";

WiFiControl.init();

class ConnectionStatus {
  constructor({ SSID }) {
    if (!SSID)
      throw Error(
        "Connection class could not be initialized argument SSID missing"
      );

    this.ssid = SSID;
    this.debugModeEnabled = process.env.DEBUG_MODE;
    this.session = ping.createSession();

    this.close = this.close.bind(this);
    this.isInternetConnected = this.isInternetConnected.bind(this);
    this.isWifiConnected = this.isWifiConnected.bind(this);
    this.attemptToConnectToAccessPoint = this.attemptToConnectToAccessPoint.bind();
    this.attemptToConnectToWifi = this.attemptToConnectToWifi.bind();
  }

  listen(onDisconnect) {
    setInterval(async () => {
      if (this.isWifiConnected()) {
        if (await this.isInternetConnected()) {
          Notifications.networkConnected();
        } else {
          await onDisconnect();
        }
      } else {
        this.attemptToConnectToAccessPoint();
      }
    }, 3000);
  }

  close() {
    // Reset WIFI Interface
    this.debugModeEnabled &&
      console.log("Attempting To Reset Network Interfaces...");
    WiFiControl.resetWiFi((error, response) => {
      if (error) Notifications.resetNetworkInterfaceError(error, response);
    });

    // Close Web Socket
    this.session.close();
  }

  async attemptToConnectToWifi() {
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
  }

  attemptToConnectToAccessPoint() {
    debugModeEnabled && console.log("Attempting to connect to wifi...");

    const ap = {
      ssid: this.ssid
    };

    WiFiControl.connectToAP(ap, (error, response) => {
      if (error) {
        Notifications.wifiiConnectAttemptFailed(error);
      }
      debugModeEnabled &&
        response &&
        console.error("Wifi Connection Attempt succesful ✅");
    });
  }

  isWifiConnected() {
    const message = WiFiControl.getIfaceState();
    const isConnected = message.connection === "connected";
    const isCorrectSSID = message.ssid === this.ssid;
    const isSuccess = message.success === true;

    let success;

    if (isConnected && isSuccess) {
      if (isCorrectSSID) {
        success = true;
      } else {
        Notifications.incorrectSSIDConnection(this.ssid);
      }
    } else {
      this.attemptToConnectToAccessPoint();
      success = false;
    }

    debugModeEnabled &&
      console.log("Network Connected:", success ? "✅" : "❌");
    return success;
  }

  isInternetConnected() {
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
  }
}

export default ConnectionStatus;
