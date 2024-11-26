import { flags } from "./module/helpers/CommonConsts";
import SR3DLog from "./module/SR3DLog";

export function setFlags(actor, options, userId) {

    SR3DLog.info("Initiating Flags", "hook: setFlags");

    actor.getFlag(flags.namespace, flags.attributesDone, false);

}
