import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import UserUtils from "../../../../../components/user_utils/user_utils.js";
import CalendarModule from "../calendar_module.js";
export default class RoomView {
    init() {
        Stubegru.dom.querySelectorAll(".meeting-room-input").forEach(elem => Stubegru.dom.addEventListener(elem, "change", () => CalendarModule.meetingView.setUnsavedChanges(true)));
        this.initRoomEditButtons();
    }
    initRoomEditButtons() {
        Stubegru.dom.addEventListener("#meeting_detail_edit_room_button", "click", CalendarModule.roomController.showRoomFormForUpdate);
        Stubegru.dom.addEventListener("#meeting_detail_new_room_button", "click", CalendarModule.roomController.showRoomFormForCreate);
        Stubegru.dom.addEventListener("#calendar_cancel_room_button", "click", CalendarModule.roomController.cancelRoomEdit);
        Stubegru.dom.addEventListener("#calendar_delete_room_button", "click", CalendarModule.roomController.deleteRoom);
        Stubegru.dom.addEventListener("#meeting_detail_room_form", "submit", CalendarModule.roomController.saveRoom);
    }
    resetRoomForm() {
        let form = Stubegru.dom.querySelector("#meeting_detail_room_form");
        form.reset();
    }
    setRoomDropdown(roomList) {
        let ownId = UserUtils.currentUser.id;
        let selectHtml = "<option value=''>Bitte wählen...</option>";
        let postHtml;
        for (const room of roomList) {
            const optionString = `<option value='${room.id}'>${room.titel}</option>`;
            ownId == room.besitzer ? selectHtml += optionString : postHtml += optionString; //Add own entries at top
        }
        Stubegru.dom.querySelector("#meeting_detail_room").innerHTML = selectHtml + postHtml;
    }
    setRoomFormVisible(isVisible) {
        Stubegru.dom.slideToState("#meeting_room_form_container", isVisible);
    }
    setRoomData(roomData) {
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
        let roomData = {};
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
}
