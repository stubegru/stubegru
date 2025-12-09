import { SwuDom, SwuTable } from "swu-core";
import { SpamFilter } from "../../model/SpamFilter/model";
import SpamFilterModule from "./module";
import Modal from "bootstrap/js/dist/modal.js";

export default class SpamFilterView {

    dataTable: SwuTable;
    modalElem: HTMLElement;
    modal: Modal;
    modalForm: HTMLFormElement = SwuDom.querySelector("#swu_spamfilter_modal_form") as HTMLFormElement;

    constructor() {

        this.modalElem = SwuDom.querySelector('#swu_spamfilter_modal');
        this.modal = new Modal(this.modalElem);
        //Reset monitoring form if the modal is closed
        this.modalElem.addEventListener("hide.bs.modal", this.resetModalForm);
        this.modalElem.addEventListener("hide.bs.modal", SpamFilterModule.controller.refreshSpamFilterList);


        let tableColumns = [
            { title: "", field: "swuTableActionButtons", formatter: "html", headerSort: false, headerFilter: false },
            { title: "Id", field: "id", formatter: "html", sorter: "number", headerFilter: "input" },
                { title: "name", field: "name", headerFilter:"input"},
    { title: "mail", field: "mail", headerFilter:"input"},
    { title: "timestamp", field: "timestamp", headerFilter:"input"},
    { title: "reason", field: "reason", headerFilter:"input"},
    { title: "type", field: "type", headerFilter:"input"},

        ]
        this.dataTable = new SwuTable("#swu_spamfilter_table", tableColumns);

        SwuDom.addEventListener("#swu_spamfilter_create_button", "click", SpamFilterModule.controller.showSpamFilterModalForCreate);

    }




    async updateListView(spamfilterList: SpamFilter[]) {
        interface spamfilterTableDataset extends SpamFilter { swuTableActionButtons: string };
        let tableDataList: spamfilterTableDataset[] = [];

        for (let spamfilterId in spamfilterList) {
            let spamfilter = spamfilterList[spamfilterId] as spamfilterTableDataset;
            let editBtn = `<button type="button" class="btn btn-primary btn-sm swu-spamfilter-edit-btn" data-swu-spamfilter-id="${spamfilter.id}">
                                <i class="fas fa-pencil-alt"></i>&nbsp; Edit
                           </button>`;
            let deleteBtn = `&nbsp;<button class="btn btn-danger btn-sm swu-spamfilter-delete-btn" type="button" data-swu-spamfilter-id="${spamfilter.id}">
                                <i class="far fa-trash-alt"></i> Delete
                             </button>`;
            spamfilter.swuTableActionButtons = editBtn + deleteBtn;
            tableDataList.push(spamfilter);
        }

        this.dataTable.update(tableDataList);
        this.registerListItemButtons();
    }

    registerListItemButtons() {
        SwuDom.querySelectorAll(".swu-spamfilter-edit-btn").forEach(elem => {
            const spamfilterId = elem.getAttribute("data-swu-spamfilter-id") as string;
            SwuDom.addEventListener(elem, "click", () => SpamFilterModule.controller.showSpamFilterModalForUpdate(spamfilterId));
        });

        SwuDom.querySelectorAll(".swu-spamfilter-delete-btn").forEach(elem => {
            const spamfilterId = elem.getAttribute("data-swu-spamfilter-id") as string;
            SwuDom.addEventListener(elem, "click", () => SpamFilterModule.controller.handleSpamFilterDelete(spamfilterId));
        });
    }

    setModalSubmitEvent(callback: Function) {
        SwuDom.removeEventListener(this.modalForm, "submit");
        SwuDom.addEventListener(this.modalForm, "submit", (event) => {
            event.preventDefault();
            callback();
        });
    }


    /**
     * Sets form data 
     */
    setModalFormData(spamfilterData: SpamFilter) {
            SwuDom.querySelectorAsInput("#swu_spamfilter_modal_form_name").value = spamfilterData.name;
    SwuDom.querySelectorAsInput("#swu_spamfilter_modal_form_mail").value = spamfilterData.mail;
    SwuDom.querySelectorAsInput("#swu_spamfilter_modal_form_timestamp").value = spamfilterData.timestamp;
    SwuDom.querySelectorAsInput("#swu_spamfilter_modal_form_reason").value = spamfilterData.reason;
    SwuDom.querySelectorAsInput("#swu_spamfilter_modal_form_type").value = spamfilterData.type;

    }

    getModalFormData(): SpamFilter {
        let spamfilterData = {} as SpamFilter;
            spamfilterData.name = SwuDom.querySelectorAsInput("#swu_spamfilter_modal_form_name").value;
    spamfilterData.mail = SwuDom.querySelectorAsInput("#swu_spamfilter_modal_form_mail").value;
    spamfilterData.timestamp = SwuDom.querySelectorAsInput("#swu_spamfilter_modal_form_timestamp").value;
    spamfilterData.reason = SwuDom.querySelectorAsInput("#swu_spamfilter_modal_form_reason").value;
    spamfilterData.type = SwuDom.querySelectorAsInput("#swu_spamfilter_modal_form_type").value;

        return spamfilterData;
    }

    resetModalForm = () => {
        this.modalForm.reset();
    }


}