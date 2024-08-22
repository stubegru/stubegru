import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
export default class MeetingService {
    async get(meetingId) {
        let meetingList = await Stubegru.fetch.getJson("ts_modules/calendar/backend/meetings/get_meetings.php", { meetingId: meetingId });
        return meetingList[0];
    }
    async getAll() {
        return await Stubegru.fetch.getJson("ts_modules/calendar/backend/meetings/get_meetings.php");
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
