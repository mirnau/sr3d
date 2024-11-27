import { flags } from "../../helpers/CommonConsts.js"
import SR3DLog from "../../SR3DLog.js"

export function setFlags(actor, options, userId) {

    SR3DLog.info("Initiating Flags", "hook: setFlags");

    actor.getFlag(flags.namespace, flags.attributesDone, false);

}
