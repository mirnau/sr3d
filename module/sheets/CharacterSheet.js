import { ActorDataService } from '../services/ActorDataService.js';
import { CharacterCreationDialog } from '../dialogs/CharacterCreationDialog.js';
import { baseAttributes, derivedAttributes, flags, itemCategory } from '../helpers/CommonConsts.js'
import { CreateSkillDialog } from '../dialogs/CreateSkillDialog.js';

export default class CharacterSheet extends ActorSheet {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["sr3d", "sheet", "character"],
            width: 1300,
            height: 600,
            tabs: [
                {
                    navSelector: ".possessions-tabs .tabs",
                    contentSelector: ".possessions-tab-content",
                    initial: "inventory"
                },
                {
                    navSelector: ".skills-tabs .tabs",
                    contentSelector: ".skills-tabs .tab-content",
                    initial: "active-skills"
                }
            ]
        });
    }

    get template() {
        return `systems/sr3d/templates/sheets/character-sheet.hbs`;
    }

    async getData() {

        const ctx = super.getData();
        ctx.system = ctx.actor.system;
        ctx.config = CONFIG.sr3d;

        ctx.skills = ActorDataService.prepareSkills(ctx.actor.items.contents);
        ctx.skills.language = ActorDataService.prepareLanguages(ctx.actor.items.contents);
        ctx.transactions = ActorDataService.getTransactions(ctx.actor.items.contents);

        // NOTE: used for populating UI-elements
        ctx.baseAttributes = ActorDataService.getBaseAttributes(ctx.actor.system.attributes);
        ctx.derivedAttributes = ActorDataService.getDerivedAttributes(ctx.actor.system.attributes);
        ctx.dicePools = ActorDataService.getDicePools(ctx.actor.system.attributes);



        console.log("Active Skills:", ctx.skills.active);
        console.log("Knowledge Skills:", ctx.skills.knowledge);
        console.log("Language Skills:", ctx.skills.language);

        this.newsRepeatCounter = 0;

        return ctx;
    }

    async render(force = false, options = {}) {
        // Check if the creation dialog is completed
        let creationCompleted = this.actor.getFlag(flags.namespace, flags.characterCreationCompleted);

        // If the flag doesn't exist, initialize it
        if (creationCompleted === undefined) {
            console.log("Flag 'creationDialogCompleted' not found. Creating and setting it to false.");
            await this.actor.setFlag(flags.namespace, flags.characterCreationCompleted, false);
            creationCompleted = false;
        }

        // If the creation is not completed, show the dialog
        if (!creationCompleted) {
            console.log("Character creation not completed. Showing creation dialog.");

            const dialogResult = await this._showCharacterCreationDialog(this.actor);

            // If the dialog is canceled, delete the actor and prevent rendering
            if (!dialogResult) {
                console.log(`Character creation canceled for actor: ${this.actor.name}. Deleting actor.`);
                await this.actor.delete();
                return; // Halt rendering by exiting the `render` method
            }

            // Set the flag to true after the dialog is completed
            await this.actor.setFlag(flags.namespace, flags.characterCreationCompleted, true);
            console.log("Character creation completed. Flag set to true.");
        }
        return super.render(force, options);
    }

    async _showCharacterCreationDialog(actor) {
        // Fetch all items of type "metahuman" and "magic"
        const metahumans = game.items.filter(item => item.type === "metahuman");
        const magics = game.items.filter(item => item.type === "magic");

        const allMetahumans = ActorDataService.getAllMetaHumans(metahumans);
        const allMagics = ActorDataService.getAllMagics(magics);

        // Data for priority tables
        const priorities = ActorDataService.getPriorities();

        // Store instance properties
        const dialogData = {
            actor: this.actor,
            metahumans: allMetahumans,
            magics: allMagics,
            ...priorities
        };
        const content = await renderTemplate('systems/sr3d/templates/dialogs/character-creation-dialog.hbs', dialogData);

        return new Promise((resolve) => {
            new CharacterCreationDialog(dialogData, content, resolve).render(true);
        });
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".item-create").click(this._onItemCreate.bind(this));
        html.find(".edit-skill").click(this._onEditSkill.bind(this));
        html.find(".component-details").on("toggle", this._onDetailPanelOpened.bind(this, "toggle"));
        html.find('.open-owned-item').click(this._openOwnedInstance.bind(this));
        html.find('.creditor').click(this._onCreditorClick.bind(this));
        html.find('.document-id-link-injection').click(this._onDocumentIdLinkInjectionClick.bind(this));
        html.find('.increment-attribute').click(this._onIncrementAttributeClick.bind(this));
        html.find('.decrement-attribute').click(this._onDecrementAttributeClick.bind(this));
        html.find('.delete-owned-instance').click(this._onDeleteOwnedInstanceClick.bind(this));

        document.addEventListener('newsFeedIterationCompleted', this.onNewsFeedIterationCompleted.bind(this, html));

        const detailsPanels = html.find('details');
        detailsPanels.each((index, details) => {
            $(details).on('toggle', this._onDetailsToggle.bind(this, index, details));
        });
    }

    _onCreditorClick(event) {
        event.preventDefault();
        const actorId = event.currentTarget.dataset.actorId;
        const actor = game.actors.get(actorId);
        if (actor) actor.sheet.render(true);
    }

    
    _onDocumentIdLinkInjectionClick(event) {
        event.preventDefault();
        const actorUuid = this.actor.uuid;
        navigator.clipboard.writeText(actorUuid)
        .then(() => {
            ui.notifications.info(`Copied UUID: ${actorUuid}`);
        })
            .catch((err) => {
                console.error("Failed to copy UUID:", err);
                ui.notifications.error("Failed to copy UUID.");
            });
        }
        
        _onIncrementAttributeClick(event) {
            const attribute = event.currentTarget.dataset.attribute;
            this.actor.adjustAttribute(attribute, 1);
            this._updateButtons(attribute);
        }
        
        _onDecrementAttributeClick(event) {
            const attribute = event.currentTarget.dataset.attribute;
            this.actor.adjustAttribute(attribute, -1);
            this._updateButtons(attribute);
        }
        
        _onDeleteOwnedInstanceClick(event) {
            event.preventDefault();
            const target = $(event.currentTarget);
            const itemId = target.data('item-id');
            if (!itemId) return;
            
            Dialog.confirm({
                title: "Delete Item",
                content: "<p>Are you sure you want to delete this item?</p>",
                yes: async () => {
                    await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
                }
            });
        }
        
        _onDetailsToggle(index, details) {
            const key = `actor-${this.actor.id}-panel-${index}`;
            const savedState = localStorage.getItem(key);
            if (savedState === 'true') {
                details.setAttribute('open', 'true');
            } else {
                details.removeAttribute('open');
            }
        }
        
        onNewsFeedIterationCompleted(html, event) {
            
            if (event.detail.actor?.id !== this.actor.id) return;
            
            const element = event.detail.html;
            const cssElement = event.detail.cssElement;
            const animationControls = event.detail.controls;
            const viewPort = event.detail.viewPort;
            const baseSpeed = 150; // Pixels per second
            
            // Get all actors of type "newsbroadcast"
            const newsBroadcastActors = game.actors.filter(actor => actor.type === "newsbroadcast");
            
            const combinedNews = newsBroadcastActors
            .filter(actor => actor.system.isBroadcasting === true) // Filter actors broadcasting
            .reduce((allNews, actor) => {
                const news = actor.system.rollingNews;
                if (Array.isArray(news)) {
                    return allNews.concat(news);
                }
                return allNews;
            }, []);
            
            if (combinedNews.length === 0) {
                combinedNews.push("Samurai das Ruas Troll Culpado por Explosão no Barrens – 'Só Estava Testando Meu Novo Lança-Foguetes,' Explica...");
                combinedNews.push("Magier beschwört versehentlich Elementar im Büro – 'Ich wollte nur die Kaffeemaschine reparieren,' sagt er...");
                combinedNews.push("Nytt Matrix-virtuellt spel stoppas – realtidssimulering av bankrån blev för populärt...");
            }
            
            const newText = combinedNews[this.newsRepeatCounter++ % combinedNews.length];
            
            const fontSize = parseInt(window.getComputedStyle(element[0]).fontSize, 10);
            const charWidth = fontSize * 0.6;
            const viewPortWidth = parseInt(window.getComputedStyle(viewPort[0]).width, 10);
            
            const textWidth = newText.length * charWidth;
            const totalDistance = viewPortWidth + textWidth;
            
            animationControls.speed = totalDistance / baseSpeed; // Time in seconds
            
            animationControls.begin = viewPortWidth; // Start off-screen to the right
            animationControls.end = -textWidth; // End off-screen to the left
            
            cssElement.css({
                '--seconds': `${animationControls.speed}s`,
                '--percentBegin': `${animationControls.begin}px`,
                '--percentEnd': `${animationControls.end}px`,
            });
            
            element.text(newText);
            
            cssElement.css('animation', 'none');
            void cssElement[0].offsetWidth;
            cssElement.css('animation', `scroll-left var(--seconds) linear`);
        }
        
        close(options = {}) {
            if (this.actor.observers) {
                this.actor.observers.forEach((observer, index) => {
                    if (observer) {
                        observer.disconnect();
                        this.actor.observers[index] = null;
                    }
                });
            }
            return super.close(options);
        }
    
    _openOwnedInstance(event) {
        event.preventDefault();
        const itemId = $(event.currentTarget).data('itemId');
        const item = this.actor.items.get(itemId);
        item.sheet.render(true);
    }


    // NOTE: This boolean is read in a hook in sr3d.js
    _onDetailPanelOpened(_, event) {
        this.actor.setFlag(flags.namespace, flags.isDossierPanelOpened, event.target.open);
    }


    // Update Button States
    _updateButtons(attribute) {
        const decrementButton = document.querySelector(`[data-attribute="${attribute}"].decrement-attribute`);
        if (this.actor.system.attributes[attribute].value === 1) {
            decrementButton.classList.add("disabled");
        } else {
            decrementButton.classList.remove("disabled");
        }
    }


    _onEditSkill(event) {
        event.preventDefault();

        const skillId = event.currentTarget.dataset.id;

        const skill = this.actor.items.get(skillId);

        skill.sheet.render(true);
    }

    async _onItemCreate(event) {
        event.preventDefault();

        // Determine the type of item to create
        const itemType = event.currentTarget.dataset.type || "skill"; // Default to "skill"

        if (itemType === "skill") {

            if (!this.actor.getFlag(flags.namespace, flags.attributesDone)) {
                ui.notifications.info(game.i18n.localize("sr3d.characterCreation.spendYourAttributPointsToProceed"));
                return;
            }

            const htmlTemplate = await renderTemplate('systems/sr3d/templates/dialogs/skill-creation-dialog.hbs');
            const ctx = { item: null, actor: this.actor }; // No item yet created

            console.log("Creating skill. Showing dialog.");
            const dialogResult = await new Promise((resolve) => {
                new CreateSkillDialog(resolve, htmlTemplate, ctx).render(true);
            });

            if (!dialogResult) {
                console.log("Skill creation canceled.");
                return;
            }

            // Create the skill item
            const createdItems = await this.actor.createEmbeddedDocuments("Item", [dialogResult]);

            if (createdItems.length > 0) {
                const createdItem = createdItems[0]; // Retrieve the first created item
                console.log("Skill successfully created:", createdItem.toObject());

                // Set a flag on the newly created item
                await createdItem.setFlag("sr3d", "isInitialized", true);
                console.log("Flag 'isInitialized' set to true for item:", createdItem.id);
            } else {
                console.error("No skill was created.");
            }
        }
        // Add more conditions for other item types in the future
        else if (itemType === "gear") {
            // Handle gear creation
            console.log("Gear creation is not yet implemented.");
            // Example: Render a gear-specific dialog here
        } else {
            console.warn(`Unhandled item type: ${itemType}`);
        }
    }


}
