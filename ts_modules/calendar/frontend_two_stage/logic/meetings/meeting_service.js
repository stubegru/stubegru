import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
export default class MeetingService {
    async get(meetingId) {
        return await Stubegru.fetch.getJson("ts_modules/calendar/backend/meetings/get_meetings.php", { meetingId: meetingId });
    }
    async getAll() {
        return await Stubegru.fetch.getJson("ts_modules/calendar/backend/meetings/get_meetings.php");
    }
    async create(data) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/meetings/create_meeting.php", data);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async update(data) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/meetings/update_meeting.php", data);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async delete(meetingId) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/meetings/delete_meeting.php", { id: meetingId });
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async isBlock(meetingId) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/meetings/is_meeting_block.php", { meetingId: meetingId });
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async setBlock(meetingId, blockMeeting) {
        blockMeeting = blockMeeting ? 1 : 0;
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/meetings/set_meeting_block.php", { meetingId: meetingId, blockMeeting: blockMeeting });
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
}
