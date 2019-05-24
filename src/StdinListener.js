import "babel-polyfill";
import Notifications from "./Notifications";

const createStdinListner = () => {
  const allowedKeys = ["spoofStack"];
  const Hooks = {};

  const bindHook = obj => {
    const [key, value] = Object.entries(obj)[0];
    if (allowedKeys.includes(key)) {
      Hooks[key] = value;
    } else {
      Notifications.invalidHookInitialized(key);
    }
  };

  const emptySpoofStack = () => {
    while (Hooks.spoofStack.length > 0) {
      Hooks.spoofStack.pop();
    }
  };

  const listen = () => {
    const stdin = process.openStdin();
    stdin.addListener("data", function(d) {
      // note:  d is an object, and when converted to a string it will
      // end with a linefeed.  so we (rather crudely) account for that
      // with toString() and then trim()

      const input = d.toString().trim();
      if (Boolean(input.match(/(^soft$)|(^sf$)/))) {
        emptySpoofStack();
        Hooks.spoofStack.push(new Date());
        Notifications.softRetryOnNextAttempt();
      } else if (Boolean(input.match(/(^reset$)|(^rs$)/))) {
        emptySpoofStack();
        Notifications.spoofOnNextAttempt();
      } else if (Boolean(input.match(/(^prs$)/))) {
        Notifications.spoofStack(Hooks.spoofStack);
      } else if (Boolean(input.match(/(^spoof$)/))) {
        Notifications.spoofStack(Hooks.spoofStack);
      } else {
        console.log("You Typed:", input);
      }
    });
  };

  return {
    listen,
    bindHook
  };
};

export default createStdinListner;
