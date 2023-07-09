async function initEvaluationDownload() {
    if (!stubegru.constants.CUSTOM_CONFIG.evaluationSurveyId){
        console.error(`No evaluationSurveyId configured in custom/config.json. Cant download evaluation data.`);
        return;
    }
    let surveyId = stubegru.constants.CUSTOM_CONFIG.evaluationSurveyId;
    stubegru.modules.menubar.addItem("secondary", `<li class="permission-EVALUATION_READ permission-required"><a title="Ergebnisse der Evaluationsfragebögen als CSV herunterladen" href="${stubegru.constants.BASE_URL}/modules/survey/get_survey_answers.php?surveyId=${surveyId}"><i class="fas fa-download"></i>&nbsp;Download Evaluation</a></li>`, 1);
}
initEvaluationDownload();