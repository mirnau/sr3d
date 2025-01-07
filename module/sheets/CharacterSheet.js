import { baseAttributes, derivedAttributes, flags, itemCategory } from '../helpers/CommonConsts.js'
import { CreateSkillDialog } from '../dialogs/CreateSkillDialog.js';
import ActorDataService from '../services/ActorDataService.js';
import EcgAnimator from '../helpers/EcgAnimator.js';
import CharacterModel from '../dataModels/actor/CharacterModel.js';

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
        console.log(ctx);

        this.newsRepeatCounter = 0;

        return ctx;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".item-create").click(this._onItemCreate.bind(this));
        // html.find(".delete-skill").click(this._onDeleteSkill.bind(this));
        html.find(".edit-skill").click(this._onEditSkill.bind(this));
        html.find(".component-details").on("toggle", this._onDetailPanelOpened.bind(this, "toggle"));
        html.find('.open-owned-item').on('click', this._openOwnedInstance.bind(this));

        document.addEventListener('newsFeedIterationCompleted', this.onNewsFeedIterationCompleted.bind(this, html));

        html.find('.document-id-link-injection').click((event) => {
            event.preventDefault();
            const actorUuid = this.actor.uuid; // Get the actor's UUID
            navigator.clipboard.writeText(actorUuid)
                .then(() => {
                    ui.notifications.info(`Copied UUID: ${actorUuid}`);
                })
                .catch((err) => {
                    console.error("Failed to copy UUID:", err);
                    ui.notifications.error("Failed to copy UUID.");
                });
        });

        // Increment attribute
        html.find('.increment-attribute').click((event) => {
            const attribute = event.currentTarget.dataset.attribute;
            this.actor.adjustAttribute(attribute, 1);
            this._updateButtons(attribute);

        });

        // Decrement attribute
        html.find('.decrement-attribute').click((event) => {
            const attribute = event.currentTarget.dataset.attribute;
            this.actor.adjustAttribute(attribute, -1);
            this._updateButtons(attribute);
        });

        html.on('click', '.delete-owned-instance', async (event) => {
            event.preventDefault();

            const target = $(event.currentTarget);

            const itemId = target.data('item-id');
            if (!itemId) return;

            const confirmDelete = await Dialog.confirm({
                title: "Delete Item",
                content: "<p>Are you sure you want to delete this item?</p>"
            });

            if (!confirmDelete) return;
            await this.actor.deleteEmbeddedDocuments("Item", [itemId]);

        });

        // NOTE: Save the state of the panels when toggled
        const detailsPanels = html.find('details');

        detailsPanels.each((index, details) => {
            $(details).on('toggle', () => {
                const key = `actor-${this.actor.id}-panel-${index}`;
                localStorage.setItem(key, details.open);
            });
        });

        detailsPanels.each((index, details) => {
            const key = `actor-${this.actor.id}-panel-${index}`;
            const savedState = localStorage.getItem(key);
            if (savedState === 'true') {
                details.setAttribute('open', 'true');
            } else {
                details.removeAttribute('open');
            }
        });
        ////////////////////////////////////////////////////////////////////
        // Grab both canvases
        const ecgCanvas = html.find('#ecg-canvas')[0];
        const ecgPointCanvas = html.find('#ecg-point-canvas')[0];

        if (!ecgCanvas || !ecgPointCanvas) return;

        // Get contexts (not strictly needed if you only do it in EcgAnimator, 
        // but we need them for resizing logic)
        const ctxLine = ecgCanvas.getContext('2d');
        const ctxPoint = ecgPointCanvas.getContext('2d');

        // Resize helper
        function resizeCanvas() {
            // Bottom canvas
            ecgCanvas.width = ecgCanvas.offsetWidth * window.devicePixelRatio;
            ecgCanvas.height = ecgCanvas.offsetHeight * window.devicePixelRatio;
            ctxLine.scale(window.devicePixelRatio, window.devicePixelRatio);

            // Top canvas
            ecgPointCanvas.width = ecgPointCanvas.offsetWidth * window.devicePixelRatio;
            ecgPointCanvas.height = ecgPointCanvas.offsetHeight * window.devicePixelRatio;
            ctxPoint.scale(window.devicePixelRatio, window.devicePixelRatio);
        }

        // Call it right away and on window resize
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Create your ECG animator instance (assuming your updated EcgAnimator 
        // accepts two canvases: one for lineCanvas, one for pointCanvas)
        this.ecgAnimator = new EcgAnimator(ecgCanvas, ecgPointCanvas, {
            freq: 2,      // ~120 BPM
            amp: 30,      // bigger amplitude
            color: 'lime',
            lineWidth: 2,
            bottomColor: '#32CD32',
            topColor: '#00FFFF'
        });

        // Start the loop
        this.ecgAnimator.start();

        // Hook up frequency/amplitude controls
        html.find('.ecg-frequency').on('change', (event) => {
            const val = Number(event.currentTarget.value);
            if (!isNaN(val)) this.ecgAnimator.setFrequency(val);
        });

        html.find('.ecg-amplitude').on('change', (event) => {
            const val = Number(event.currentTarget.value);
            if (!isNaN(val)) this.ecgAnimator.setAmplitude(val);
        });
        //////////////////////////////////////////////////////////////////// 
        
        html.find("input[type='checkbox'][id^='healthBox']").on("change", (event) => {
            const clicked = event.currentTarget;
            const clickedIndex = parseInt(clicked.id.replace("healthBox", ""), 10);
            const isChecked = clicked.checked;
        
            if (clickedIndex === 1 || clickedIndex === 11) {
                const start = clickedIndex === 1 ? 1 : 11;
                const end = clickedIndex === 1 ? 10 : 20;
        
                const numCheckedInRange = html.find(`input[type='checkbox'][id^='healthBox']`)
                    .slice(start - 1, end) // Adjust for 0-based index
                    .filter(":checked").length;
        
                if (numCheckedInRange === 0 && !isChecked) {
                    const siblingH4 = $(clicked).closest(".damage-input").find("h4");
                    if (siblingH4.length) {
                        siblingH4.removeClass("lit").addClass("unlit");
                    }
                    return;
                }
            }

            let degree = 0;
       
            if (clickedIndex < 11) {
                degree = clickedIndex;
                iterator(clickedIndex, 1, 10);
            } else {
                degree = clickedIndex % 10;
                iterator(clickedIndex, 11, 20);
            }

            this.actor.system.health.penalty = severity(degree);

            function severity(degree) {
                if (degree > 0 && degree < 3 )
                    return 1;
                else if ( degree <= 3 && degree < 6)
                    return 2;
                else if(degree >= 6 && degree < 10)
                    return 3
                else if(degree === 10)
                    return 4;
                else return 0;
            }
        
            function iterator(clickedIndex, start, end) {
                for (let i = start; i <= end; i++) {
                    const box = html.find(`#healthBox${i}`);
                    if (i <= clickedIndex) {
                        box.prop("checked", true);
                        const siblingH4 = box.closest(".damage-input").find("h4");
                        if (siblingH4.length) {
                            siblingH4.removeClass("unlit").addClass("lit");
                        }
                    } else {
                        box.prop("checked", false);
                        const siblingH4 = box.closest(".damage-input").find("h4");
                        if (siblingH4.length) {
                            siblingH4.removeClass("lit").addClass("unlit");
                        }
                    }
                }
            }
        });
        
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

