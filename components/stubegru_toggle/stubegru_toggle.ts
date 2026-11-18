import Stubegru from "../stubegru_core/logic/stubegru.js";

export default class StubegruToggle {
    elem: HTMLInputElement;

    static init() {
        Stubegru.dom.loadCss("components/stubegru_toggle/bs3_polyfill.css");
    }

    constructor(selector: string) {
        this.elem = Stubegru.dom.querySelectorAsInput(selector);
    }

    setState(state: boolean) {
        this.elem.checked = state;
    }

    getState(): boolean {
        return this.elem.checked
    }

    addEventListener(eventId: string, callback: Function) {
        Stubegru.dom.addEventListener(this.elem, eventId, callback);
    }
}

StubegruToggle.init();