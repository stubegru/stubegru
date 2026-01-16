import { Modal } from "../../../components/bootstrap/v3/ts_wrapper.js";
import Stubegru from "../../../components/stubegru_core/logic/stubegru.js";
import { TableSortable } from "../../../components/table-sortable/ts_wrapper.js";
import UserUtils from "../../../components/user_utils/user_utils.js";
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
            created: "Erstellt",
            reason: "Grund",
            type: "Art der Sperre",
            mail: "Mail",
            ip: "IP-Adresse",
            expires: "Ablaufdatum",
            actionButton: "",
        };
        let searchInput = Stubegru.dom.querySelectorAsInput("#spam_filter_filter_input");
        let searchInputClear = Stubegru.dom.querySelectorAsInput("#spam_filter_filter_clear_button");
        this.table = new TableSortable("#spam_filter_table", tableColumns, searchInput, searchInputClear, 10, this.registerListItemButtons);
        Stubegru.dom.addEventListener("#spam_filter_create_button", "click", SpamFilterModule.controller.showSpamFilterModalForCreate);
        this.updateInfoText();
        this.resetModalForm(); //reset once to load default values
    }
    async updateListView(spamFilterList) {
        let tableDataList = [];
        for (let spamFilterId in spamFilterList) {
            let spamFilter = spamFilterList[spamFilterId];
            let editBtn = `<button type="button" class="btn btn-primary btn-sm spam-filter-edit-btn permission-SPAM_FILTER_WRITE permission-required" data-spam-filter-id="${spamFilter.id}" title="Bearbeiten">
                                <i class="fas fa-pencil-alt"></i> Bearbeiten
                           </button>`;
            let deleteBtn = `&nbsp;<button class="btn btn-danger btn-sm spam-filter-delete-btn permission-SPAM_FILTER_WRITE permission-required" type="button" data-spam-filter-id="${spamFilter.id}" title="Löschen">
                                <i class="far fa-trash-alt"></i> Löschen
                             </button>`;
            spamFilter.actionButton = editBtn + deleteBtn;
            spamFilter.created = Stubegru.utils.formatDate(spamFilter.created, "DD.MM.YYYY");
            spamFilter.expires = Stubegru.utils.formatDate(spamFilter.expires, "DD.MM.YYYY");
            spamFilter.type = `<div class="label label-primary">${spamFilter.type}</div>`;
            tableDataList.push(spamFilter);
        }
        this.table.update(tableDataList, "id"); //button events are registered by table's onUpdate function
        Stubegru.dom.querySelectorAsInput("#spam_filter_filter_input").value = "";
    }
    registerListItemButtons() {
        UserUtils.updateAdminElements();
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
        Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_ip").value = spamfilterData.ip;
        Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_reason").value = spamfilterData.reason;
        Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_type").value = spamfilterData.type;
        Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_expires").value = spamfilterData.expires;
        Stubegru.dom.querySelector("#spam_filter_modal_form_created").innerHTML = Stubegru.utils.formatDate(spamfilterData.created, "DD.MM.YYYY hh:mm");
        this.showInitiator(spamfilterData); // Show initiator user-name, or other value
    }
    async showInitiator(spamfilterData) {
        if (!isNaN(Number(spamfilterData.initiator))) {
            let userList = await UserUtils.getAllUsers();
            const user = userList[spamfilterData.initiator];
            Stubegru.dom.querySelector("#spam_filter_modal_form_initiator").innerHTML = user ? user.name : "Unknown user";
        }
        else {
            Stubegru.dom.querySelector("#spam_filter_modal_form_initiator").innerHTML = spamfilterData.initiator;
        }
    }
    getModalFormData() {
        let spamfilterData = {};
        spamfilterData.name = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_name").value;
        spamfilterData.mail = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_mail").value;
        spamfilterData.reason = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_reason").value;
        spamfilterData.type = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_type").value;
        spamfilterData.ip = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_ip").value;
        spamfilterData.expires = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_expires").value;
        return spamfilterData;
    }
    /**
     * Checks if the type-corresponding filter property (mail or ip) is set in the modal form
     */
    checkForRequiredFilterAttribute() {
        let type = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_type").value;
        let mail = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_mail").value;
        let ip = Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_ip").value;
        if (type == "mail") {
            if (mail == undefined || mail == "") {
                throw new Error("Um einen Spamfilter vom Typ 'mail' zu erstellen muss eine Mailadresse angegeben werden.");
            }
        }
        else {
            if (type == "ip") {
                if (ip == undefined || ip == "") {
                    throw new Error("Um einen Spamfilter vom Typ 'ip' zu erstellen muss eine Ip Adresse angegeben werden.");
                }
            }
            else {
                throw new Error("Spamfilter: Ungültiger Wert für Typ! Spamfilter muss vom Typ 'mail' oder 'ip' sein.");
            }
        }
    }
    setFooterInfoVisibility(state) {
        Stubegru.dom.setVisibility("#spam_filter_modal_footer_info", state);
    }
    resetModalForm = () => {
        this.modalForm.reset();
        Stubegru.dom.querySelectorAsInput("#spam_filter_modal_form_created").innerHTML = Stubegru.utils.formatDate(new Date(), "DD.MM.YYYY");
    };
    updateInfoText() {
        const config = Stubegru.constants.CUSTOM_CONFIG;
        Stubegru.dom.querySelector("#spam_filter_info_text").innerHTML = `
        <i class="fas fa-info-circle"></i>
        Personen für die ein Spam Filter eingetragen ist können <b>keine Termine im Self-Service</b> buchen. Spam Filter können hier manuell erstellt, angepasst oder entfernt werden.<br>
        Bucht eine Person viele Termine in kurzer Zeit, wird für sie automatisch ein Spam Filter erstellt:<br>
        - Mehr als <b>${config.selfServiceMaxMeetingsByIp} Buchungen von einer IP</b> innerhalb von <b>${config.selfServiceMaxMeetingsByIpSeconds} Sekunden</b> => <b>${config.selfServiceMaxMeetingsByIpExpireDays} Tage</b> gesperrt.
        <br>
        - Mehr als <b>${config.selfServiceMaxMeetingsByMail} Buchungen von einer Mailadresse</b> innerhalb von <b>${config.selfServiceMaxMeetingsByMailDays} Tagen</b> => <b>${config.selfServiceMaxMeetingsByMailExpireDays} Tage</b> gesperrt.
        `;
    }
}
