loadEventConfig();

async function loadEventConfig(){
    await StubegruModuleLoader.loadJs(`${stubegru.constants.BASE_URL}/custom/custom_event_config.js`);
}

stubegru.modules.customEvents = {};
stubegru.modules.customEvents.trigger = function(eventId,data){
    let eventObject = customEventConfig[eventId];
    if(eventObject){
        eventObject.event(data);
    }
};