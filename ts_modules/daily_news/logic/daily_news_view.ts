///@VSCode:tuwrraphael.queryselector-completion: import html from "../module.html";
import ClassicEditor from '../../../assets/libs/ckeditor5/ckeditor.js'
import DailyNewsModule, { DailyNewsObject } from "./daily_news_module.js";
import Stubegru from '../../stubegru_core/logic/stubegru.js';
import StubegruBackwardsCompatible, { Modal } from '../../stubegru_core/logic/stubegru_backwards_compatible.js';



export default class DailyNewsView {


    richTextEditor: ClassicEditor;
    modal: Modal;

    async init() {
        const editorPlaceholder = Stubegru.dom.querySelector('#daily_news_text');
        this.richTextEditor = await ClassicEditor.create(editorPlaceholder, { height: "200px" }); //TODO: style ckeditor,wikiwordplugin...
        //CKEDITOR.replace('dailyNewsEditor', { height: "200px", extraPlugins: "wikiword" }); //Richtexteditor initialisieren

        this.modal = new Modal('#daily_news_modal');
        Stubegru.dom.querySelector("#daily_news_modal").addEventListener("hidden.bs.modal", this.resetModalForm);
        this.resetModalForm();
        
        Stubegru.dom.querySelector("#daily_news_only_current_toggle").addEventListener("change", this.updateShowCurrentState);

        Stubegru.dom.querySelector("#daily_news_create_button").addEventListener("click", DailyNewsModule.controller.showDailyNewsModalForCreate);
        Stubegru.dom.querySelector("#daily_news_modal_form").addEventListener("submit", (event) => {
            event.preventDefault();
            DailyNewsModule.controller.saveDailyNews();
        });

        //TODO: write nice ts interface for toggle init
        //$('stubegruModule[data-name="daily_news"] input[type="checkbox"][data-toggle="toggle"]').bootstrapToggle(); 

    }

    updateShowCurrentState() {
        let state = Stubegru.dom.querySelectorAsInput("#daily_news_only_current_toggle").checked;
        Stubegru.dom.slideToState("#daily_news_item_container_future", state);
    }

    resetModalForm = () => {
        Stubegru.dom.querySelectorAsInput('#daily_news_title').value = "";
        this.richTextEditor.setData("");
        var d = new Date();
        Stubegru.dom.querySelectorAsInput('#daily_news_start').value = Stubegru.utils.formatDate(d, "YYYY-MM-DD");
        d = new Date(d.getTime() + 1000 * 60 * 60 * 24 * 7); //Add 7 days
        Stubegru.dom.querySelectorAsInput('#daily_news_end').value = Stubegru.utils.formatDate(d, "YYYY-MM-DD");
        //@ts-expect-error TODO: Use pretty TS interface for bootstrap toggles
        $("#daily_news_priority").bootstrapToggle("off");
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
        Stubegru.dom.querySelectorAsInput("#daily_news_id").value = dailyNews.id;
        Stubegru.dom.querySelectorAsInput("#daily_news_title").value = dailyNews.titel;
        Stubegru.dom.querySelectorAsInput("#daily_news_start").value = dailyNews.beginn;
        Stubegru.dom.querySelectorAsInput("#daily_news_end").value = dailyNews.ende;
        //@ts-expect-error TODO: Use pretty TS interface for bootstrap toggles
        Stubegru.dom.querySelectorAsInput("#daily_news_priority").bootstrapToggle(dailyNews.prioritaet == 1 ? "on" : "off");
        this.richTextEditor.setData(dailyNews.inhalt);
    }

    async renderListView(dailyNewsList: DailyNewsObject[]) {
        let html = { present: "", future: "" };

        for (let currentNews of dailyNewsList) {
            let priorityClass = currentNews.prioritaet == 1 ? "daily-news-important" : "card-default";
            let container = new Date(currentNews.beginn).getTime() > new Date().getTime() ? "future" : "present"
            let currentEnd = Stubegru.utils.formatDate(currentNews.ende, "DD.MM.YYYY");
            //@ts-expect-error
            const text = await stubegru.modules.wiki.wikiUtils.handleWikiWords(currentNews.inhalt); //TODO: refactor handle WIKIWORDS!!!

            html[container] += `
            <div class="card my-2">
                <div class="card-header ${priorityClass}">
                    <a href="#daily_news_collapse_${currentNews.id}" data-bs-toggle="collapse" class="stubegru-module-title">
                        <div class="row m-0">
                            <div class="col-sm-10">
                                ${currentNews.titel}
                            </div>
                            <div class="col-sm-2 d-flex justify-content-end">
                                <i class="fas fa-caret-down"></i>
                            </div>
                        </div>
                    </a>
                </div>
                <div id="daily_news_collapse_${currentNews.id}" class="collapse">
                    <div class="card-body">
                        <p>${currentNews.inhalt}</p>
                        <hr>
                        <div class="row">
                            <div class="col-12 d-flex justify-content-end">
                                <button class="btn btn-secondary daily-news-to-wiki-button mx-2 permission-MOVE_TO_WIKI permission-required" data-daily-news-id="${currentNews.id}">
                                    <i class="fas fa-share-square"></i>&nbsp; Ins Wiki schieben
                                </button>
                                <button class="btn btn-primary daily-news-edit-button mx-2 permission-DAILY_NEWS_WRITE permission-required" data-daily-news-id="${currentNews.id}">
                                    <i class="fas fa-pencil-alt"></i>&nbsp; Bearbeiten
                                </button>
                                <button class="btn btn-danger daily-news-delete-button mx-2 permission-DAILY_NEWS_WRITE permission-required" data-daily-news-id="${currentNews.id}">
                                    <i class="fas fa-times"></i>&nbsp; Löschen
                                </button>
                            </div>
                        </div>

                    </div>
                    <div class="card-footer">
                        <div class="row m-0">
                            <div class="col-12 d-flex justify-content-between">
                                <small>Wird angezeigt bis: <b>${currentEnd}</b></small>
                                <small> Zuletzt geändert: <b>${currentNews.erfassungsdatum}</b></small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        }

        Stubegru.dom.querySelector("#daily_news_item_container_present").innerHTML = html.present;
        Stubegru.dom.querySelector("#daily_news_item_container_future").innerHTML = html.future;
        //@ts-expect-error TODO: use new typescript stubegru-core API for updateAdminElements
        stubegru.modules.userUtils.updateAdminElements();
        this.registerButtonEvents();
        StubegruBackwardsCompatible.replaceBootstrap5Classes();
    }

    registerButtonEvents(){
        Stubegru.dom.querySelectorAll(".daily-news-delete-button").forEach(elem => {
            const dailyNewsId = elem.getAttribute("data-daily-news-id");
            elem.addEventListener("click",()=>DailyNewsModule.controller.deleteDailyNews(dailyNewsId));
        });
        Stubegru.dom.querySelectorAll(".daily-news-edit-button").forEach(elem => {
            const dailyNewsId = elem.getAttribute("data-daily-news-id");
            elem.addEventListener("click",()=>DailyNewsModule.controller.showDailyNewsModalForUpdate(dailyNewsId));
        });
        Stubegru.dom.querySelectorAll(".daily-news-to-wiki-button").forEach(elem => {
            const dailyNewsId = elem.getAttribute("data-daily-news-id");
            elem.addEventListener("click",()=>DailyNewsModule.controller.moveDailyNewsToWiki(dailyNewsId));
        });
    }

    getFormData(): DailyNewsObject {
        return {
            id: Stubegru.dom.querySelectorAsInput('#daily_news_id').value,
            titel: Stubegru.dom.querySelectorAsInput('#daily_news_title').value,
            inhalt: DailyNewsModule.view.richTextEditor.getData(),
            beginn: Stubegru.dom.querySelectorAsInput('#daily_news_start').value,
            ende: Stubegru.dom.querySelectorAsInput('#daily_news_end').value,
            prioritaet: Stubegru.dom.querySelectorAsInput('#daily_news_priority').checked ? 1 : 0,
        }
    }
}