DEFAULT_VIEW = "dashboard";

initStubegru();

async function initStubegru() {
    await initStubegruObject();//Register global stubegru object
    await loadView();
    afterLoadView();
}


async function initStubegruObject() {
    let stubegru = {};
    stubegru.modules = {};
    stubegru.constants = await getGlobalConstants();
    window.stubegru = stubegru;
    checkAppVersion();
}


async function loadView() {
    let view = getParam("view") || DEFAULT_VIEW;
    stubegru.currentView = view;

    let resp = await fetch(`${stubegru.constants.BASE_URL}/utils/load_view.php?view=${view}`);
    let data = await resp.text();

    $("body").append(data); //Add view content to page
    setTitle();
    setFavicon();

    if (!await checkViewAccess()) { return false }; //check view access requested by stubegruAttribute
    await StubegruModuleLoader.loadStubegruModules();
}


async function checkViewAccess() {
    let accessValue = $("stubegruAttribute[data-name='access']").attr("data-value");
    accessValue = accessValue || "DEFAULT_VIEW_ACCESS";

    const resp = await fetch(`${stubegru.constants.BASE_URL}/modules/user_utils/test_permission_request.php?permissionRequest=${accessValue}`);
    const respJson = await resp.json();

    if (resp.status == 200 && respJson.status == "success") {
        return true;
    }
    else {
        console.log(respJson.message);

        if (respJson.permission == "user") { //Redirect to Login page
            let triggerUrl = encodeURIComponent(document.location.href);
            document.location.href = `${stubegru.constants.BASE_URL}?view=login&triggerUrl=${triggerUrl}`;
        } else {
            //Add error message to current page
            let html = `<div class="alert alert-danger text-center">
                        <strong>Kein Zugriff! </strong>
                        Um diese Seite aufzurufen ist die Berechtigung <b>'${respJson.permission}'</b> nötig.
                    </div>`;
            $("body").append(html);
        }
    }
    return false;
}

/**
 * Set the page's title.
 */
function setTitle() {
    let defaultTitle = stubegru.constants.CUSTOM_CONFIG.applicationName;
    let viewTitle = $("stubegruAttribute[data-name='title']").attr("data-value");
    document.title = defaultTitle + (viewTitle ? `| ${viewTitle}` : "");
}

/**
 * Set the page's favicon.
 */
function setFavicon() {
    let defaultFavicon = stubegru.constants.CUSTOM_CONFIG.favicon || "/assets/images/favicon.png";
    let viewFavicon = $("stubegruAttribute[data-name='favicon']").attr("data-value") || defaultFavicon;
    var link = document.querySelector("link[rel~='icon']");
    link.href = stubegru.constants.BASE_URL + viewFavicon;
}


/**
 * Add code that should be executed after ALL modules were load here
 */
function afterLoadView() {
    $(`[data-toggle="toggle"]`).bootstrapToggle();//Init toggles
    ckEditorModalFix();
    if (stubegru.modules.userUtils) { stubegru.modules.userUtils.updateAdminElements(); }
}





async function getGlobalConstants() {
    let resp = await fetch(`utils/constants.php`);
    let data = await resp.json();
    return data;
}

function checkAppVersion() {
    let oldVersion = localStorage.getItem("APPLICATION_VERSION");
    let newVersion = stubegru.constants.APPLICATION_VERSION;
    localStorage.setItem("APPLICATION_VERSION", newVersion);

    if (oldVersion != newVersion) {
        console.log(`Trigger hard reload because of new version available\nOld Version: ${oldVersion}\nNew Version ${newVersion}`);
        document.location.reload(true); //Do hard reload if there's a new version
    }
}


function getParam(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}

//see: https://ckeditor.com/old/forums/Support/Issue-with-Twitter-Bootstrap#comment-127719
function ckEditorModalFix() {
    $.fn.modal.Constructor.prototype.enforceFocus = function () {
        modal_this = this;
        $(document).on('focusin.modal', function (e) {
            if (modal_this.$element[0] !== e.target && !modal_this.$element.has(e.target).length
                && !$(e.target.parentNode).hasClass('cke_dialog_ui_input_select')
                && !$(e.target.parentNode).hasClass('cke_dialog_ui_input_text')) {
                modal_this.$element.focus();
            }
        });
    };
}

/**
 * Creates a very simple numeric hash of the given string
 * This should not be used for security relevant purposes!
 * @param {string} string The string to be hashed
 * @returns {string} The given string's hash value
 */
function stringToHash(string) {
    let hash = 0;
    if (string.length == 0) return hash;

    for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return String(hash);
}

/**
 * Formats a date as string specified by a template string
 * @param date Date to be formatted
 * @param templateString Template of the expected format. e.g. "YYYY-MM-DD hh:mm:ss" or "YY-M-D h:m:s" to trim leading zeros
 */
function formatDate(date, templateString) {
    if (!(date instanceof Date)) { date = new Date(date); }

    const year = date.getFullYear().toString();
    const shortYear = date.getFullYear().toString().substr(2, 2);
    const month = date.getMonth() < 9 ? "0" + String(date.getMonth() + 1) : String(date.getMonth() + 1);
    const shortMonth = String(date.getMonth() + 1);
    const day = date.getDate() < 10 ? "0" + date.getDate().toString() : date.getDate().toString();
    const shortDay = date.getDate().toString();
    const hours = date.getHours() < 10 ? "0" + date.getHours().toString() : date.getHours().toString();
    const shortHours = date.getHours().toString();
    const minutes = date.getMinutes() < 10 ? "0" + date.getMinutes().toString() : date.getMinutes().toString();
    const shortMinutes = date.getMinutes().toString();
    const seconds = date.getSeconds() < 10 ? "0" + date.getSeconds().toString() : date.getSeconds().toString();
    const shortSeconds = date.getSeconds().toString();

    return templateString
        .replace('YYYY', year)
        .replace('YY', shortYear)
        .replace('MM', month)
        .replace('M', shortMonth)
        .replace('DD', day)
        .replace('D', shortDay)
        .replace('hh', hours)
        .replace('h', shortHours)
        .replace('mm', minutes)
        .replace('m', shortMinutes)
        .replace('ss', seconds)
        .replace('s', shortSeconds)
}




