import SweetAlert from "../../assets/libs/sweetalert2/sweetalert2.js";
const TOAST_LIVETIME = 5000; //in milliseconds
const swalToBootstrapClass = {
    "success": "success",
    "info": "info",
    "warning": "warning",
    "error": "danger",
};
export default class AlertModule {
    static alertResp(resp, title) {
        let options = {};
        options.text = resp.message;
        options.type = resp.status;
        options.mode = resp.mode;
        options.title = title || resp.title;
        AlertModule.alert(options);
    }
    static alertSimple(text) {
        AlertModule.alert({ text: text });
    }
    static alertError(error) {
        console.error(error);
        AlertModule.alert({
            text: error.message,
            title: "Es ist ein Fehler aufgetreten",
            type: "error"
        });
    }
    static async alert(options) {
        options.mode = options.mode || ((options.type == "error" || options.type == "warning") ? "alert" : "toast"); //if mode is unset => use alert for errors and warnings and toasts for others
        if (options.mode == "alert") {
            let swalOptions = {
                html: options.text || "",
                title: options.title || "Info",
                icon: options.type || "info",
            };
            await SweetAlert.fire(swalOptions);
        }
        else if (options.mode == "toast") {
            options.type = swalToBootstrapClass[options.type];
            AlertModule.showToast(options);
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
