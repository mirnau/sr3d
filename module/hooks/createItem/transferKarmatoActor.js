export async function transferKarmatoActor(item, options, userId) {
    if (!item.actor || item.type !== "karma") return;

    const karmaReward = item.system.karma.goodKarma || 0;
   
    const karma = actor.system.karma;

    karma.goodKarma += karmaReward;
    karma.liftimeKarma += karmaReward;
    
    await actor.update({ "system.karma": karma });
    
    console.log(`Transferred ${karmaReward} Karma to ${actor.name}. New Karma: ${karma.goodKarma}`);

    await item.delete();

    console.log(`Karma item "${item.name}" has been destroyed after transfer.`);
}
