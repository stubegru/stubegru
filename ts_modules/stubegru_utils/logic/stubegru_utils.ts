export default class Utils {


    /**
     * Selects an Element from the DOM as HTMLInputElement
     */
    static getInput(selector: string): HTMLInputElement {
        return document.querySelector(selector) as HTMLInputElement;
    }
    static getElem(selector: string): HTMLElement {
        return document.querySelector(selector) as HTMLElement;
    }

    static slideUp = (target: HTMLElement | string, duration = 500) => {
        let elem = (typeof (target) == "string") ? Utils.getElem(target) : target;

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

    static slideDown = (target: HTMLElement | string, duration = 500) => {
        let elem = (typeof (target) == "string") ? Utils.getElem(target) : target;

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

    static slideToggle = (target: HTMLElement | string, duration = 500) => {
        let elem = (typeof (target) == "string") ? Utils.getElem(target) : target;
        
        if (window.getComputedStyle(elem).display === 'none') {
            return Utils.slideDown(elem, duration);
        } else {
            return Utils.slideUp(elem, duration);
        }
    }

    static getParam(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) {
                return pair[1];
            }
        }
        return (false);
    }


    /**
     * Creates a very simple numeric hash of the given string
     * This should not be used for security relevant purposes!
     * @param {string} string The string to be hashed
     * @returns {string} The given string's hash value
     */
    static stringToHash(string) {
        let hash = 0;
        if (string.length == 0) return hash;

        for (let i = 0; i < string.length; i++) {
            let char = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return String(hash);
    }

    /**
     * Formats a date as string specified by a template string
     * @param date Date to be formatted
     * @param templateString Template of the expected format. e.g. "YYYY-MM-DD hh:mm:ss" or "YY-M-D h:m:s" to trim leading zeros
     */
    static formatDate(date: Date | string | number, templateString: string): string {
        if (!(date instanceof Date)) { date = new Date(date); }

        const year = date.getFullYear().toString();
        const shortYear = date.getFullYear().toString().substr(2, 2);
        const month = date.getMonth() < 9 ? "0" + String(date.getMonth() + 1) : String(date.getMonth() + 1);
        const shortMonth = String(date.getMonth() + 1);
        const day = date.getDate() < 10 ? "0" + date.getDate().toString() : date.getDate().toString();
        const shortDay = date.getDate().toString();
        const hours = date.getHours() < 10 ? "0" + date.getHours().toString() : date.getHours().toString();
        const shortHours = date.getHours().toString();
        const minutes = date.getMinutes() < 10 ? "0" + date.getMinutes().toString() : date.getMinutes().toString();
        const shortMinutes = date.getMinutes().toString();
        const seconds = date.getSeconds() < 10 ? "0" + date.getSeconds().toString() : date.getSeconds().toString();
        const shortSeconds = date.getSeconds().toString();

        return templateString
            .replace('YYYY', year)
            .replace('YY', shortYear)
            .replace('MM', month)
            .replace('M', shortMonth)
            .replace('DD', day)
            .replace('D', shortDay)
            .replace('hh', hours)
            .replace('h', shortHours)
            .replace('mm', minutes)
            .replace('m', shortMinutes)
            .replace('ss', seconds)
            .replace('s', shortSeconds)
    }
}