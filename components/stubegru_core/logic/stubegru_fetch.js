import Stubegru from "./stubegru.js";
export default class StubegruFetch {
    /**
     * Fetch a resource from Server using fetch API with method POST
     * @param url Resource's URL relative to BASE_URL/${url}
     * @param data Payload as key value list (will be converted to FormData)
     */
    async post(url, data) {
        let formData = this.objectToFormData(data);
        let resp = await fetch(`${Stubegru.constants.BASE_URL}/${url}`, {
            method: 'POST',
            body: formData
        });
        return resp;
    }
    /**
    * Fetch a resource from Server using fetch API with method GET
    * @param url Resource's URL relative to BASE_URL/${url}
    * @param data Payload as key value list (will be converted to queryString)
    */
    async get(url, data) {
        let queryString = data ? "?" + new URLSearchParams(Object.entries(data)).toString() : "";
        let resp = await fetch(`${Stubegru.constants.BASE_URL}/${url}${queryString}`);
        return resp;
    }
    /**
     * Fetch a resource as JSON Object from Server using fetch API with method POST
     * @param url Resource's URL relative to BASE_URL/${url}
     * @param data Payload as key value list (will be converted to FormData)
     */
    async postJson(url, data) {
        let resp = await Stubegru.fetch.post(url, data);
        let parsedResp = await resp.json();
        return parsedResp;
    }
    /**
    * Fetch a resource as JSON Object from Server using fetch API with method GET
    * @param url Resource's URL relative to BASE_URL/${url}
    * @param data Payload as key value list (will be converted to queryString)
    */
    async getJson(url, data) {
        let resp = await Stubegru.fetch.get(url, data);
        let parsedResp = await resp.json();
        return parsedResp;
    }
    /**
     * Fetch a resource as Text from Server using fetch API with method POST
     * @param url Resource's URL relative to BASE_URL/${url}
     * @param data Payload as key value list (will be converted to FormData)
     */
    async postText(url, data) {
        let resp = await Stubegru.fetch.post(url, data);
        let parsedResp = await resp.text();
        return parsedResp;
    }
    /**
    * Fetch a resource as Text from Server using fetch API with method GET
    * @param url Resource's URL relative to BASE_URL/${url}
    * @param data Payload as key value list (will be converted to queryString)
    */
    async getText(url, data) {
        let resp = await Stubegru.fetch.get(url, data);
        let parsedResp = await resp.text();
        return parsedResp;
    }
    objectToFormData(o) {
        let formData = new FormData();
        for (const key in o) {
            const value = o[key];
            formData.append(key, value);
        }
        return formData;
    }
}
