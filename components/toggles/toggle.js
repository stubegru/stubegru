import Stubegru from "../stubegru_core/logic/stubegru.js";
export default class Toggle {
    selector;
    constructor(selector) {
        this.selector = selector;
    }
    //@ts-expect-error
    setState(state) { $(this.selector).bootstrapToggle(state ? "on" : "off"); }
    getState() { return Stubegru.dom.querySelectorAsInput(this.selector).checked; }
    addEventListener(eventId, callback) {
        //@ts-expect-error
        $(this.selector).on(eventId, callback);
    }
}
