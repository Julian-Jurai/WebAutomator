import "babel-polyfill";
import prompt from "password-prompt";
import main, { Status } from "./main";

const listenToStdin = () => {
  var stdin = process.openStdin();
  stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that
    // with toString() and then trim()

    const input = d.toString().trim();

    if (Boolean(input.match(/(soft)|(sf)/))) {
      Status.ATTEMPT_SOFT_RETRY = true;
      console.log("Next attempt will be a soft retry ✅");
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
