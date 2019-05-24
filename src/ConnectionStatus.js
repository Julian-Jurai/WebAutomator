import WiFiControl from "wifi-control";
import ping from "net-ping";
import Notifications from "./Notifications";

const createConnectionListner = ({ SSID }) => {
  const GOOGLE_DNS = "8.8.8.8";
  const session = ping.createSession();

  WiFiControl.init();

  const attemptToConnectToAccessPoint = () => {
    return new Promise(resolve => {
      const ap = {
        ssid: SSID
      };

      const isResolved = false;

      const resolvePromise = () => {
        !isResolved && resolve();
      };

      setTimeout(resolvePromise, 2000);

      WiFiControl.connectToAP(ap, (error, response) => {
        resolvePromise();
        if (error) {
          Notifications.wifiiConnectAttemptFailed({ error, response });
        }
      });
    });
  };

  const isWifiConnected = async ({ shouldAttempt = true } = {}) => {
    const message = WiFiControl.getIfaceState();
    const isConnected = message.connection === "connected";
    const isCorrectSSID = SSID ? message.ssid === SSID : message.ssid;
    const isSuccess = message.success === true;

    if (isConnected && isSuccess) {
      if (!isCorrectSSID) Notifications.incorrectSSIDConnection(SSID);
      return true;
    }

    try {
      shouldAttempt && (await attemptToConnectToAccessPoint());
    } catch (error) {
      Notifications.error(error);
    }

    return isWifiConnected({ shouldAttempt: false });
  };

  const isInternetConnected = async () => {
    return new Promise((resolve, reject) => {
      session.pingHost(GOOGLE_DNS, (error, target) => {
        let success = true;
        if (error) {
          success = false;
        }
        Notifications.internetConnectionStatus(success);
        resolve(success);
      });
    });
  };

  const listen = ({ onDisconnect }) => {
    const listenCB = async () => {
      let hasInternet;
      let hasWifi = await isWifiConnected();

      if (!hasWifi) return;

      hasInternet = await isInternetConnected();

      if (hasInternet) return;

      await onDisconnect();
    };

    setInterval(listenCB, 3000);
  };

  const close = () => {
    // Reset WIFI Interface
    WiFiControl.resetWiFi((error, response) => {
      if (error) Notifications.resetNetworkInterfaceError(error, response);
    });

    // Close Web Socket
    session.close();
  };

  return {
    close,
    isInternetConnected,
    isWifiConnected,
    listen
  };
};

export default createConnectionListner;
