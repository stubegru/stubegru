import { Modal } from "../../../components/bootstrap/v3/ts_wrapper.js";
import Stubegru from "../../../components/stubegru_core/logic/stubegru.js";
import { TableSortable } from "../../../components/table-sortable/ts_wrapper.js";
import UserUtils from "../../../components/user_utils/user_utils.js";
import { SpamFilter, SpamFilterListItem } from "./model.js";
import SpamFilterModule from "./module.js";

export default class SpamFilterView {

    table: TableSortable;
    modal: Modal;
    modalForm: HTMLFormElement = Stubegru.dom.querySelector("#spam_filter_modal_form") as HTMLFormElement;

    constructor() {

        this.modal = new Modal('#spam_filter_modal');
        //Reset monitoring form if the modal is closed
        this.modal.addEventListener("hide.bs.modal", this.resetModalForm);
        this.modal.addEventListener("hide.bs.modal", SpamFilterModule.controller.refreshSpamFilterList);


        let tableColumns = { 
            id: "Id",
            name: "Name",
            created: "Erstellt",
            reason: "Grund",
            type: "Art der Sperre",
            mail: "Mail",
            ip: "IP-Adresse",
            expires: "Ablaufdatum",
            actionButton: "",
        }
        let searchInput = Stubegru.dom.querySelectorAsInput("#spam_filter_filter_input");
        let searchInputClear = Stubegru.dom.querySelectorAsInput("#spam_filter_filter_clear_button");
        this.table = new TableSortable("#spam_filter_table", tableColumns, searchInput, searchInputClear, 10, this.registerListItemButtons);


        Stubegru.dom.addEventListener("#spam_filter_create_button", "click", SpamFilterModule.controller.showSpamFilterModalForCreate);

        this.updateInfoText();
        this.resetModalForm(); //reset once to load default values
    }

    async updateListView(spamFilterList: SpamFilter[]) {
        let tableDataList = [];

        for (let spamFilterId in spamFilterList) {
            let spamFilter = spamFilterList[spamFilterId] as SpamFilterListItem;
            let editBtn = `<button type="button" class="btn btn-primary btn-sm spam-filter-edit-btn" data-spam-filter-id="${spamFilter.id}" title="Bearbeiten">
                                <i class="fas fa-pencil-alt"></i> Bearbeiten
                           </button>`;
            let deleteBtn = `&nbsp;<button class="btn btn-danger btn-sm spam-filter-delete-btn" type="button" data-spam-filter-id="${spamFilter.id}" title="Löschen">
                                <i class="far fa-trash-alt"></i> Löschen
                             </button>`;
            spamFilter.actionButton = editBtn + deleteBtn;

            spamFilter.created = Stubegru.utils.formatDate(spamFilter.created, "DD.MM.YYYY");
            tableDataList.push(spamFilter);
        }

        this.table.update(tableDataList, "id"); //button events are registered by table's onUpdate function
        Stubegru.dom.querySelectorAsInput("#spam_filter_filter_input").value = "";


    }



    registerListItemButtons() {
        Stubegru.dom.querySelectorAll(".spam-filter-edit-btn").forEach(elem => {
            const spamfilterId = elem.getAttribute("data-spam-filter-id") as string;
            Stubegru.dom.addEventListener(elem, "click", () => SpamFilterModule.controller.showSpamFilterModalForUpdate(spamfilterId));
        });

        Stubegru.dom.querySelectorAll(".spam-filter-delete-btn").forEach(elem => {
            const spamfilterId = elem.getAttribute("data-spam-filter-id") as string;
            Stubegru.dom.addEventListener(elem, "click", () => SpamFilterModule.controller.handleSpamFilterDelete(spamfilterId));
        });
    }

    setModalSubmitEvent(callback: Function) {
        Stubegru.dom.removeEventListener(this.modalForm, "submit");
        Stubegru.dom.addEventListener(this.modalForm, "submit", (event) => {
            event.preventDefault();
            callback();
        });
    }


    /**
     * Sets form data 
     */
    setModalFormData(spamfilterData: SpamFilter) {
        Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_name").value = spamfilterData.name;
        Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_mail").value = spamfilterData.mail;
        Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_ip").value = spamfilterData.ip;
        Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_reason").value = spamfilterData.reason;
        Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_type").value = spamfilterData.type;
        Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_expires").value = spamfilterData.expires;
        Stubegru.dom.querySelector("#spam_filter_modal_form_created").innerHTML = Stubegru.utils.formatDate(spamfilterData.created, "DD.MM.YYYY hh:mm");

        this.showInitiator(spamfilterData);// Show initiator user-name, or other value
    }

    private async showInitiator(spamfilterData: SpamFilter) {
        if (!isNaN(Number(spamfilterData.initiator))) {
            let userList = await UserUtils.getAllUsers()
            const user = userList[spamfilterData.initiator];
            Stubegru.dom.querySelector("#spam_filter_modal_form_initiator").innerHTML = user ? user.name : "Unknown user";
        } else {
            Stubegru.dom.querySelector("#spam_filter_modal_form_initiator").innerHTML = spamfilterData.initiator;
        }
    }

    getModalFormData(): SpamFilter {
        let spamfilterData = {} as SpamFilter;
        spamfilterData.name = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_name").value;
        spamfilterData.mail = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_mail").value;
        spamfilterData.reason = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_reason").value;
        spamfilterData.type = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_type").value;
        spamfilterData.ip = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_ip").value;
        spamfilterData.expires = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_expires").value;
        return spamfilterData;
    }

    setFooterInfoVisibility(state: boolean) {
        Stubegru.dom.setVisibility("#spam_filter_modal_footer_info", state);
    }

    resetModalForm = () => {
        this.modalForm.reset();
        Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_created").innerHTML = Stubegru.utils.formatDate(new Date(), "DD.MM.YYYY");
    }

    updateInfoText(){
        const config = Stubegru.constants.CUSTOM_CONFIG;
        Stubegru.dom.querySelector("#spam_filter_info_text").innerHTML = `
        <i class="fas fa-info-circle"></i>
        Personen für die ein Spam Filter eingetragen ist können <b>keine Termine im Self-Service</b> buchen. Spam Filter können hier manuell erstellt, angepasst oder entfernt werden.<br>
        Bucht eine Person viele Termine in kurzer Zeit wird für sie automatisch ein Spam Filter erstellt:<br>
        - Mehr als ${config.selfServiceMaxMeetingsByIp} Buchungen von einer IP innerhalb von ${config.selfServiceMaxMeetingsByIpSeconds} Sekunden => ${config.selfServiceMaxMeetingsByIpExpireDays} Tage gesperrt.
        <br>
        - Mehr als ${config.selfServiceMaxMeetingsByMail} Buchungen von einer Mailadresse innerhalb von ${config.selfServiceMaxMeetingsByMailDays} Tagen => ${config.selfServiceMaxMeetingsByMailExpireDays} Tage gesperrt.
        `
    }


}