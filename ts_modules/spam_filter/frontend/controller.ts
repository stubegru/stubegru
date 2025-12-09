import { SwuAlert } from "swu-core";
import SpamFilterModule from "./module";

export default class SpamFilterController {



    async init() {
        await this.refreshSpamFilterList();
    }

    async refreshSpamFilterList() {
        try {
            let spamfilterList = await SpamFilterModule.service.getAllSpamFilter();
            SpamFilterModule.view.updateListView(spamfilterList);
        } catch (error) {
            SwuAlert.alertError(error);
        }
    }


    async handleSpamFilterEdit(spamfilterId: string) {
        try {
            let spamfilterData = SpamFilterModule.view.getModalFormData();
            spamfilterData.id = spamfilterId;
            const resp = await SpamFilterModule.service.updateSpamFilter(spamfilterData);
            SwuAlert.alertResp(resp, "Saving SpamFilter");
            SpamFilterModule.view.modal.hide(); //refresh spamfilter list via hide event
        } catch (error) {
            SwuAlert.alertError(error);
        }

    }

    async handleSpamFilterCreate() {
        try {
            let spamfilterData = SpamFilterModule.view.getModalFormData();
            const resp = await SpamFilterModule.service.createSpamFilter(spamfilterData);
            SwuAlert.alertResp(resp, "Create SpamFilter");
            SpamFilterModule.view.modal.hide(); //refresh spamfilter list via hide event
        } catch (error) {
            SwuAlert.alertError(error);
        }

    }

    async handleSpamFilterDelete(spamfilterId: string) {
        try {
            let confirmResp = await SwuAlert.deleteConfirm("Delete SpamFilter", "Do you really want to delete this SpamFilter?");
            let resp = await SpamFilterModule.service.deleteSpamFilter(spamfilterId);
            SwuAlert.alertResp(resp, "Delete SpamFilter");
            await this.refreshSpamFilterList();
        } catch (error) {
            SwuAlert.alertError(error);
        }
    }

    async showSpamFilterModalForUpdate(spamfilterId: string) {
        try {
            const spamfilterData = await SpamFilterModule.service.getSpamFilter(spamfilterId);
            SpamFilterModule.view.setModalFormData(spamfilterData);
            SpamFilterModule.view.setModalSubmitEvent(() => {
                SpamFilterModule.controller.handleSpamFilterEdit(spamfilterId);
            });
            SpamFilterModule.view.modal.show();
        } catch (error) {
            SwuAlert.alertError(error);
        }
    }

    async showSpamFilterModalForCreate() {
        try {
            SpamFilterModule.view.setModalSubmitEvent(() => {
                SpamFilterModule.controller.handleSpamFilterCreate();
            });
            SpamFilterModule.view.modal.show();
        } catch (error) {
            SwuAlert.alertError(error);
        }
    }


}




