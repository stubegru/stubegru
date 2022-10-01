stubegru.modules.menubar.addItem("primary", `<li class="permission-MONITORING_WRITE permission-required"><a data-toggle="modal" data-target="#monitoringModal" title="Beratungskontakt erfassen"><i class="fas fa-chart-line"></i>&nbsp;Monitoring</a></li>`, -100);

let monitoringTemplatePath,surveyId;
initMonitoring();

async function initMonitoring() {
    monitoringTemplatePath = $(`stubegruModule[data-name="monitoring"]`).attr("data-template-path");
    if(!monitoringTemplatePath){
        console.warn(`[Monitoring] Could not init monitoring form. Please specify "data-template-path" attribute.`);
        return;
    }
    surveyId = await stubegru.modules.survey.initSurvey(monitoringTemplatePath, "#monitoringContainerEvaluation", "");
    stubegru.modules.menubar.addItem("secondary", `<li class="permission-MONITORING_READ permission-required"><a title="Monitoring Ergebnisse als CSV herunterladen" href="${stubegru.constants.BASE_URL}/modules/survey/get_survey_answers.php?surveyId=${surveyId}"><i class="fas fa-download"></i>&nbsp;Download Monitoring</a></li>`, 1);
}


$("#monitoringSubmitButton").on("click", async () => {
    if (await stubegru.modules.survey.submitSurvey(monitoringTemplatePath)) {
        $("#monitoringModal").modal("hide");
    }
});

$("#monitoringSubmitAndNextButton").on("click", async () => {
    if (await stubegru.modules.survey.submitSurvey(monitoringTemplatePath)) {
        await stubegru.modules.survey.resetSurvey(monitoringTemplatePath, "#monitoringContainerEvaluation", "");
    }
});

$('#monitoringModal').on('hidden.bs.modal', async () => {
    await stubegru.modules.survey.resetSurvey(monitoringTemplatePath, "#monitoringContainerEvaluation", "");
});




