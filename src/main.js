import HealthCheck from "./HealthCheck";
import appEventEmitter, { SESSION_EXPIRED } from "./emitter";
import automator from "./automator";

export const Status = {
  INPROGESS: false
};

export default async () => {
  HealthCheck.init(appEventEmitter);
  appEventEmitter.on(SESSION_EXPIRED, async () => {
    !Status.INPROGESS &&
      (await automator()) &&
      console.log("3. Engaging Automator 🤖");
  });
};
