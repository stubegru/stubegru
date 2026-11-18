import Stubegru from "../stubegru_core/logic/stubegru.js";
export default class StubegruToggle {
    elem;
    static init() {
        Stubegru.dom.loadCss("components/stubegru_toggle/bs3_polyfill.css");
    }
    constructor(selector) {
        this.elem = Stubegru.dom.querySelectorAsInput(selector);
    }
    setState(state) {
        this.elem.checked = state;
    }
    getState() {
        return this.elem.checked;
    }
    addEventListener(eventId, callback) {
        Stubegru.dom.addEventListener(this.elem, eventId, callback);
    }
}
StubegruToggle.init();
