import Stubegru from "../stubegru_core/logic/stubegru.js";
const swalToBootstrapClass = {
    "success": "success",
    "info": "info",
    "warning": "warning",
    "error": "danger",
};
class Alert {
    static TOAST_LIVETIME = 5000; //in milliseconds
    static TOAST_ID = 0;
    static async init() {
        await Stubegru.dom.loadHtml("components/alert/module.html");
    }
    static async alertResp(resp, title) {
        let options = {};
        options.text = resp.message;
        options.type = resp.status;
        options.mode = resp.mode;
        options.title = title || resp.title;
        await Alert.alert(options);
    }
    static async alertSimple(text) {
        await Alert.alert({ text: text });
    }
    static async alertError(error) {
        console.error(error);
        await Alert.alert({
            text: error.message,
            title: "Es ist ein Fehler aufgetreten",
            type: "error"
        });
    }
    static alert(options) {
        return new Promise(function (resolve, reject) {
            options.mode = options.mode || ((options.type == "error" || options.type == "warning") ? "alert" : "toast"); //if mode is unset => use alert for errors and warnings and toasts for others
            let swalOptions = {
                html: options.text || "",
                title: options.title || "Info",
                icon: options.type || "info",
            };
            if (options.mode == "alert") {
                //@ts-expect-error Uses JS-Alerts module here
                swal(swalOptions, resolve);
            }
            else if (options.mode == "toast") {
                let toastOptions = swalOptions;
                toastOptions.bootstrapClass = swalToBootstrapClass[swalOptions.icon];
                Alert.showToast(toastOptions);
            }
        });
    }
    /**
     * @example let confirmResp = await Alert.deleteConfirm("Element löschen", "Soll dieses Element wirklich gelöscht werden?");
                if (confirmResp.isConfirmed) { ... }
     */
    static deleteConfirm(title, text, confirmButtonText = "Löschen") {
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
    static showToast(options) {
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
export default Alert;
await Alert.init();
