import Stubegru from "../stubegru_core/logic/stubegru.js";

export default class StubegruToggle {
    elem: HTMLInputElement;

    static loadCss() {
        Stubegru.dom.loadCss("components/stubegru_toggle/stubegru_toggle.css");
    }

    constructor(selector: string) {
        let elem = Stubegru.dom.querySelectorAsInput(selector);
        this.elem = elem;

        if (elem.dataset.initialized) {
            console.warn(`Checkbox with selector ${selector} is already initialized.`);
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'btn-toggle';
        elem.parentNode?.insertBefore(wrapper, elem);
        wrapper.appendChild(elem);


        const label = document.createElement('label');
        label.htmlFor = elem.id;
        if (elem.dataset.width) { label.style.minWidth = elem.dataset.width; }
        wrapper.appendChild(label);

        const onText = elem.dataset.onText ?? 'On';
        const offText = elem.dataset.offText ?? 'Off';

        const onStyle = elem.dataset.onStyle ?? 'success';
        const offStyle = elem.dataset.offStyle ?? 'danger';

        function update(): void {
            const enabled = elem.checked;

            label.innerHTML = enabled ? onText : offText;
            label.className = `btn btn-${enabled ? onStyle : offStyle}`;
        }

        elem.addEventListener('change', update);

        // Mark as initialized
        elem.dataset.initialized = 'true';

        // Initialize visual state
        update();
    }

    setState(state: boolean) {
        if (this.elem.checked !== state) {
            this.elem.checked = state;
            this.elem.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    getState(): boolean {
        return this.elem.checked
    }

    addEventListener(eventId: string, callback: Function) {
        Stubegru.dom.addEventListener(this.elem, eventId, callback);
    }
}

StubegruToggle.loadCss();