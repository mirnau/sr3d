import { flags } from "../../helpers/CommonConsts.js"
import SR3DLog from "../../SR3DLog.js"

export function setActorFlags(actor, options, userId) {

    SR3DLog.info("Initiating Actor Flags", "setFlags.js");

    actor.setFlag(flags.namespace, flags.attributesDone, false);
    actor.setFlag(flags.namespace, flags.isDossierPanelOpened, false);
    actor.setFlag(flags.namespace, flags.isShoppingStateActive, true);
    actor.setFlag(flags.namespace, flags.isCharacterCreationState, true);

}
