import Stubegru from "../stubegru_core/logic/stubegru.js";

export default class Toggle {
    selector: string;

    constructor(selector: string) {
        this.selector = selector;
    }

    //@ts-expect-error
    setState(state: boolean) { $(this.selector).bootstrapToggle(state ? "on" : "off"); }

    getState() { return Stubegru.dom.querySelectorAsInput(this.selector).checked }

    addEventListener(eventId: string, callback: Function) {
        //@ts-expect-error
        $(this.selector).on(eventId, callback);
    }
}