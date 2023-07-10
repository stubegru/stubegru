stubegru.modules.alerts = {};

const TOAST_LIVETIME = 5000 //in milliseconds
const swalToBootstrapClass = {
    "success": "success",
    "info": "info",
    "warning": "warning",
    "error": "danger",
}

stubegru.modules.alerts.alert = function (options,title) {
    if (typeof options == "string") { options = { text: options }; } //if options param is just a string => use this string as alert's text

    //if options is a response object of a stubegru backend script, rename props to display correct alert
    if(options.message && options.status){
        options.text = options.message;
        options.type = options.status;
        options.title = title;
    }

    options.type = options.type || "info"; //if type is unset => set to info
    options.title = options.title || "Info"; //if title is unset => set to "Info"
    options.text = options.text || ""; //if text is unset => set to empty string
    options.mode = options.mode || ((options.type == "error" || options.type == "warning") ? "alert" : "toast"); //if mode is unset => use alert for errors and warnings and toasts for others
    options.html = true; //render html tags in title and text property

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