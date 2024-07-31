import Stubegru from "../../../../components/stubegru_core/logic/stubegru.js";
import { StubegruHttpResponse } from "../../../../components/stubegru_core/logic/stubegru_fetch.js";

export default class RoomService {

    async delete(roomId) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/rooms/delete_room.php", { id: roomId }) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async getAll() {
        return await Stubegru.fetch.getJson("ts_modules/calendar/backend/rooms/get_rooms.php") as Room[];
    }

    async update(data: Room) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/rooms/save_room.php", data) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async create(data: Room) {
        data.id = "new";
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/rooms/save_room.php", data) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }
}

export interface Room {
    id: string;
    kanal: string;
    titel: string;
    besitzer: string;
    raumnummer: string;
    strasse: string;
    hausnummer: string;
    plz: string;
    ort: string;
    etage: string;
    link: string;
    passwort: string;
    telefon: string;
    aktiv: number; // 0/1 for false/true
}
