export default class StubegruUtils {
    async fetchConstants() {
        let resp = await fetch(`utils/constants.php`);
        let data = await resp.json();
        return data;
    }
    getParam(variable) {
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
    stringToHash(string) {
        let hash = 0;
        if (string.length == 0)
            return hash;
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
    formatDate(date, templateString) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
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
            .replace('s', shortSeconds);
    }
}
