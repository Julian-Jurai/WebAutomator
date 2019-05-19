import "babel-polyfill";
import prompt from "password-prompt";
import main from "./main";
import { spoofStack } from "./automator";
import { Notifications } from "./Notifications";

export const Hooks = {};

const listenToStdin = () => {
  var stdin = process.openStdin();
  stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that
    // with toString() and then trim()

    const input = d.toString().trim();
    if (Boolean(input.match(/(soft)|(sf)/))) {
      spoofStack.push(new Date());
      Notifications.softRetryOnNextAttempt();
    } else if (Boolean(input.match(/(reset)|(rs)/))) {
      Hooks.closeBrowser && Hooks.closeBrowser();
      while (spoofStack.length > 1) {
        spoofStack.pop();
      }
      Notifications.spoofOnNextAttempt();
    } else if (Boolean(input.match(/(print spoof stack)|(prs)/))) {
      Notifications.spoofStack(spoofStack);
    } else {
      console.log("You Typed:", input);
    }
  });
};

(async () => {
  process.env.PASSWORD = await prompt("password: ", { method: "hide" });
  process.env.DEBUG_MODE = process.argv[2] === "debug" ? true : "";
  listenToStdin();
  main();
})();
