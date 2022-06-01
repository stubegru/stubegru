async function initEvaluationDownload() {
    let surveyId = stubegru.constants.EVALUATION_SURVEY_ID;
    stubegru.modules.menubar.addItem("secondary", `<li class="permission-beratung permission-required"><a title="Ergebnisse der Evaluationsfragebögen als CSV herunterladen" href="${stubegru.constants.BASE_URL}/modules/survey/get_survey_answers.php?surveyId=${surveyId}"><i class="fas fa-download"></i>&nbsp;Download Evaluation</a></li>`, 1);
}
initEvaluationDownload();