import StubegruDom from "./stubegru_dom.js";
import StubegruFetch from "./stubegru_fetch.js";
import { StubegruConstants } from "./stubegru_interfaces.js";
import StubegruUtils from "./stubegru_utils.js";

export default class Stubegru{
    static dom:StubegruDom;
    static utils:StubegruUtils;
    static fetch:StubegruFetch;
    static constants: StubegruConstants;

    static async init(){
        Stubegru.dom = new StubegruDom();
        Stubegru.utils = new StubegruUtils();
        Stubegru.fetch = new StubegruFetch();

        Stubegru.constants = await  Stubegru.utils.fetchConstants();

        Stubegru.dom.loadCss("components/stubegru_core/stubegru.css");
        Stubegru.dom.loadCss("components/stubegru_core/stubegru_backwards_compatible.css");
    }
}

await Stubegru.init();