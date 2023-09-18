const eventTypeTemplatePath = $(`stubegruModule[data-name="event_management/event_types"]`).attr("data-template-path");


stubegru.modules.survey.initSurvey(eventTypeTemplatePath, "#surveyContainerEventType").then(() => {
    $("#surveyContainerEventType").show();
});

function editEventType(eventTypeId){
    stubegru.modules.survey.resetSurvey(eventTypeTemplatePath, "#surveyContainerEventType");
    $("#eventTypeModal").modal("show");
}