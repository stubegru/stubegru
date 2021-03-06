stubegru.modules.alerts = {};

const TOAST_LIVETIME = 5000 //in milliseconds
const swalToBootstrapClass = {
    "success": "success",
    "info": "info",
    "warning": "warning",
    "error": "danger",
}

stubegru.modules.alerts.alert = function (options) {
    if (typeof options == "string") { options = { text: options }; } //if options param is just a string => use this string as alert's text
    options.type = options.type || "info"; //if type is unset => set to info
    options.title = options.title || "Info"; //if title is unset => set to "Info"
    options.text = options.text || ""; //if text is unset => set to empty string
    options.mode = options.mode || ((options.type == "error" || options.type == "warning") ? "alert" : "toast"); //if mode is unset => use alert for errors and warnings and toasts for others

    if (options.mode == "alert") { swal(options); }
    else if (options.mode == "toast") {
        options.type = swalToBootstrapClass[options.type];
        showToast(options);
    }
    else { throw new Error(`[Alerts] Unknown alert mode '${options.mode}'. Can't trigger alert.`) }
}

function showToast(options) {
    let html = `<div class="alert alert-${options.type} alert-dismissible" role="alert" style="display:none;">
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">×</span>
                    </button>
                    <strong>${options.title}</strong>
                    ${options.text}
                </div>`;
    let jQueryHtml = $(html);
    $("#stubegruToastsContainer").append(jQueryHtml);
    jQueryHtml.slideDown();
    setTimeout(() => {
        jQueryHtml.remove();
        delete jQueryHtml;
    },TOAST_LIVETIME);
}