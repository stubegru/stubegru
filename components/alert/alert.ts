import Stubegru from "../stubegru_core/logic/stubegru.js";
import { StubegruHttpResponse } from "../stubegru_core/logic/stubegru_fetch.js";


const swalToBootstrapClass = {
    "success": "success",
    "info": "info",
    "warning": "warning",
    "error": "danger",
}


export default class Alert {

    static TOAST_LIVETIME = 5000 //in milliseconds
    static TOAST_ID = 0;

    static async init() {
        await Stubegru.dom.loadHtml("components/alert/module.html");
    }

    static async alertResp(resp: StubegruHttpResponse, title?: string) {
        let options = {} as StubegruAlertOptions;

        options.text = resp.message;
        options.type = resp.status as SweetAlertIcon;
        options.mode = resp.mode;
        options.title = title || resp.title;

        await Alert.alert(options);
    }

    static async alertSimple(text: string) {
        await Alert.alert({ text: text });
    }

    static async alertError(error: Error) {
        console.error(error);
        await Alert.alert({
            text: error.message,
            title: "Es ist ein Fehler aufgetreten",
            type: "error"
        });
    }

    static alert(options: StubegruAlertOptions): Promise<boolean> {
        return new Promise(function (resolve, reject) {


            options.mode = options.mode || ((options.type == "error" || options.type == "warning") ? "alert" : "toast"); //if mode is unset => use alert for errors and warnings and toasts for others

            let swalOptions: SweetAlertOptions = {
                html: options.text || "",
                title: options.title || "Info",
                icon: options.type || "info",
            }

            if (options.mode == "alert") {
                //@ts-expect-error Uses JS-Alerts module here
                swal(swalOptions, resolve);
            }

            else if (options.mode == "toast") {
                let toastOptions = swalOptions as StubegruToastOptions;
                toastOptions.bootstrapClass = swalToBootstrapClass[swalOptions.icon];
                Alert.showToast(toastOptions);
            }
        });
    }

    /**
     * @example let confirmResp = await Alert.deleteConfirm("Element löschen", "Soll dieses Element wirklich gelöscht werden?");
                if (confirmResp.isConfirmed) { ... }
     */
    static deleteConfirm(title: string, text: string, confirmButtonText = "Löschen"): Promise<boolean> {
        return new Promise(function (resolve, reject) {
            //@ts-expect-error Uses JS-Alerts module here
            swal({
                title: title,
                text: text,
                type: "error",
                showCancelButton: true,
                cancelButtonText: "Abbrechen",
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Löschen",
            }, resolve);
        });
    }


    static showToast(options: StubegruToastOptions) {
        let toastId = `alert_toast_${Alert.TOAST_ID++}`;
        let html = `<div class="alert alert-${options.bootstrapClass} alert-dismissible" role="alert" id="${toastId}" style="display:none;">
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <strong>${options.title}</strong>
                        ${options.html}
                    </div>`;

        Stubegru.dom.querySelector("#stubegruToastsContainer").insertAdjacentHTML("beforeend", html);
        Stubegru.dom.slideDown(`#${toastId}`);
        setTimeout(() => Stubegru.dom.querySelector(`#${toastId}`).remove(), Alert.TOAST_LIVETIME);
    }

}

export interface StubegruAlertOptions {
    text: string;
    type?: SweetAlertIcon;
    title?: string;
    mode?: "alert" | "toast";
}

interface SweetAlertOptions {
    title: string;
    html: string;
    icon: SweetAlertIcon;
}

interface StubegruToastOptions extends SweetAlertOptions {
    bootstrapClass: "success" | "info" | "warning" | "danger" | string;
}

type SweetAlertIcon = "success" | "warning" | "error" | "info";

await Alert.init();



