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
    return new Promise(function (resolve, reject) {
        let eventObject = customEventConfig[eventId];
        if (eventObject) {
            try {
                let result = eventObject.event(data);
                resolve(result);
            } catch (error) { reject(error); }
        } else {
            reject(`[Custom Events] Could not find event with id "${eventId}". Please check your custom_event_config.js file.`)
        }
    });
}