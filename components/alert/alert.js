import SweetAlert from "../sweetalert2/sweetalert2.js";
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
    static alertResp(resp, title) {
        let options = {};
        options.text = resp.message;
        options.type = resp.status;
        options.mode = resp.mode;
        options.title = title || resp.title;
        Alert.alert(options);
    }
    static alertSimple(text) {
        Alert.alert({ text: text });
    }
    static alertError(error) {
        console.error(error);
        Alert.alert({
            text: error.message,
            title: "Es ist ein Fehler aufgetreten",
            type: "error"
        });
    }
    static async alert(options) {
        options.mode = options.mode || ((options.type == "error" || options.type == "warning") ? "alert" : "toast"); //if mode is unset => use alert for errors and warnings and toasts for others
        let swalOptions = {
            html: options.text || "",
            title: options.title || "Info",
            icon: options.type || "info",
        };
        if (options.mode == "alert") {
            await SweetAlert.fire(swalOptions);
        }
        else if (options.mode == "toast") {
            swalOptions.icon = swalToBootstrapClass[swalOptions.icon];
            Alert.showToast(swalOptions);
        }
    }
    static async deleteConfirm(title, text, confirmButtonText = "Löschen") {
        return await SweetAlert.fire({
            title: title,
            html: text,
            icon: "error",
            confirmButtonText: confirmButtonText,
            showCancelButton: true,
            cancelButtonText: "Abbrechen",
        });
    }
    static showToast(options) {
        let toastId = `alert_toast_${Alert.TOAST_ID++}`;
        let html = `<div class="alert alert-${options.icon} alert-dismissible" role="alert" id="${toastId}" style="display:none;">
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
