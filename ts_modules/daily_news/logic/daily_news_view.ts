import ClassicEditor from '../../../assets/libs/ckeditor5/ckeditor.js'
import Utils from "../../stubegru_utils/logic/stubegru_utils.js";
import DailyNews from "./daily_news_module.js";
import {Modal} from '../../../assets/libs/bootstrap5/bootstrap5.js';

export default class DailyNewsView {


    richTextEditor: ClassicEditor;
    modal:Modal;

    async init() {
        const editorPlaceholder = Utils.getElem('#dailyNewsEditor');
        this.richTextEditor = await ClassicEditor.create(editorPlaceholder);
        //CKEDITOR.replace('dailyNewsEditor', { height: "200px", extraPlugins: "wikiword" }); //Richtexteditor initialisieren

        Utils.getElem("#daily_news_new_button").addEventListener("click", this.showModalForm);
        this.modal = new Modal('#daily_news_modal');
    }

    resetModalForm() {
        Utils.getInput('#nachricht_titel').value = "";
        this.richTextEditor.setData("");
        var d = new Date();
        Utils.getInput('#beginn_nachricht').value = Utils.formatDate(d, "YYYY-MM-DD");
        d = new Date(d.getTime() + 1000 * 60 * 60 * 24 * 7); //Add 7 days
        Utils.getInput('#ende_nachricht').value = Utils.formatDate(d, "YYYY-MM-DD");
    }

    toggleMessageView() {
        let showOnlyCurrent = DailyNews.state.showOnlyCurrentMessages;
        if (showOnlyCurrent) {
            Utils.getElem("#toggleMessageButton").innerHTML = `<i class="fas fa-eye"></i>&nbsp; Alle anzeigen`;
            Utils.slideDown("#future_message_container");
            showOnlyCurrent = false;
        } else {
            Utils.getElem("#toggleMessageButton").innerHTML = `<i class="fas fa-eye-slash"></i>&nbsp; Nur aktuelle anzeigen`;
            Utils.slideUp("#future_message_container");
            showOnlyCurrent = true;
        }
    }

    showModalForm = (id)=> {
        //Vorhandenen Nachricht bearbeiten
        if (id != "new") {
            //         Utils.getElem.ajax({
            //             type: "POST",
            //             url: `Utils.getElem{stubegru.constants.BASE_URL}/modules/daily_news/get_message_data.php`,
            //             data: {
            //                 messageId: id
            //             },
            //             success: function (data) {
            //                 var json = JSON.parse(data);
            //                 Utils.getElem("#nachricht_titel").value = json.titel);
            //         Utils.getElem("#beginn_nachricht").value = json.beginn);
            //         Utils.getElem("#ende_nachricht").value = json.ende);
            //         Utils.getElem("#nachricht_prioritaet").bootstrapToggle(json.prioritaet == 0 ? "off" : "on");
            //         CKEDITOR.instances.dailyNewsEditor.setData(json.inhalt);
            //         Utils.getElem("#meditor").modal("show");
            //         Utils.getElem("#nachricht_id").value = id);
            //     }
            // });
        }
        else {
            //@ts-expect-error
            $("#meditor").modal("show");
            //Utils.getElem("#meditor").modal("show");
            Utils.getInput("#nachricht_id").value = id;
        }
        //TODO Remove this test code vvv
        this.modal.show();
    }
}