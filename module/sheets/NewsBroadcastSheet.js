export default class NewsBroadcastSheet extends ActorSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, { // Fixed typo: utils
            classes: ["sr3d", "sheet", "character"],
            width: "auto",
            height: "auto",
            template: `systems/sr3d/templates/sheets/newsbroadcast-sheet.hbs`,
            resizable: false
        });
    }

    getData(options) {
        const ctx = super.getData(options);
        ctx.preparedNews = ctx.actor.system.preparedNews || [];
        ctx.rollingNews = ctx.actor.system.rollingNews || [];
        return ctx;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('#add-edit-prepared-news').click(this._onAddPreparedNews.bind(this));
        html.find('#delete-edit-prepared-news').click(this._onDeletePreparedNews.bind(this));
        html.find('#to-rolling-news').click(this._onMoveToRollingNews.bind(this));
        html.find('#to-prepared-news').click(this._onMoveToPreparedNews.bind(this));
        html.find('#prepared-news').change(this._onSelectPreparedNews.bind(this));
    }

    _onAddPreparedNews(event) {
        event.preventDefault();
        const input = this.element.find('#headline-input');
        const newHeadline = input.val().trim();
        if (newHeadline === "") {
            ui.notifications.warn("Headline cannot be empty.");
            return;
        }

        const preparedNews = this.actor.system.preparedNews || [];

        preparedNews.push(newHeadline);

        this.actor.update({ "system.preparedNews": preparedNews }).then(() => {
            input.val(""); // Clear input after successful add
        }).catch(err => {
            console.error("Failed to add prepared news:", err);
            ui.notifications.error("Failed to add the headline.");
        });
    }

    _onDeletePreparedNews(event) {
        event.preventDefault();
        const preparedSelect = this.element.find('#prepared-news');
        const selectedIndices = preparedSelect.val();

        if (!selectedIndices || selectedIndices.length === 0) {
            ui.notifications.warn("Please select at least one headline to delete.");
            return;
        }

        const preparedNews = this.actor.system.preparedNews || [];
        const rollingNews = this.actor.system.rollingNews || [];

        const indices = selectedIndices.map(idx => parseInt(idx, 10)).sort((a, b) => b - a);

        const headlinesToDelete = [];

        indices.forEach(index => {
            if (preparedNews[index]) {
                headlinesToDelete.push(preparedNews[index]);
                preparedNews.splice(index, 1);
            }
        });

        if (headlinesToDelete.length === 0) {
            ui.notifications.warn("No valid headlines selected for deletion.");
            return;
        }

        const updatedRollingNews = rollingNews.filter(headline => !headlinesToDelete.includes(headline));

        this.actor.update({
            "system.preparedNews": preparedNews,
            "system.rollingNews": updatedRollingNews
        }).then(() => {
            ui.notifications.info("Selected headlines have been deleted.");
            // Clear the input field if the deleted headline was displayed
            const input = this.element.find('#headline-input');
            if (headlinesToDelete.includes(input.val().trim())) {
                input.val("");
            }
        }).catch(err => {
            console.error("Failed to delete headlines:", err);
            ui.notifications.error("Failed to delete the selected headlines.");
        });
    }

    _onMoveToRollingNews(event) {
        event.preventDefault();
        const preparedSelect = this.element.find('#prepared-news');
        const selectedIndices = preparedSelect.val();

        if (!selectedIndices || selectedIndices.length === 0) {
            ui.notifications.warn("Please select at least one headline to move.");
            return;
        }

        const preparedNews = this.actor.system.preparedNews || [];
        const rollingNews = this.actor.system.rollingNews || [];

        const indices = selectedIndices.map(idx => parseInt(idx, 10)).sort((a, b) => b - a);

        const movedHeadlines = [];
        indices.forEach(index => {
            if (preparedNews[index]) {
                movedHeadlines.push(preparedNews.splice(index, 1)[0]);
            }
        });

        movedHeadlines.forEach(headline => {
            if (!rollingNews.includes(headline)) {
                rollingNews.push(headline);
            }
        });

        this.actor.update({
            "system.preparedNews": preparedNews,
            "system.rollingNews": rollingNews
        }).then(() => {
            ui.notifications.info("Selected headlines have been moved to Rolling News.");
            this.render();
        }).catch(err => {
            console.error("Failed to move headlines to rolling news:", err);
            ui.notifications.error("Failed to move the headlines.");
        });
    }

    _onMoveToPreparedNews(event) {
        event.preventDefault();
        const rollingSelect = this.element.find('#rolling-news');
        const selectedIndices = rollingSelect.val();

        if (!selectedIndices || selectedIndices.length === 0) {
            ui.notifications.warn("Please select at least one headline to move.");
            return;
        }

        const preparedNews = this.actor.system.preparedNews || [];
        const rollingNews = this.actor.system.rollingNews || [];

        const indices = selectedIndices.map(idx => parseInt(idx, 10)).sort((a, b) => b - a);

        const movedHeadlines = [];
        indices.forEach(index => {
            if (rollingNews[index]) {
                movedHeadlines.push(rollingNews.splice(index, 1)[0]);
            }
        });

        movedHeadlines.forEach(headline => {
            if (!preparedNews.includes(headline)) {
                preparedNews.push(headline);
            }
        });

        this.actor.update({
            "system.preparedNews": preparedNews,
            "system.rollingNews": rollingNews
        }).then(() => {
            ui.notifications.info("Selected headlines have been moved to Prepared News.");
            this.render();
        }).catch(err => {
            console.error("Failed to move headlines to prepared news:", err);
            ui.notifications.error("Failed to move the headlines.");
        });
    }

    _onSelectPreparedNews(event) {
        const selectedIndices = this.element.find('#prepared-news').val();

        if (!selectedIndices || selectedIndices.length === 0) {
            this.element.find('#headline-input').val("");
            return;
        }

        const index = parseInt(selectedIndices[0], 10);
        const selectedHeadline = this.actor.system.preparedNews[index];

        if (selectedHeadline) {
            this.element.find('#headline-input').val(selectedHeadline);
        }
    }
}
