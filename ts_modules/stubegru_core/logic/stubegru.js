import StubegruDom from "./stubegru_dom.js";
import StubegruFetch from "./stubegru_fetch.js";
import StubegruUtils from "./stubegru_utils.js";
export default class Stubegru {
    static dom;
    static utils;
    static fetch;
    static constants;
    static async init() {
        Stubegru.dom = new StubegruDom();
        Stubegru.utils = new StubegruUtils();
        Stubegru.fetch = new StubegruFetch();
        Stubegru.constants = await Stubegru.utils.fetchConstants();
    }
}
await Stubegru.init();
