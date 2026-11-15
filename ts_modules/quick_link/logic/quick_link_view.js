import { Modal } from '../../../components/bootstrap/v3/ts_wrapper.js';
import Stubegru from '../../../components/stubegru_core/logic/stubegru.js';
import UserUtils from '../../../components/user_utils/user_utils.js';
import QuickLinkModule from "./quick_link_module.js";
export default class QuickLinkView {
    modal;
    form;
    async init() {
        this.modal = new Modal('#quick_link_modal');
        this.modal.addEventListener("hide.bs.modal", this.resetModalForm);
        Stubegru.dom.querySelector("#quick_link_create_button").addEventListener("click", QuickLinkModule.controller.showQuickLinkModalForCreate);
        this.form = Stubegru.dom.querySelector('#quick_link_modal_form');
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();
            QuickLinkModule.controller.handleCreateQuickLink();
        });
        this.resetModalForm();
    }
    resetModalForm() {
        this.form.reset();
    }
    setFormData(quickLink) {
        Stubegru.dom.querySelectorAsInput("#quick_link_id").value = quickLink.id;
        Stubegru.dom.querySelectorAsInput("#quick_link_text").value = quickLink.text;
        Stubegru.dom.querySelectorAsInput("#quick_link_link").value = quickLink.link;
    }
    getFormData() {
        return {
            id: Stubegru.dom.querySelectorAsInput('#quick_link_id').value,
            text: Stubegru.dom.querySelectorAsInput('#quick_link_text').value,
            link: Stubegru.dom.querySelectorAsInput('#quick_link_link').value,
        };
    }
    async renderListView(quickLinkList) {
        let html = "";
        for (let l of quickLinkList) {
            html += `
            <li>
                <a href="${l.link}">${l.text}</a>
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
