import Alert from "../../../../../components/alert/alert.js";
import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import CalendarModule from "../calendar_module.js";
export default class RoomController {
    roomList;
    async init() {
        await this.refreshRoomDropdown();
    }
    getRoom(roomId) {
        return this.roomList.find(elem => (elem.id == roomId));
    }
    async refreshRoomList() {
        try {
            let list = await CalendarModule.roomService.getAll();
            this.roomList = list;
            return list;
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async refreshRoomDropdown() {
        try {
            let list = await this.refreshRoomList();
            await CalendarModule.roomView.setRoomDropdown(list);
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async showRoomFormForUpdate() {
        try {
            const roomId = Stubegru.dom.querySelectorAsInput("#meeting_detail_room").value;
            if (roomId == null || roomId == "") {
                Alert.alert({
                    title: "Raum bearbeiten:",
                    text: "Bitte erst einen Raum auswählen",
                    type: "warning",
                    mode: "toast"
                });
                return;
            }
            const room = CalendarModule.roomController.getRoom(roomId);
            CalendarModule.roomView.setRoomData(room);
            CalendarModule.roomView.setRoomFormVisible(true);
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async showRoomFormForCreate() {
        try {
            CalendarModule.roomView.resetRoomForm();
            Stubegru.dom.querySelectorAsInput("#raum_id").value = "new";
            CalendarModule.roomView.setRoomFormVisible(true);
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async saveRoom(event) {
        try {
            event.preventDefault();
            let roomId = Stubegru.dom.querySelectorAsInput("#raum_id").value;
            const roomData = CalendarModule.roomView.getRoomData();
            let resp;
            if (roomId == "new") {
                //create new Room
                const roomResp = await CalendarModule.roomService.create(roomData);
                roomId = roomResp.roomId;
                resp = roomResp;
            }
            else {
                //update existing Room
                resp = await CalendarModule.roomService.update(roomData);
            }
            Alert.alertResp(resp, "Raum Speichern");
            if (resp.status != "success") {
                return;
            }
            //Refresh room list
            await CalendarModule.roomController.refreshRoomDropdown();
            CalendarModule.roomView.resetRoomForm();
            CalendarModule.roomView.setRoomFormVisible(false);
            //auto-select previously edited/created room
            Stubegru.dom.querySelectorAsInput("#meeting_detail_room").value = roomId;
            Stubegru.dom.querySelector("#meeting_detail_room").dispatchEvent(new Event("change"));
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async cancelRoomEdit() {
        try {
            CalendarModule.roomView.resetRoomForm();
            CalendarModule.roomView.setRoomFormVisible(false);
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
    async deleteRoom() {
        try {
            let confirmResp = await Alert.deleteConfirm("Raum löschen", "Soll dieser Raum wirklich gelöscht werden?");
            if (confirmResp.isConfirmed) {
                let roomId = Stubegru.dom.querySelectorAsInput("#raum_id").value;
                if (roomId != "new") {
                    let resp = await CalendarModule.roomService.delete(roomId);
                    Alert.alertResp(resp, "Raum Löschen");
                    if (resp.status != "success") {
                        return;
                    }
                    await CalendarModule.roomController.refreshRoomDropdown();
                }
                CalendarModule.roomView.resetRoomForm();
                CalendarModule.roomView.setRoomFormVisible(false);
            }
        }
        catch (error) {
            Alert.alertError(error);
        }
    }
}
