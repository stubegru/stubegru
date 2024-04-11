import Stubegru from "./stubegru.js";
export default class StubegruBackwardsCompatible {
    static replaceBootstrap5Classes() {
        const replaces = {
            "card": ["panel", "panel-default"],
            "card-header": ["panel-heading"],
            "card-body": ["panel-body"],
            "card-footer": ["panel-footer"],
            "btn-close": ["close"],
            "btn-light": ["btn-default"],
        };
        for (const search in replaces) {
            const replace = replaces[search];
            Stubegru.dom.querySelectorAll(`.${search}`).forEach(elem => {
                DOMTokenList.prototype.add.apply(elem.classList, replace);
            });
        }
        const replacesDataAttributes = {
            "data-bs-toggle": "data-toggle",
            "data-bs-dismiss": "data-dismiss",
        };
        for (const search in replacesDataAttributes) {
            const replace = replacesDataAttributes[search];
            Stubegru.dom.querySelectorAll(`[${search}]`).forEach(elem => {
                let attrValue = elem.getAttribute(search);
                elem.setAttribute(replace, attrValue);
            });
        }
    }
}
export class Modal {
    selector;
    constructor(selector) {
        this.selector = selector;
    }
    //@ts-expect-error
    show() { $(this.selector).modal("show"); }
    //@ts-expect-error
    hide() { $(this.selector).modal("hide"); }
    //@ts-expect-error
    toggle() { $(this.selector).modal("toggle"); }
    addEventListener(eventId, callback) {
        //@ts-expect-error
        $(this.selector).on(eventId, callback);
    }
}
