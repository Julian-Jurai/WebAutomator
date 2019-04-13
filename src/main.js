import HealthCheck from "./HealthCheck";
import appEventEmitter, { SESSION_EXPIRED } from "./emitter";
import automator from "./automator";

export const Status = {
  INPROGESS: false,
  ATTEMPT_SOFT_RETRY: false
};

export default async () => {
  HealthCheck.init(appEventEmitter);
  appEventEmitter.on(SESSION_EXPIRED, async () => {
    if (!Status.INPROGESS) {
      await automator();
    }
  });
};
