import notifier from "node-notifier";

// Pop up notifications
const notifyer = msg =>
  notifier.notify(
    {
      title: "Automator",
      message: msg,
      icon: "./robot.jpg",
      sound: false,
      wait: false
    },
    function(err, response) {
      err && console.log("notifyer error", { err }, { response });
    }
  );

const Notifications = {
  starting: () => {
    notifyer(`We're about to get started 🚗`);
    console.log("Engaging Automator 🤖");
  },
  healthCheckInitialized: () => {
    console.log("Health Check Initialized ✅");
  },
  invalidHookInitialized: key => {
    console.log("Invalid Hook Provide of Key ❌ ", key);
  },
  navigatingToNeverSSL: () => {
    console.log("Started Navigation To NeverSSL ✅");
  },
  resetNetworkInterfaceError: ({ error, response }) => {
    console.log("Reset Network Interfaces Error:", { error, response });
  },
  incorrectSSIDConnection: expectedSSID => {
    console.log(
      "You are connected to the wrong network. Please ensure SSID matches the:",
      expectedSSID,
      "❌"
    );
  },
  wifiiConnectAttemptFailed: ({ error, response }) => {
    console.error("Wifi Connection Attempt Unsuccesful ❌", {
      error,
      response
    });
  },
  softRetryAttempt: () => {
    console.log("Attempting Soft Retry...");
  },
  softRetryOnNextAttempt: () => {
    console.log("Next attempt will be a soft retry ✅");
  },
  spoofOnNextAttempt: () => {
    console.log("Next attempt will be spoofed ✅");
  },
  spoofStack: spoofStack => {
    console.log("spoofStack", spoofStack);
  },
  networkConnected: () => {
    console.log("Network Connected:✅");
  },
  internetConnected: () => {
    notifyer(`All clear! ✅`);
    console.log("Internet Connected: ✅");
  },
  internetConnectionStatus: success => {
    console.log("Internet connected:", success ? "✅" : "❌", " ", Date.now());
  },
  internetConnectionAttemptFailed: () => {
    notifyer(`We've hit a snag, might need your input ⛔️`);
  },
  error: error => {
    console.error(
      "An Error Was Encountered Before Target Was Reached ❌",
      error
    );
    console.trace(error.stack || error);
  }
};

export default Notifications;
