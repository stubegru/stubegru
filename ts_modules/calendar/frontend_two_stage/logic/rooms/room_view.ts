import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import UserUtils from "../../../../../components/user_utils/user_utils.js";
import CalendarModule from "../calendar_module.js";
import { Room } from "./room_service.js";

export default class RoomView {

    init() {
        this.initAdvisorDropdown();
        Stubegru.dom.querySelectorAll(".meeting-room-input").forEach(elem => elem.addEventListener("change", () => CalendarModule.meetingView.setUnsavedChanges(true)));
        this.initRoomEditButtons();
    }

    private initRoomEditButtons() {
        Stubegru.dom.querySelector("#calendarEditRoomButton").addEventListener("click", CalendarModule.roomController.showRoomFormForUpdate);
        Stubegru.dom.querySelector("#calendarNewRoomButton").addEventListener("click", CalendarModule.roomController.showRoomFormForCreate);
        Stubegru.dom.querySelector("#calendarRoomForm").addEventListener("submit", CalendarModule.roomController.saveRoom);
        Stubegru.dom.querySelector("#calendarCancelRoomButton").addEventListener("click", CalendarModule.roomController.cancelRoomEdit);
        Stubegru.dom.querySelector("#calendarDeleteRoomButton").addEventListener("click", CalendarModule.roomController.deleteRoom);
    }

    resetRoomForm() {
        let form = Stubegru.dom.querySelector("#calendarRoomForm") as HTMLFormElement;
        form.reset();
    }

    setRoomDropdown(roomList: Room[]) {
        let ownId = UserUtils.currentUser.id;

        let selectHtml = "<option value=''>Bitte wählen...</option>";
        let postHtml;
        for (const room of roomList) {
            const optionString = `<option value='${room.id}'>${room.titel}</option>`
            ownId == room.besitzer ? selectHtml += optionString : postHtml += optionString; //Add own entries at top
        }
        Stubegru.dom.querySelector("#calendarRoom").innerHTML = selectHtml + postHtml;
    }

    setRoomFormVisible(isVisible: boolean) {
        Stubegru.dom.slideToState("#newroom", isVisible);
    }

    setRoomData(roomData: Room) {
        Stubegru.dom.querySelectorAsInput("#raum_id").value = roomData.id;
        Stubegru.dom.querySelectorAsInput("#raum_kanal").value = roomData.kanal;
        Stubegru.dom.querySelectorAsInput("#raum_titel").value = roomData.titel;
        Stubegru.dom.querySelectorAsInput("#raum_nr").value = roomData.raumnummer;
        Stubegru.dom.querySelectorAsInput("#raum_etage").value = roomData.etage;
        Stubegru.dom.querySelectorAsInput("#raum_strasse").value = roomData.strasse;
        Stubegru.dom.querySelectorAsInput("#raum_hausnr").value = roomData.hausnummer;
        Stubegru.dom.querySelectorAsInput("#raum_plz").value = roomData.plz;
        Stubegru.dom.querySelectorAsInput("#raum_ort").value = roomData.ort;
        Stubegru.dom.querySelectorAsInput("#raum_link").value = roomData.link;
        Stubegru.dom.querySelectorAsInput("#raum_passwort").value = roomData.passwort;
        Stubegru.dom.querySelectorAsInput("#raum_telefon").value = roomData.telefon;
    }

    getRoomData() {
        let roomData = {} as Room;
        roomData.id = Stubegru.dom.querySelectorAsInput("#raum_id").value;
        roomData.kanal = Stubegru.dom.querySelectorAsInput("#raum_kanal").value;
        roomData.titel = Stubegru.dom.querySelectorAsInput("#raum_titel").value;
        roomData.raumnummer = Stubegru.dom.querySelectorAsInput("#raum_nr").value;
        roomData.etage = Stubegru.dom.querySelectorAsInput("#raum_etage").value;
        roomData.strasse = Stubegru.dom.querySelectorAsInput("#raum_strasse").value;
        roomData.hausnummer = Stubegru.dom.querySelectorAsInput("#raum_hausnr").value;
        roomData.plz = Stubegru.dom.querySelectorAsInput("#raum_plz").value;
        roomData.ort = Stubegru.dom.querySelectorAsInput("#raum_ort").value;
        roomData.link = Stubegru.dom.querySelectorAsInput("#raum_link").value;
        roomData.passwort = Stubegru.dom.querySelectorAsInput("#raum_passwort").value;
        roomData.telefon = Stubegru.dom.querySelectorAsInput("#raum_telefon").value;
        return roomData;
    }

    async initAdvisorDropdown() {
        let ownId = UserUtils.currentUser.id;
        let userList = await UserUtils.getUserListByPermission("MEETING_ADVISOR");
        let selectHtml = "";
        for (const user of userList) {
            if (ownId == user.id) { //Add own entry at top (default)
                selectHtml = `<option value="${user.id}">${user.name}</option>` + selectHtml;
            } else {
                selectHtml += `<option value="${user.id}">${user.name}</option>`;
            }
        }
        Stubegru.dom.querySelector("#calendarOwner").innerHTML = selectHtml;

    }
}