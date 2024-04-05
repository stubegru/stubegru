import SweetAlert, { SweetAlertIcon, SweetAlertOptions } from "../../assets/libs/sweetalert2/sweetalert2.js"
import { StubegruHttpResponse } from "../stubegru_core/logic/stubegru_fetch.js";


const TOAST_LIVETIME = 5000 //in milliseconds
const swalToBootstrapClass = {
    "success": "success",
    "info": "info",
    "warning": "warning",
    "error": "danger",
}

export default class AlertModule {

    static alertResp(resp: StubegruHttpResponse, title?: string) {
        let options: StubegruAlertOptions;

        options.text = resp.message;
        options.type = resp.status as SweetAlertIcon;
        options.mode = resp.mode;
        options.title = title || options.title;

        AlertModule.alert(options);
    }

    static alertSimple(text: string) {
        AlertModule.alert({ text: text });
    }

    static alertError(error: Error) {
        console.error(error);
        AlertModule.alert({
            text: error.message,
            title: "Es ist ein Fehler aufgetreten",
            type: "error"
        });
    }

    static async alert(options: StubegruAlertOptions) {
        options.mode = options.mode || ((options.type == "error" || options.type == "warning") ? "alert" : "toast"); //if mode is unset => use alert for errors and warnings and toasts for others

        if (options.mode == "alert") {
            let swalOptions: SweetAlertOptions = {
                html: options.text || "",
                title: options.title || "Info",
                icon: options.type || "info",
            }
            await SweetAlert.fire(swalOptions);
        }

        else if (options.mode == "toast") {
            options.type = swalToBootstrapClass[options.type];
            AlertModule.showToast(options);
        }
    }

    static async deleteConfirm(title: string, text: string, confirmButtonText = "Löschen") {
        return await SweetAlert.fire({
            title: title,
            html: text,
            showCancelButton: true,
            cancelButtonText: "Abbrechen",
            confirmButtonText: confirmButtonText,
        });
    }


    static showToast(options) {
        // let html = `<div class="alert alert-${options.type} alert-dismissible" role="alert" style="display:none;">
        //                 <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        //                     <span aria-hidden="true">×</span>
        //                 </button>
        //                 <strong>${options.title}</strong>
        //                 ${options.text}
        //             </div>`;
        // let jQueryHtml = $(html);
        // $("#stubegruToastsContainer").append(jQueryHtml);
        // jQueryHtml.slideDown();
        // setTimeout(() => {
        //     jQueryHtml.remove();
        //     delete jQueryHtml;
        // }, TOAST_LIVETIME);
    }

}

export interface StubegruAlertOptions {
    text: string;
    type?: SweetAlertIcon;
    title?: string;
    mode?: "alert" | "toast";
}
