import Stubegru from "./stubegru.js";

export class Modal {
    selector: string;

    constructor(selector: string) {
        this.selector = selector;
    }

    //@ts-expect-error
    show() { $(this.selector).modal("show"); }

    //@ts-expect-error
    hide() { $(this.selector).modal("hide"); }

    //@ts-expect-error
    toggle() { $(this.selector).modal("toggle"); }

    addEventListener(eventId: ModalEvent, callback: Function) {
        //@ts-expect-error
        $(this.selector).on(eventId, callback);
    }
}

type ModalEvent = "show.bs.modal" | "shown.bs.modal" | "hide.bs.modal" | "hidden.bs.modal" | "loaded.bs.modal";