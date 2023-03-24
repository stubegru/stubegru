stubegru.modules.survey = {};
stubegru.modules.survey.data = {};
stubegru.modules.survey.pathToId = {};
stubegru.modules.survey.initSurvey = initSurvey;
stubegru.modules.survey.submitSurvey = submitSurvey;
stubegru.modules.survey.resetSurvey = resetSurvey;

async function initSurvey(path, selector, uniqueKey) {
    //Hash the path to have a unique identifier for this survey even before extracting the survey id
    let pathHash = stringToHash(path);

    //add a loader until the surve is fully loaded
    let surveyLoader = $(`<div id="surveyLoader${pathHash}"><div class="well well-lg text-center"><h2> <i class="fas fa-circle-notch fa-spin"></i>&nbsp;Fragen werden geladen</h2></div></div>`);
    $(selector).append(surveyLoader)

    //read templatefile from path
    let templateRequestResponse = await fetch(`${stubegru.constants.BASE_URL}/${path}`);
    if (templateRequestResponse.status != 200) {
        console.warn(`[Survey] Could not load survey because template can't be found at "${path}"`);
        return;
    }
    let templateData = await templateRequestResponse.text();

    //add template html to selector
    let templateContainer = $(`<div id="surveyContainer${pathHash}" style="display: none;">${templateData}</div>`);
    $(selector).append(templateContainer);

    //Extract survey id
    const surveyId = $(`#surveyContainer${pathHash} survey`).attr("data-survey-id");
    if (!surveyId) { throw new Error(`Could not load survey from template at "${path}" because surveyId is "${surveyId}"`) }
    stubegru.modules.survey.pathToId[path] = surveyId;

    //Load survey data via ajax
    let surveyDataResponse = await fetch(`${stubegru.constants.BASE_URL}/modules/survey/get_survey_questions.php?surveyId=${surveyId}&uniqueKey=${uniqueKey}`, {
        method: "GET",
    });
    let surveyData = await surveyDataResponse.json();
    let surveyQuestions = surveyData.questions;

    //show warning if a unique key is required but not given
    if (surveyData.uniqueKey != "0" && surveyData.validKey != "1") {
        stubegru.modules.alerts.alert({
            title: "Kein gültiger Key",
            text: "Bitte nutzen Sie genau den Link zur Umfrage den Sie erhalten haben. Sie können den Fragebogen nur einmal beantworten. Sie können den Fragebogen jetzt ansehen jedoch NICHT abschicken.",
            type: "warning",
            mode: "alert"
        });
    }

    //get all questions from template
    const templateQuestionList = $(`#surveyContainer${pathHash} survey question`);

    //generate html inputs for each question
    for (let templateQuestion of templateQuestionList) {
        //extract questionId from html attribute
        const questionId = $(templateQuestion).attr("data-question-id");

        //lookup question data
        let questionData = surveyQuestions[questionId];
        if (questionData == undefined) {
            console.error(`Cant find question with id '${questionId}' in questionData. This question will not be displayed`);
            continue;
        }

        //add question.questionGroup as CSS class
        if (questionData.questionGroup) { $(templateQuestion).addClass(questionData.questionGroup); }

        const questionType = questionData.type;
        const optionsData = questionData.options;
        const questionTypeElements = questionType.split(":");
        const questionPrimaryType = questionTypeElements[0];
        const questionSecondaryType = questionTypeElements[1];
        const questionHtmlId = `question-${surveyId}-${questionId}`;


        //generate tooltip for types "radio", "radio-inline" and "checkbox"
        if (questionPrimaryType == "radio" || questionPrimaryType == "radio-inline" || questionPrimaryType == "checkbox") {
            for (answerOption of optionsData) {
                if (answerOption.text.length > 0) {
                    answerOption.title = `<span data-toggle="tooltip" data-placement="top" data-original-title="${answerOption.text}" style="color:#307ea5; text-decoration:underline;">${answerOption.title}</span>`;
                }
            }
        }


        switch (questionPrimaryType) {
            case "input":

                //generate optionlist if options are provided
                let listRef = "";
                if (optionsData.length > 0) {
                    let optionListId = `optionlist-${surveyId}-${questionId}`;
                    listRef = `list="${optionListId}"`;
                    let optionlistElem = $(`<datalist id="${optionListId}"></datalist>`);

                    for (const currentOption of optionsData) {
                        optionlistElem.append(`<option value="${currentOption.value}">${currentOption.title} ${currentOption.text ? " | " + currentOption.text : ""}</option>`)
                    }
                    $(templateQuestion).append(optionlistElem);
                }

                //generate Input
                let inputHtml = `<div class="form-group">
                            <label>${questionData.title}</label>
                            <p class="help-block">${questionData.text}</p>
                            <input type="${questionSecondaryType}" class="form-control" id="${questionHtmlId}" ${listRef}>
                        </div>`

                $(templateQuestion).append(inputHtml);

                //Add eventlistener
                $(`#${questionHtmlId}`).on("change", function () {
                    let inputValue = $(this).val();
                    questionData.answer = { value: inputValue };
                    executeSurveyAction(questionData.action);
                    console.log(questionData);
                });
                break;

            case "select":

                let selectElem = $(`<select class="form-control" id="${questionHtmlId}"></select>`);
                selectElem.append(`<option value="">Keine Angabe</option>`);


                for (const currentOption of optionsData) {
                    let currentOptionElem = $(`<option value="${currentOption.value}" title="${currentOption.text}" data-option-id="${currentOption.id}" data-action="${currentOption.action}">${currentOption.title}</option>`);
                    selectElem.append(currentOptionElem);
                }

                //Add Eventlistener
                selectElem.on("change", function () {
                    let inputValue = $(this).val();
                    let selectedOptionElem = $(this).find(":selected");
                    let optionId = selectedOptionElem.attr("data-option-id");
                    let action = selectedOptionElem.attr("data-action");
                    questionData.answer = { value: inputValue, optionId: optionId };
                    executeSurveyAction(action);
                    console.log(questionData);
                })

                let selectFormGroup = $(`<div class="form-group"><label>${questionData.title}</label><p class="help-block">${questionData.text}</p></div>`);
                selectFormGroup.append(selectElem)
                $(templateQuestion).append(selectFormGroup);
                break;

            case "checkbox":

                let checkOptions = questionData.options

                let checkBoxHtml = "";
                for (const currentCheck of checkOptions) {
                    checkBoxHtml += `
                                    <div class="checkbox">
                                    <label>
                                            <input type="checkbox" name="${questionHtmlId}" value="${currentCheck.value}">${currentCheck.title}</input>
                                    </label>
                                    </div>`;
                }

                let checkHTML = `<div class="form-group">
                        <label>${questionData.title}</label>
                        <p class="help-block">${questionData.text}</p>
                        ${checkBoxHtml}
                    </div>`;

                $(templateQuestion).append(checkHTML);

                //Add eventlistener
                $(`input[type=checkbox][name="${questionHtmlId}"]`).on("change", function () {
                    if ($(this).is(":checked")) {
                        let inputValue = $(this).val();
                        if (!!questionData.answer) {
                            questionData.answer += inputValue + ";"
                        } else {
                            questionData.answer = inputValue + ";"
                        }
                        console.log(questionData.answer);
                    } else {
                        let ans = questionData.answer.replace($(this).val() + ";", "")
                        questionData.answer = ans;
                        console.log(questionData);
                    }
                });
                break;

            case "radio":

                let radioOptions = questionData.options
                let radioHTML = `<label>${questionData.title}</label>
                    <p class="help-block">${questionData.text}</p>`
                for (const currentRadio of radioOptions) {
                    radioHTML += `
                                <div class="radio">
                                    <label>
                                        <input type="radio" name="${questionHtmlId}" value="${currentRadio.value}">${currentRadio.title}</input>
                                    </label>
                                </div>`;
                }

                $(templateQuestion).append(radioHTML);

                //Add eventlistener
                $(`input[type=radio][name="${questionHtmlId}"]`).on("change", function () {
                    let inputValue = $(this).val();
                    questionData.answer = { value: inputValue };
                    console.log(questionData);
                })
                break;

            case "radio-inline":

                let radioInlineOptions = questionData.options
                let extraText = questionData.text.length > 0 ? `<p class="help-block">${questionData.text}</p>` : "";
                let rowContent = "";


                for (let currentRadio of radioInlineOptions) {

                    //generate radio buttton
                    rowContent += `<div class="col-sm-6 col-md-4 col-lg-3">
                                        <label class="radio-inline">
                                            <input type="radio" name="${questionHtmlId}" value="${currentRadio.value}">
                                            ${currentRadio.title}
                                        </label>
                                   </div>`;
                }

                let radioInlineHTML = ` <label>${questionData.title}</label>
                                        ${extraText}
                                        <div class="form-group survey-inline-radio-container">
                                            <div class="row">
                                                ${rowContent}
                                            </div>
                                        </div>`;

                $(templateQuestion).append(radioInlineHTML);

                //Add eventlistener
                $(`input[type=radio][name="${questionHtmlId}"]`).on("change", function () {
                    let inputValue = $(this).val();
                    questionData.answer = { value: inputValue };
                })
                break;

            case "text":
                let textareaHtml = `<div class= "form-group">
                <label> ${questionData.title}</label>
                <p class="help-block">${questionData.text}</p>
                <textarea id="${questionHtmlId}" class="form-control" style="min-width: 100%"></textarea>`;

                $(templateQuestion).append(textareaHtml)

                //Add eventlistener
                $(`#${questionHtmlId}`).on("change", function () {
                    let inputValue = $(this).val();
                    questionData.text = { value: inputValue };
                    console.log(questionData);
                });
                break;

            case "toggle":

                let toggleElem = $(`<div class="form-group">
                <input type="checkbox" data-toggle="toggle" class="survey-toggle" id="${questionHtmlId}">&nbsp;&nbsp;&nbsp;<label>${questionData.title}</label>
                <p class="help-block">${questionData.text}</p>
                </div>`);
                $(templateQuestion).append(toggleElem);

                //Add Eventlistener
                $(`#${questionHtmlId}`).on("change", function () {
                    let inputValue = $(this).is(":checked");
                    questionData.answer = { value: inputValue };
                    executeSurveyAction(questionData.action);
                    console.log(questionData);
                })

                break;

            case "rating":
                //set rating options
                let ratingOptions = [
                    { value: 1, title: "Gar nicht Zutreffend" },
                    { value: 2, title: "Eher nicht Zutreffend" },
                    { value: 3, title: "&nbsp;Teils &nbsp;/ &nbsp;Teils&nbsp;&nbsp;" },
                    { value: 4, title: "Eher Zutreffend" },
                    { value: 5, title: "Sehr Zutreffend" },
                ];

                let generatedOptions = "";
                //---Generate cols for each option---
                for (const currentOption of ratingOptions) {
                    generatedOptions += `
                        <div class="col-sm-2">
                            <div class="row v-center">
                            <div class="col-xs-8 col-sm-12 text-center">
                                <div class="survey-rating-sm-text" id="label-${questionHtmlId}-${currentOption.value}">${currentOption.title}</div>
                            </div>
                            <div class="col-xs-4 col-sm-12 text-center">
                                <input class="survey-rating-radio" type="radio" name="${questionHtmlId}" value="${currentOption.value} - ${currentOption.title}" data-label-id="label-${questionHtmlId}-${currentOption.value}">
                            </div>
                            </div>
                        </div>`;
                }


                //---Generate html---
                let ratingContainer = $(`<div class="form-group stubegru-rating-table" id="${questionHtmlId}">
                                            <h4>${questionData.title}</h4>
                                            <div class="survey-rating-row">
                                                <div class="survey-rating-text text-center">
                                                    <b>${questionData.text}</b>
                                                </div>
                                                <hr>

                                                <div class="row">
                                                    <div class="col-sm-1"></div>
                                                    ${generatedOptions}                       
                                                    <div class="col-sm-1"></div>
                                                </div>
                                                <br>
                                            </div>
                                        </div>`);




                //add things to document 
                $(templateQuestion).append(ratingContainer);

                //---Add Eventlistener---
                $(`input:radio[name ='${questionHtmlId}']`).on("change", function () {
                    //Highlight selected value
                    $(".survey-rating-sm-text").css({ "font-weight": "normal" });
                    const labelId = $(`input:radio[name ='${questionHtmlId}']:checked`).attr("data-label-id");
                    $(`#${labelId}`).css({ "font-weight": "1000" });


                    let inputValue = $(`input:radio[name ='${questionHtmlId}']:checked`).val();
                    questionData.answer = { value: inputValue };
                    executeSurveyAction(questionData.action);
                    console.log(questionData);
                })

                break;
        }
    }

    //Init all survey toggles
    $('.survey-toggle').bootstrapToggle({
        on: 'Ja',
        off: 'Nein'
    });

    //Init tooltips
    $(`[data-toggle="tooltip"]`).tooltip()

    //Add surveydata reference
    stubegru.modules.survey.data[surveyId] = surveyData;

    //Show survey
    surveyLoader.remove();
    templateContainer.show();

    //return survey id
    return surveyId;
}

async function resetSurvey(path, selector, uniqueKey) {
    let pathHash = stringToHash(path);
    $(`#surveyContainer${pathHash}`).remove();
    await initSurvey(path, selector, uniqueKey);
}

function executeSurveyAction(actionString) {
    if (!actionString) { return; }

    let actionList = actionString.split("|");
    for (let action of actionList) {

        let actionType = action.split(":")[0];
        let actionClass = action.split(":")[1];

        console.log(`Execute survey action '${actionType}' on '.${actionClass}'`);

        switch (actionType) {
            case "hide":
                $(`.${actionClass}`).hide();
                break;
            case "show":
                $(`.${actionClass}`).show();
                break;
            case "toggle":
                $(`.${actionClass}`).toggle();
                break;
        }
    }
}

async function submitSurvey(surveyPath, userHash, uniqueKey) {
    try {
        let surveyId = stubegru.modules.survey.pathToId[surveyPath];
        let surveyData = stubegru.modules.survey.data[surveyId];

        if (!surveyData) { throw new Error(`Cant submit survey with id ${surveyId}. This survey was not initialised`); }

        if (!userHash) { userHash = Math.random().toString(36).substr(2); } //generate random userHash if not provided

        //get survey answers
        let surveyAnswers = [];
        for (const questionIndex in surveyData.questions) {
            const question = surveyData.questions[questionIndex];

            let answer = {
                questionId: question.id,
                value: question.answer ? question.answer.value : "",
                optionId: question.answer ? question.answer.optionId : "",
            }
            surveyAnswers.push(answer);
        }

        //Save survey data via ajax
        const reqData = new URLSearchParams();
        reqData.append("surveyId", surveyId);
        reqData.append("userHash", userHash);
        reqData.append("uniqueKey", uniqueKey || "");
        reqData.append("answers", JSON.stringify(surveyAnswers));

        let surveyDataResponse = await fetch(`${stubegru.constants.BASE_URL}/modules/survey/save_survey_answers.php`, {
            method: "POST",
            body: reqData
        });
        let resp = await surveyDataResponse.json();

        if (resp.status == "error") { throw new Error(resp.message) }
        stubegru.modules.alerts.alert({
            title: "Speichern der Antworten",
            text: resp.message,
            type: resp.status
        });

        return true; //success

    } catch (e) {
        stubegru.modules.alerts.alert({
            title: "Es ist ein Fehler aufgetreten",
            text: e.message,
            type: "error"
        });
        return false;
    }

}