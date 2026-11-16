import { Modal } from '../../../components/bootstrap/v3/ts_wrapper.js';
import Stubegru from '../../../components/stubegru_core/logic/stubegru.js';
import UserUtils from '../../../components/user_utils/user_utils.js';
import QuickLinkModule, { QuickLinkObject } from "./quick_link_module.js";



export default class QuickLinkView {
    modal: Modal;
    form: HTMLFormElement;

    constructor() {

        this.modal = new Modal('#quick_link_modal');
        this.modal.addEventListener("hide.bs.modal", this.resetModalForm);

        Stubegru.dom.querySelector("#quick_link_create_button").addEventListener("click", QuickLinkModule.controller.showQuickLinkModalForCreate);

        this.form = Stubegru.dom.querySelector('#quick_link_modal_form') as HTMLFormElement;
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();
            const quickLinkId = Stubegru.dom.querySelectorAsInput("#quick_link_modal_form_id").value;
            if (quickLinkId == "new") {
                QuickLinkModule.controller.handleCreateQuickLink();
            }
            else {
                QuickLinkModule.controller.handleUpdateQuickLink();
            }
        });

        this.resetModalForm();
    }


    resetModalForm = () => {
        this.form.reset();
    }


    setFormData(quickLink: QuickLinkObject) {
        Stubegru.dom.querySelectorAsInput("#quick_link_modal_form_id").value = quickLink.id;
        Stubegru.dom.querySelectorAsInput("#quick_link_modal_form_title").value = quickLink.title;
        Stubegru.dom.querySelectorAsInput("#quick_link_modal_form_url").value = quickLink.url;
    }

    getFormData(): QuickLinkObject {
        return {
            id: Stubegru.dom.querySelectorAsInput('#quick_link_modal_form_id').value,
            title: Stubegru.dom.querySelectorAsInput('#quick_link_modal_form_title').value,
            url: Stubegru.dom.querySelectorAsInput('#quick_link_modal_form_url').value,
        }
    }

    async renderListView(quickLinkList: QuickLinkObject[]) {

        let html = "";

        for (let l of quickLinkList) {
            html += `
            <li>
                <a href="${l.url}">${l.title}</a>
            </<li>`;
        }

        Stubegru.dom.querySelector("#quick_link_container").innerHTML = html;
        UserUtils.updateAdminElements();
        this.registerButtonEvents();
    }

    registerButtonEvents() {
        Stubegru.dom.querySelectorAll(".quick-link-delete-button").forEach(elem => {
            const quickLinkId = elem.getAttribute("data-quick-link-id");
            elem.addEventListener("click", () => QuickLinkModule.controller.handleDeleteQuickLink(quickLinkId));
        });
        Stubegru.dom.querySelectorAll(".quick-link-edit-button").forEach(elem => {
            const quickLinkId = elem.getAttribute("data-quick-link-id");
            elem.addEventListener("click", () => QuickLinkModule.controller.showQuickLinkModalForUpdate(quickLinkId));
        });
    }


}