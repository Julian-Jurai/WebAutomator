import notifier from "node-notifier";

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

export const Notifications = {
  starting: () => {
    notifyer(`We're about to get started 🚗`);
    console.log("Engaging Automator 🤖");
  },
  healthCheckInitialized: () => {
    console.log("Health Check Initialized ✅");
  },
  navigatingToNeverSSL: () => {
    console.log("Started Navigation To NeverSSL ✅");
  },
  softRetryAttempt: () => {
    console.log("Attempting Soft Retry...");
    console.log("Last spoofed:", spoofStack.pop());
    console.log("Current time:", new Date());
  },
  softRetryOnNextAttempt: () => {
    console.log("Next attempt will be a soft retry ✅");
  },
  spoofOnNextAttempt: () => {
    console.log("Next attempt will be a soft retry ✅");
  },
  spoofStack: spoofStack => {
    console.log("spoofStack", spoofStack);
  },
  networkConnected: () => {
    console.log("Network Connected:✅");
  },
  internetConnected: () => {
    notifyer(`All clear! ✅`);
    console.log("Internet Connected:✅");
  },
  internetConnectionAttemptFailed: () => {
    notifyer(`We've hit a snag, might need your input ⛔️`);
  },
  error: e => {
    console.error("An Error Was Encountered Before Target Was Reached ❌", e);
  }
};

export default notifyer;
