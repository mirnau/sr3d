export async function transferKarmatoActor(item, options, userId) {
    if (!item.actor || item.type !== "karma") return;

    const karmaValue = item.system.karma.value || 0;
    const actor = item.actor;

    const currentKarma = actor.system.karma.goodKarma || 0;
    const updatedKarma = currentKarma + karmaValue;

    await actor.update({ "system.karma.goodKarma": updatedKarma });

    console.log(`Transferred ${karmaValue} Karma to ${actor.name}. New Karma: ${updatedKarma}`);

    await item.delete();

    console.log(`Karma item "${item.name}" has been destroyed after transfer.`);
}
