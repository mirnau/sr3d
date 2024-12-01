import { flags } from "../../helpers/CommonConsts.js"
import SR3DLog from "../../SR3DLog.js"

export function setFlags(actor, options, userId) {

    SR3DLog.info("Initiating Flags", "setFlags.js");

    actor.setFlag(flags.namespace, flags.attributesDone, false);
    actor.setFlag(game, flags.isDossierPanelOpened, false);
    actor.setFlag(flags.namespace, flags.isShoppingStateActive, true);

}
