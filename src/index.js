import "babel-polyfill";
import main from "./main";
import prompt from "password-prompt";

(async () => {
  process.env.PASSWORD = await prompt("password: ");
  main();
})();
