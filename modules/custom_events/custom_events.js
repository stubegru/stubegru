loadEventConfig();

async function loadEventConfig() {
    const url = `${stubegru.constants.BASE_URL}/custom/custom_event_config.js`;
    try {
        await StubegruModuleLoader.loadJs(url);
    } catch (error) {
        console.warn(`Could not find custom event config file at: ${url}`);
    }
}

stubegru.modules.customEvents = {};
stubegru.modules.customEvents.trigger = function (eventId, data) {
    let eventObject = customEventConfig[eventId];
    if (eventObject) {
        eventObject.event(data);
    }
};