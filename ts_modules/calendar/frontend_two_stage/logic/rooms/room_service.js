import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
export default class RoomService {
    async delete(roomId) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/rooms/delete_room.php", { id: roomId });
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async getAll() {
        return await Stubegru.fetch.getJson("ts_modules/calendar/backend/rooms/get_rooms.php");
    }
    async update(data) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/rooms/save_room.php", data);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async create(data) {
        data.id = "new";
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/rooms/save_room.php", data);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
}
