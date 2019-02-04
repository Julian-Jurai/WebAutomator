import notifier from "node-notifier";

export default msg =>
  notifier.notify(
    {
      title: "Automator",
      message: msg,
      icon: "./robot.jpg",
      sound: false,
      wait: false
    },
    function(err, response) {
      err && console.log("notifyer", { err }, { response });
    }
  );
