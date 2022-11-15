class Room {

    static roomList = [];


    static async fetchRooms() {
        Room.roomList = [];
        let resp = await fetch(`${stubegru.constants.BASE_URL}/modules/calendar/rooms/get_rooms.php`);
        let data = await resp.json();

        for (const roomData of data) {
            let r = new Room(roomData);
            Room.roomList.push(r);
        }
    }

    static getById(roomId) {
        return Room.roomList.find(e => e.id == roomId);
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


    async updateOnServer() {
        let formData = this.toFormData();

        const url = `${stubegru.constants.BASE_URL}/modules/calendar/rooms/save_room.php`;
        let roomResp = await fetch(url, {
            method: 'POST',
            body: formData
        });
        roomResp = await roomResp.json();
        return roomResp;
    }

    static async createOnServer(roomData) {
        roomData.id = "new";
        let m = new Room(roomData);
        let formData = m.toFormData();

        const url = `${stubegru.constants.BASE_URL}/modules/calendar/rooms/save_room.php`;
        let resp = await fetch(url, {
            method: 'POST',
            body: formData
        });
        resp = await resp.json();
        return resp;
    }



    toFormData() {
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
        return formData;
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
}