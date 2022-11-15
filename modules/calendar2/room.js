class Room {

    static roomList = [];


    static async fetchRooms() {
        let resp = await fetch(`${stubegru.constants.BASE_URL}/modules/calendar/rooms/get_rooms.php`);
        let data = await resp.json();
        Room.roomList = data;
    }

    constructor(roomData) {
        this.id = roomData.id;
        this.kanal = roomData.kanal;
        this.titel = roomData.titel;
        this.raumnummer = roomData.raumnummer;
        this.etage = roomData.etage;
        this.strasse = roomData.strasse;
        this.hausnummer = roomData.hausnummer;
        this.plz = roomData.plz;
        this.ort = roomData.ort;
        this.link = roomData.link;
        this.passwort = roomData.passwort;
        this.telefon = roomData.telefon;
    }


    updateOnServer() {
        let formData = new FormData();

        formData.append("id", this.id);
        formData.append("kanal", this.kanal);
        formData.append("titel", this.titel);
        formData.append("raumnummer", this.raumnummer);
        formData.append("etage", this.etage);
        formData.append("strasse", this.strasse);
        formData.append("hausnummer", this.hausnummer);
        formData.append("plz", this.plz);
        formData.append("ort", this.ort);
        formData.append("link", this.link);
        formData.append("passwort", this.passwort);
        formData.append("telefon", this.telefon);

        const url = `${stubegru.constants.BASE_URL}/modules/calendar/rooms/save_room.php`;
        let roomResp = await fetch(url, {
            method: 'POST',
            body: formData
        });
        roomResp = await roomResp.json();
        return roomResp;
    }

    async deleteOnServer() {
        let formData = new FormData();
        formData.append("id", this.id);

        const url = `${stubegru.constants.BASE_URL}/modules/calendar/rooms/delete_room.php`;
        let roomResp = await fetch(url, {
            method: 'POST',
            body: formData
        });
        roomResp = await roomResp.json();
        return roomResp;
    }

    if(mode == "modify") {
    //Bestehenden Raum überarbeiten
    let raumId = $("#calendarRoom").val(); //Id des zu Raumes aus dem select auslesen
    if (raumId == null || raumId == "") {
        stubegru.modules.alerts.alert({
            title: "Raum bearbeiten:",
            text: "Bitte erst einen Raum auswählen",
            type: "warning",
            mode: "toast"
        });
        return;
    }

    $.ajax({
        type: "POST",
        url: `${stubegru.constants.BASE_URL}/modules/calendar/rooms/get_room_data.php`,
        data: { id: raumId },
        dataType: "json",
        success: function (resp) {



        }

//room saved
        if(resp.status == "success") {
        stubegru.modules.alerts.alert({
            title: "Raum gespeichert!",
            text: resp.message,
            type: "success"
        });
        await getRooms(); //Reload room to select
        $("#calendarRoom option[id='roomSelectOption" + resp.roomId + "']").attr("selected", "selected"); //Gespeicherter Raum wird ausgewählt
        resetRoomForm();
    }
        else {
        stubegru.modules.alerts.alert({
            title: "Fehler",
            text: resp.message,
            type: "error"
        });
    }