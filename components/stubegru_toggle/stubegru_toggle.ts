import Stubegru from "../stubegru_core/logic/stubegru.js";

export default class StubegruToggle {
    selector: string;

    static init() {
        Stubegru.dom.loadCss("components/stubegru_toggle/bs3_polyfill.css");
    }

    constructor(selector: string) {
        this.selector = selector;
    }

    setState(state: boolean) {
        throw new Error("Not implemented");
    }

    getState() {
        throw new Error("Not implemented");
        return Stubegru.dom.querySelectorAsInput(this.selector).checked
    }

    addEventListener(eventId: string, callback: Function) {
        throw new Error("Not implemented");

    }
}

StubegruToggle.init();