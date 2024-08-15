// This wrapper class is written to use bootstrap3 (untyped and jQuery based) features in stubegru typescript modules/components

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

    removeEventListener(eventId: ModalEvent, callback?: Function) {
        //@ts-expect-error
        $(this.selector).off(eventId, callback);
    }
}

type ModalEvent = "show.bs.modal" | "shown.bs.modal" | "hide.bs.modal" | "hidden.bs.modal" | "loaded.bs.modal" | "hidden.bs.modal.remove-block";