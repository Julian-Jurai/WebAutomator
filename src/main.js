import HealthCheck from "./HealthCheck";
import appEventEmitter, { SESSION_EXPIRED } from "./emitter";
import Automator from "./automator";

export const Status = {
  INPROGESS: false
};

const automator = new Automator();

export default async () => {
  HealthCheck.init(appEventEmitter);
  appEventEmitter.on(SESSION_EXPIRED, async () => {
    if (!automator.inProgress) {
      await automator.start();
    }
  });
};
