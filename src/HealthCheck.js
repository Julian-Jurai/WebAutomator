import { SESSION_EXPIRED } from "./emitter";
import { Status } from "./main";
import { isWifiConnected, isInternetConnected } from "./utils/ConnectionStatus";
import Notifications from "./Notifications";

const POLLING_INTERVAL = 3000;

const HealthCheck = (function() {
  let instance;
  const createInstance = emitter => ({
    sessionExpiredEventListner: async () => {
      let shouldEmitEvent = !(await isInternetConnected());

      if (process.env.DEBUG_MODE && Status.INPROGESS) shouldEmitEvent = false; // Should not emit if in Debug Mode and ONE event has already been emitted

      if (isWifiConnected()) {
        if (shouldEmitEvent) {
          !Status.INPROGESS && console.log("Session Expired ❌");
          emitter.emit(SESSION_EXPIRED);
        }
      }
    }
  });

  return {
    init: async emitter => {
      Notifications.healthCheckInitialized();

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
