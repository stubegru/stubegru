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
                <tr class="quick-link-row text-primary" data-quick-link-url="${l.url}" style="cursor: pointer;">
                    <td style="font-size: 1.15em; vertical-align: middle;">
                        <i class="fas fa-arrow-right"></i>&nbsp; ${l.title}
                    </td>
                    <td>
                            <button class="btn btn-default quick-link-edit-button permission-QUICK_LINK_WRITE permission-required" data-quick-link-id="${l.id}">
                                <i class="fas fa-pencil-alt"></i>&nbsp; Bearbeiten
                            </button>
                    </td>
                    <td>
                            <button class="btn btn-danger quick-link-delete-button permission-QUICK_LINK_WRITE permission-required" data-quick-link-id="${l.id}">
                                <i class="fas fa-times"></i>&nbsp; Löschen
                            </button>
                    </td>
                </tr>
            `;
        }

        Stubegru.dom.querySelector("#quick_link_container").innerHTML = `
            <table class="table table-condensed table-hover" style="margin-bottom: 0;">
                <tbody>
                    ${html}
                </tbody>
            </table>
        `;
        UserUtils.updateAdminElements();
        this.registerButtonEvents();
    }

    registerButtonEvents() {
        Stubegru.dom.querySelectorAll(".quick-link-delete-button").forEach(elem => {
            const quickLinkId = elem.getAttribute("data-quick-link-id");
            elem.addEventListener("click", (event) => {
                event.stopPropagation();
                QuickLinkModule.controller.handleDeleteQuickLink(quickLinkId);
            });
        });
        Stubegru.dom.querySelectorAll(".quick-link-edit-button").forEach(elem => {
            const quickLinkId = elem.getAttribute("data-quick-link-id");
            elem.addEventListener("click", (event) => {
                event.stopPropagation();
                QuickLinkModule.controller.showQuickLinkModalForUpdate(quickLinkId);
            });
        });
        Stubegru.dom.querySelectorAll(".quick-link-row").forEach(elem => {
            const quickLinkUrl = elem.getAttribute("data-quick-link-url");
            elem.addEventListener("click", (event) => { window.open(quickLinkUrl, "_blank") });
        });
    }


}