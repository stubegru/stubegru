import Stubegru from "./stubegru.js";

export default class StubegruDom {


    /**
     * Selects an Element from the DOM as HTMLInputElement
     */
    querySelectorAsInput(selector: string): HTMLInputElement {
        return document.querySelector(selector) as HTMLInputElement;
    }
    querySelector(selector: string): HTMLElement {
        return document.querySelector(selector) as HTMLElement;
    }
    querySelectorAll(selector: string) {
        return document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
    }

    removeEventListener(selector: string) {
        this.querySelectorAll(selector).forEach(element => {
            const newElement = element.cloneNode(true);
            element.replaceWith(newElement);
        });
    }

    slideUp = (target: HTMLElement | string, duration = 500) => {
        let elem = (typeof (target) == "string") ? this.querySelector(target) : target;

        elem.style.transitionProperty = 'height, margin, padding';
        elem.style.transitionDuration = duration + 'ms';
        elem.style.boxSizing = 'border-box';
        elem.style.height = elem.offsetHeight + 'px';
        elem.offsetHeight;
        elem.style.overflow = 'hidden';
        elem.style.height = "0";
        elem.style.paddingTop = "0";
        elem.style.paddingBottom = "0";
        elem.style.marginTop = "0";
        elem.style.marginBottom = "0";
        window.setTimeout(() => {
            elem.style.display = 'none';
            elem.style.removeProperty('height');
            elem.style.removeProperty('padding-top');
            elem.style.removeProperty('padding-bottom');
            elem.style.removeProperty('margin-top');
            elem.style.removeProperty('margin-bottom');
            elem.style.removeProperty('overflow');
            elem.style.removeProperty('transition-duration');
            elem.style.removeProperty('transition-property');
            //alert("!");
        }, duration);
    }

    slideDown = (target: HTMLElement | string, duration = 500) => {
        let elem = (typeof (target) == "string") ? this.querySelector(target) : target;

        elem.style.removeProperty('display');
        let display = window.getComputedStyle(elem).display;
        if (display === 'none') display = 'block';
        elem.style.display = display;
        let height = elem.offsetHeight;
        elem.style.overflow = 'hidden';
        elem.style.height = "0";
        elem.style.paddingTop = "0";
        elem.style.paddingBottom = "0";
        elem.style.marginTop = "0";
        elem.style.marginBottom = "0";
        elem.offsetHeight;
        elem.style.boxSizing = 'border-box';
        elem.style.transitionProperty = "height, margin, padding";
        elem.style.transitionDuration = duration + 'ms';
        elem.style.height = height + 'px';
        elem.style.removeProperty('padding-top');
        elem.style.removeProperty('padding-bottom');
        elem.style.removeProperty('margin-top');
        elem.style.removeProperty('margin-bottom');
        window.setTimeout(() => {
            elem.style.removeProperty('height');
            elem.style.removeProperty('overflow');
            elem.style.removeProperty('transition-duration');
            elem.style.removeProperty('transition-property');
        }, duration);
    }

    slideToState = (target: HTMLElement | string, state: boolean, duration = 500) => {
        return state ? this.slideDown(target, duration) : this.slideUp(target, duration)
    }

    slideToggle = (target: HTMLElement | string, duration = 500) => {
        let elem = (typeof (target) == "string") ? this.querySelector(target) : target;

        if (window.getComputedStyle(elem).display === 'none') {
            return this.slideDown(elem, duration);
        } else {
            return this.slideUp(elem, duration);
        }
    }

    show(selector: string) {
        this.querySelector(selector).style.removeProperty("display");
    }

    hide(selector: string) {
        this.querySelector(selector).style.display = "none";
    }

    setVisibility(selector: string, state: boolean) {
        state ? this.show(selector) : this.hide(selector);
    }

    /**
     * Load remote HTML and append to module's DOM element
     * @param path Path to HTML file relative to BASE_URL/${path}
     * @param selector Selector of the element to append the loaded html, @default "body"
     */
    async loadHtml(path, selector = "body") {
        let html = await Stubegru.fetch.getText(path);
        this.querySelector(selector).insertAdjacentHTML("beforeend", html);
    }

    /**
     * Load remote CSS and append to current document
     * @param path Path to HTML file relative to BASE_URL/${path}
     */
    async loadCss(path) {
        return new Promise(function (resolve, reject) {
            let cssElem = document.createElement("link");
            cssElem.href = `${Stubegru.constants.BASE_URL}/${path}`;
            cssElem.rel = "stylesheet";
            cssElem.addEventListener('load', resolve);
            document.head.appendChild(cssElem);
        });
    }


}