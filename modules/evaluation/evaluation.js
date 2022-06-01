
const evaluationTemplatePath = $(`stubegruModule[data-name="evaluation"]`).attr("data-template-path");
const uniqueKey = getParam("uniqueKey");


stubegru.modules.survey.initSurvey(evaluationTemplatePath, "#surveyContainerEvaluation", uniqueKey).then(() => {
    $("#surveySubmitEvaluation").show();
});

$("#surveySubmitEvaluationButton").on("click", async () => {
    if (await stubegru.modules.survey.submitSurvey(evaluationTemplatePath,undefined,uniqueKey)) {
        stubegru.modules.alerts.alert({
            title: "Vielen Dank für Ihre Teilnahme!",
            text: "Ihre Antworten wurden gespeichert und helfen uns dabei unseren Service zu verbessern. Sie können diese Seite nun schließen.",
            type: "success",
            mode: "alert"
        });
    }
});


$("#surveyResetEvaluationButton").on("click", async () => {
    if (confirm("Wollen Sie wirklich alle Antworten zurücksetzen?")) {
        $("#surveySubmitEvaluation").hide();
        await stubegru.modules.survey.resetSurvey(evaluationTemplatePath, "#surveyContainerEvaluation", uniqueKey);
        $("#surveySubmitEvaluation").show();
    }
});