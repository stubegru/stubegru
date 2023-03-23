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
                let checkHTML = `<label>${questionData.title}</label>
                    <p class="help-block">${questionData.text}</p>`
                for (const currentCheck of checkOptions) {
                    checkHTML += `
                                    <div class="checkbox">
                                        <label>
                                            <input type="checkbox" name="${questionHtmlId}" value="${currentCheck.value}">${currentCheck.title}</input>
                                        </label>
                                    </div>`;
                }

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

                let radioinlineOptions = questionData.options
                let radioinlineHTML = `<label>${questionData.title}</label>
                        <p class="help-block">${questionData.text}</p>`

                let col1 = ``
                let col2 = ``
                let counter = 1

                for (const currentRadio of radioinlineOptions) {
                    let tooltip = ``
                    if (currentRadio.action && currentRadio.action == "tooltip") {
                        tooltip = `data-toggle="tooltip" data-placement="top" data-original-title="${currentRadio.text}" style="color:#307ea5; text-decoration:underline;"`
                    }
                    /*if (counter%2 == 0) {
                        col1 += `<label class="radio" ${tooltip}>
                                    <input type="radio" name="${questionHtmlId}" value="${currentRadio.value}">${currentRadio.title}</input>
                                </label>`
                    } else {
                        col2 += `<label class="radio" ${tooltip}>
                                    <input type="radio" name="${questionHtmlId}" value="${currentRadio.value}">${currentRadio.title}</input>
                                </label>`
                    }*/
                    let row = ``
                    col1 += `<div class="col-md-6" style="padding-left:30px;">
                                    <label class="radio" ${tooltip}>
                                        <input type="radio" name="${questionHtmlId}" value="${currentRadio.value}">${currentRadio.title}</input>
                                    </label>
                                    </div>`
                    if (counter % 2 == 0 || currentRadio == radioinlineOptions[radioinlineOptions.length - 1]) {
                        row = `<div class="row">${col1}</div>`
                        col1 = ``
                        radioinlineHTML += row
                        //counter++
                    }
                    counter++
                }
                /*radioinlineHTML += `<div class="row">
                                        <div class="col-md-6" style="padding-left:30px;">${col1}</div>
                                        <div class="col-md-6" style="padding-left:30px;">${col2}</div>
                                    </div>`*/

                radioinlineHTML = `<div class="form-group tracking-group" style="border:1px solid #757d84; padding: 10px; border-radius: 5px;">${radioinlineHTML}</div>`


                $(templateQuestion).append(radioinlineHTML);
                //Add eventlistener
                $(`input[type=radio][name="${questionHtmlId}"]`).on("change", function () {
                    let inputValue = $(this).val();
                    questionData.answer = { value: inputValue };
                    console.log(questionData);
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
                    { value: 3, title: "Teils / Teils" },
                    { value: 4, title: "Eher Zutreffend" },
                    { value: 5, title: "Sehr Zutreffend" },
                ];

                //---Generate initial cells---
                //COLWIDTHS
                let colwidths = `<col width="40%">`; //big one for the question text
                const colWidthPercent = (100 - 40) / ratingOptions.length; //split up lasting space for ratingOptions

                //HEADROW
                let headlineTableRow = `<td><b>${questionData.title}</b></td>`;

                //RATINGROW
                let ratingTableRow = `<td>${questionData.text}</td>`;


                //---Generate table cells for each option---
                for (const currentOption of ratingOptions) {
                    //COLWIDTH
                    colwidths += `<col width="${colWidthPercent}%">`;

                    //HEADROW
                    headlineTableRow += `<td>${currentOption.title}</td>`;

                    //RATINGROW
                    ratingTableRow += `
                    <td><label>
                          <input class="survey-rating-radio" type="radio" name="${questionHtmlId}" value="${currentOption.value} - ${currentOption.title}">
                    </label></td>`;
                }

                //---Generate html---
                let ratingContainer = $(`<div class="form-group" id="${questionHtmlId}">
                    <table style="width:100%;">
                        <colgroup>${colwidths}</colgroup>
                        <tbody>
                            <tr>${headlineTableRow}</tr>
                            <tr class="survey-rating-row">${ratingTableRow}</tr>
                        </tbody>
                    </table>
                </div>`);

                //add things to document 
                $(templateQuestion).append(ratingContainer);

                //---Add Eventlistener---
                $(`input:radio[name ='${questionHtmlId}']`).on("change", function () {
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