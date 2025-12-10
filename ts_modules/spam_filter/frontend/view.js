import { Modal } from "../../../components/bootstrap/v3/ts_wrapper.js";
import Stubegru from "../../../components/stubegru_core/logic/stubegru.js";
import { TableSortable } from "../../../components/table-sortable/ts_wrapper.js";
import SpamFilterModule from "./module.js";
export default class SpamFilterView {
    table;
    modal;
    modalForm = Stubegru.dom.querySelector("#spam_filter_modal_form");
    constructor() {
        this.modal = new Modal('#spam_filter_modal');
        //Reset monitoring form if the modal is closed
        this.modal.addEventListener("hide.bs.modal", this.resetModalForm);
        this.modal.addEventListener("hide.bs.modal", SpamFilterModule.controller.refreshSpamFilterList);
        let tableColumns = {
            id: "Id",
            name: "Name",
            mail: "Mail",
            timestamp: "Erstellt",
            reason: "Grund",
            type: "Art der Sperre",
            actionButton: "",
        };
        let searchInput = Stubegru.dom.querySelectorAsInput("#spam_filter_filter_input");
        let searchInputClear = Stubegru.dom.querySelectorAsInput("#spam_filter_filter_clear_button");
        this.table = new TableSortable("#spam_filter_table", tableColumns, searchInput, searchInputClear, 10, this.registerListItemButtons);
        Stubegru.dom.addEventListener("#spam_filter_create_button", "click", SpamFilterModule.controller.showSpamFilterModalForCreate);
    }
    async updateListView(spamFilterList) {
        let tableDataList = [];
        for (let spamFilterId in spamFilterList) {
            let spamFilter = spamFilterList[spamFilterId];
            let editBtn = `<button type="button" class="btn btn-primary btn-sm spam-filter-edit-btn" data-spam-filter-id="${spamFilter.id}" title="Bearbeiten">
                                <i class="fas fa-pencil-alt"></i>
                           </button>`;
            let deleteBtn = `&nbsp;<button class="btn btn-danger btn-sm spam-filter-delete-btn" type="button" data-spam-filter-id="${spamFilter.id}" title="Löschen">
                                <i class="far fa-trash-alt"></i>
                             </button>`;
            spamFilter.actionButton = editBtn + deleteBtn;
            spamFilter.timestamp = Stubegru.utils.formatDate(spamFilter.timestamp, "DD.MM.YYYY");
            tableDataList.push(spamFilter);
        }
        this.table.update(tableDataList, "id"); //button events are registered by table's onUpdate function
        Stubegru.dom.querySelectorAsInput("#spam_filter_filter_input").value = "";
    }
    registerListItemButtons() {
        Stubegru.dom.querySelectorAll(".spam-filter-edit-btn").forEach(elem => {
            const spamfilterId = elem.getAttribute("data-spam-filter-id");
            Stubegru.dom.addEventListener(elem, "click", () => SpamFilterModule.controller.showSpamFilterModalForUpdate(spamfilterId));
        });
        Stubegru.dom.querySelectorAll(".spam-filter-delete-btn").forEach(elem => {
            const spamfilterId = elem.getAttribute("data-spam-filter-id");
            Stubegru.dom.addEventListener(elem, "click", () => SpamFilterModule.controller.handleSpamFilterDelete(spamfilterId));
        });
    }
    setModalSubmitEvent(callback) {
        Stubegru.dom.removeEventListener(this.modalForm, "submit");
        Stubegru.dom.addEventListener(this.modalForm, "submit", (event) => {
            event.preventDefault();
            callback();
        });
    }
    /**
     * Sets form data
     */
    setModalFormData(spamfilterData) {
        Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_name").value = spamfilterData.name;
        Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_mail").value = spamfilterData.mail;
        Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_reason").value = spamfilterData.reason;
        Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_type").value = spamfilterData.type;
        Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_created").value = Stubegru.utils.formatDate(spamfilterData.timestamp, "DD.MM.YYYY hh:mm");
    }
    getModalFormData() {
        let spamfilterData = {};
        spamfilterData.name = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_name").value;
        spamfilterData.mail = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_mail").value;
        spamfilterData.reason = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_reason").value;
        spamfilterData.type = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_type").value;
        return spamfilterData;
    }
    resetModalForm = () => {
        this.modalForm.reset();
    };
}
