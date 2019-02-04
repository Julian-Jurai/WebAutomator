import { SESSION_EXPIRED } from "./emitter";
import { Status } from "./main";
import {
  isWifiConnected,
  isInternetConnectedAsync
} from "./utils/networkStatus";

const POLLING_INTERVAL = 3000;

const HealthCheck = (function() {
  let instance;
  const createInstance = emitter => ({
    sessionExpiredEventListner: async () => {
      const shouldEmitEvent = !(await isInternetConnectedAsync());
      if (isWifiConnected()) {
        if (shouldEmitEvent) {
          Status.INPROGESS
            ? console.log("🤖 ⛏ Automator working....")
            : console.log("Session Expired ❌");
          emitter.emit(SESSION_EXPIRED);
        }
      }
    }
  });

  return {
    init: async emitter => {
      console.log("Health Check Initialize ✅  ❤️");
      const { sessionExpiredEventListner } =
        instance || createInstance(emitter);

      const interval = setInterval(
        sessionExpiredEventListner,
        POLLING_INTERVAL
      );

      return clearInterval.bind(this, interval);
    }
  };
})();

export default HealthCheck;
