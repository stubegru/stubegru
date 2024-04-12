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
