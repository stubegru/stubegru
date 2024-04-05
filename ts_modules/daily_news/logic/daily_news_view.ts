///@VSCode:tuwrraphael.queryselector-completion: import html from "../module.html";
import ClassicEditor from '../../../assets/libs/ckeditor5/ckeditor.js'
import DailyNewsModule, { DailyNewsObject } from "./daily_news_module.js";
import { Modal } from '../../../assets/libs/bootstrap5/bootstrap5.js';
import Stubegru from '../../stubegru_core/logic/stubegru.js';



export default class DailyNewsView {


    richTextEditor: ClassicEditor;
    modal: Modal;

    async init() {
        const editorPlaceholder = Stubegru.dom.querySelector('#dailyNewsEditor');
        this.richTextEditor = await ClassicEditor.create(editorPlaceholder);
        //CKEDITOR.replace('dailyNewsEditor', { height: "200px", extraPlugins: "wikiword" }); //Richtexteditor initialisieren

        this.modal = new Modal('#daily_news_modal');
        Stubegru.dom.querySelector("#daily_news_modal").addEventListener("hidden.bs.modal", this.resetModalForm);
        this.resetModalForm();

        Stubegru.dom.querySelector("#daily_news_create_button").addEventListener("click", DailyNewsModule.controller.showDailyNewsModalForCreate);

        document.querySelectorAll('stubegruModule[data-name="daily_news"] input[type="checkbox"][data-toggle="toggle"]').forEach(function (ele) {
            //@ts-expect-error
            ele.bootstrapToggle();
        });

    }

    resetModalForm() {
        Stubegru.dom.querySelectorAsInput('#nachricht_titel').value = "";
        this.richTextEditor.setData("");
        var d = new Date();
        Stubegru.dom.querySelectorAsInput('#beginn_nachricht').value = Stubegru.utils.formatDate(d, "YYYY-MM-DD");
        d = new Date(d.getTime() + 1000 * 60 * 60 * 24 * 7); //Add 7 days
        Stubegru.dom.querySelectorAsInput('#ende_nachricht').value = Stubegru.utils.formatDate(d, "YYYY-MM-DD");
    }

    toggleMessageView() {
        let showOnlyCurrent = DailyNewsModule.state.showOnlyCurrentMessages;
        if (showOnlyCurrent) {
            Stubegru.dom.querySelector("#toggleMessageButton").innerHTML = `<i class="fas fa-eye"></i>&nbsp; Alle anzeigen`;
            Stubegru.dom.slideDown("#future_message_container");
            showOnlyCurrent = false;
        } else {
            Stubegru.dom.querySelector("#toggleMessageButton").innerHTML = `<i class="fas fa-eye-slash"></i>&nbsp; Nur aktuelle anzeigen`;
            Stubegru.dom.slideUp("#future_message_container");
            showOnlyCurrent = true;
        }
    }

    setFormData(dailyNews: DailyNewsObject) {
        Stubegru.dom.querySelectorAsInput("#nachricht_id").value = dailyNews.id;
        Stubegru.dom.querySelectorAsInput("#nachricht_titel").value = dailyNews.titel;
        Stubegru.dom.querySelectorAsInput("#beginn_nachricht").value = dailyNews.beginn;
        Stubegru.dom.querySelectorAsInput("#ende_nachricht").value = dailyNews.ende;
        Stubegru.dom.querySelectorAsInput("#nachricht_prioritaet").checked = (dailyNews.prioritaet == 1);
        this.richTextEditor.setData(dailyNews.inhalt);
    }

    renderListView(dailyNewsList: DailyNewsObject[]) {
        let html = { present: "", future: "" };

        for (let currentNews of dailyNewsList) {
            let priorityClass = currentNews.prioritaet == 1 ? "daily-news-important" : "card-default";
            let container = new Date(currentNews.beginn).getTime() > new Date().getTime() ? "future" : "present"
            let currentEnd = Stubegru.utils.formatDate(currentNews.ende, "DD.MM.YYYY");
            //const text = await stubegru.modules.wiki.wikiUtils.handleWikiWords(currentNews.inhalt); //TODO handle WIKIWORDS!!!

            html[container] += `
            <div class="card my-2">
                <div class="card-header ${priorityClass}">
                        <a href="#daily_news_collapse_${currentNews.id}" data-bs-toggle="collapse" class="stubegru-module-title">
                            <i class="fas fa-caret-down"></i> ${currentNews.titel}
                        </a>
                </div>
                <div id="daily_news_collapse_${currentNews.id}" class="collapse">
                    <div class="card-body">
                        <p>${currentNews.inhalt}</p>
                        <hr>
                        <div class="row">
                            <div class="col-12 d-flex justify-content-end">
                                <button class="btn btn-secondary mx-2 permission-MOVE_TO_WIKI permission-required" data-daily-news-id="${currentNews.id}">
                                    <i class="fas fa-share-square"></i>&nbsp; Ins Wiki schieben
                                </button>
                                <button class="btn btn-primary mx-2 permission-DAILY_NEWS_WRITE permission-required" data-daily-news-id="${currentNews.id}">
                                    <i class="fas fa-pencil-alt"></i>&nbsp; Bearbeiten
                                </button>
                                <button class="btn btn-danger mx-2 permission-DAILY_NEWS_WRITE permission-required" data-daily-news-id="${currentNews.id}">
                                    <i class="fas fa-times"></i>&nbsp; Löschen
                                </button>
                            </div>
                        </div>

                    </div>
                    <div class="card-footer">
                        <div class="row">
                            <div class="col-12 d-flex justify-content-between">
                                <small>Wird angezeigt bis: <b>${currentEnd}</b></small>
                                <small> Zuletzt geändert: <b>${currentNews.erfassungsdatum}</b></small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        }

        Stubegru.dom.querySelector("#message_container").innerHTML = html.present;
        Stubegru.dom.querySelector("#future_message_container").innerHTML = html.future;
        //stubegru.modules.userUtils.updateAdminElements(); // TODO update admin Elements
    }

    getFormData(): DailyNewsObject {
        return {
            titel: Stubegru.dom.querySelectorAsInput('#nachricht_titel').value,
            inhalt: DailyNewsModule.view.richTextEditor.getData(),
            beginn: Stubegru.dom.querySelectorAsInput('#beginn_nachricht').value,
            ende: Stubegru.dom.querySelectorAsInput('#ende_nachricht').value,
            prioritaet: Stubegru.dom.querySelectorAsInput('#nachricht_prioritaet').checked ? 1 : 0,
            id: Stubegru.dom.querySelectorAsInput('#nachricht_id').value
        }
    }
}