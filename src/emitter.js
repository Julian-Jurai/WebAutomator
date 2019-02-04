import { EventEmitter } from "events";

const appEventEmitter = new EventEmitter();

export const SESSION_EXPIRED = "SESSION_EXPIRED";

export default appEventEmitter;
