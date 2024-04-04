import ClassicEditor from '../../../assets/libs/ckeditor5/ckeditor.js'
import DailyNewsModule, { DailyNewsObject } from "./daily_news_module.js";
import { Modal } from '../../../assets/libs/bootstrap5/bootstrap5.js';
import Stubegru from '../../stubegru_core/logic/stubegru.js';

export default class DailyNewsView {


    richTextEditor: ClassicEditor;
    modal: Modal;

    async init() {
        const editorPlaceholder = Stubegru.dom.getElem('#dailyNewsEditor');
        this.richTextEditor = await ClassicEditor.create(editorPlaceholder);
        //CKEDITOR.replace('dailyNewsEditor', { height: "200px", extraPlugins: "wikiword" }); //Richtexteditor initialisieren

        this.modal = new Modal('#daily_news_modal');
        Stubegru.dom.getElem("#daily_news_modal").addEventListener("hidden.bs.modal", this.resetModalForm);
        this.resetModalForm();

        Stubegru.dom.getElem("#daily_news_new_button").addEventListener("click", DailyNewsModule.controller.showDailyNewsModalForCreate);

    }

    resetModalForm() {
        Stubegru.dom.getInput('#nachricht_titel').value = "";
        this.richTextEditor.setData("");
        var d = new Date();
        Stubegru.dom.getInput('#beginn_nachricht').value = Stubegru.utils.formatDate(d, "YYYY-MM-DD");
        d = new Date(d.getTime() + 1000 * 60 * 60 * 24 * 7); //Add 7 days
        Stubegru.dom.getInput('#ende_nachricht').value = Stubegru.utils.formatDate(d, "YYYY-MM-DD");
    }

    toggleMessageView() {
        let showOnlyCurrent = DailyNewsModule.state.showOnlyCurrentMessages;
        if (showOnlyCurrent) {
            Stubegru.dom.getElem("#toggleMessageButton").innerHTML = `<i class="fas fa-eye"></i>&nbsp; Alle anzeigen`;
            Stubegru.dom.slideDown("#future_message_container");
            showOnlyCurrent = false;
        } else {
            Stubegru.dom.getElem("#toggleMessageButton").innerHTML = `<i class="fas fa-eye-slash"></i>&nbsp; Nur aktuelle anzeigen`;
            Stubegru.dom.slideUp("#future_message_container");
            showOnlyCurrent = true;
        }
    }

    setFormData(dailyNews: DailyNewsObject) {
        Stubegru.dom.getInput("#nachricht_id").value = dailyNews.id;
        Stubegru.dom.getInput("#nachricht_titel").value = dailyNews.titel;
        Stubegru.dom.getInput("#beginn_nachricht").value = dailyNews.beginn;
        Stubegru.dom.getInput("#ende_nachricht").value = dailyNews.ende;
        Stubegru.dom.getInput("#nachricht_prioritaet").checked = (dailyNews.prioritaet == 1);
        this.richTextEditor.setData(dailyNews.inhalt);
    }

    renderListView(dailyNewsList: DailyNewsObject[]) {
        let html = { present: "", future: "" };

        for (let currentNews of dailyNewsList) {
            let priorityClass = currentNews.prioritaet == 1 ? "panel-danger" : "panel-default";
            let container = new Date(currentNews.beginn).getTime() > new Date().getTime() ? "future" : "present"
            let currentEnd = Stubegru.utils.formatDate(currentNews.ende, "DD.MM.YYYY");
            //const text = await stubegru.modules.wiki.wikiUtils.handleWikiWords(currentNews.inhalt); //TODO handle WIKIWORDS!!!

            html[container] += `
            <div class="panel ${priorityClass}">
                <div class="panel-heading">
                    <h4 class="panel-title">
                        <a  href="#collapseMessage${currentNews.id}" data-toggle="collapse">
                            ${currentNews.titel}
                        </a>
                    </h4>
                </div>
                <div id="collapseMessage${currentNews.id}" class="panel-collapse collapse" aria-expanded="false">
                      <div class="panel-body">
                        <p>${currentNews.inhalt}</p>
                        <hr>
                        <span class="pull-right">
                            <button class="btn btn-default permission-MOVE_TO_WIKI permission-required" onclick="moveToWiki(${currentNews.id})">
                                <i class="fas fa-share-square"></i>&nbsp; Ins Wiki schieben
                            </button>
                            <button class="btn btn-primary permission-DAILY_NEWS_WRITE permission-required" onclick="showMessageModal(${currentNews.id})">
                                <i class="fas fa-pencil-alt"></i>&nbsp; Bearbeiten
                            </button>
                            <button class="btn btn-danger permission-DAILY_NEWS_WRITE permission-required" onclick="deleteMessage(${currentNews.id})">
                                <i class="fas fa-times"></i>&nbsp; Löschen
                            </button>
                        </span>
                    </div>
                    <div class="panel-footer">
                        Wird angezeigt bis: ${currentEnd} 
                        <span class="pull-right">
                            Zuletzt geändert: ${currentNews.erfassungsdatum}
                        </span>
                    </div>
                </div>
            </div>`;
        }

        Stubegru.dom.getElem("#message_container").innerHTML = html.present;
        Stubegru.dom.getElem("#future_message_container").innerHTML = html.future;
        //stubegru.modules.userUtils.updateAdminElements(); // TODO update admin Elements
    }

    getFormData(): DailyNewsObject {
        return {
            titel: Stubegru.dom.getInput('#nachricht_titel').value,
            inhalt: DailyNewsModule.view.richTextEditor.getData(),
            beginn: Stubegru.dom.getInput('#beginn_nachricht').value,
            ende: Stubegru.dom.getInput('#ende_nachricht').value,
            prioritaet: Stubegru.dom.getInput('#nachricht_prioritaet').checked ? 1 : 0,
            id: Stubegru.dom.getInput('#nachricht_id').value
        }
    }
}