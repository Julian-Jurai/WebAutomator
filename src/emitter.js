import { EventEmitter } from "events";

const appEventEmitter = new EventEmitter();

export const SESSION_EXPIRED = "SESSION_EXPIRED";

export const Events = {
  SESSION_EXPIRED: "SESSION_EXPIRED",
  IN_PROGRESS: "IN_PROGRESS"
};

export default appEventEmitter;
