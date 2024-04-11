export default class StubegruDom {
    /**
     * Selects an Element from the DOM as HTMLInputElement
     */
    querySelectorAsInput(selector) {
        return document.querySelector(selector);
    }
    querySelector(selector) {
        return document.querySelector(selector);
    }
    querySelectorAll(selector) {
        return document.querySelectorAll(selector);
    }
    slideUp = (target, duration = 500) => {
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
    };
    slideDown = (target, duration = 500) => {
        let elem = (typeof (target) == "string") ? this.querySelector(target) : target;
        elem.style.removeProperty('display');
        let display = window.getComputedStyle(elem).display;
        if (display === 'none')
            display = 'block';
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
    };
    slideToState = (target, state, duration = 500) => {
        return state ? this.slideDown(target, duration) : this.slideUp(target, duration);
    };
    slideToggle = (target, duration = 500) => {
        let elem = (typeof (target) == "string") ? this.querySelector(target) : target;
        if (window.getComputedStyle(elem).display === 'none') {
            return this.slideDown(elem, duration);
        }
        else {
            return this.slideUp(elem, duration);
        }
    };
}