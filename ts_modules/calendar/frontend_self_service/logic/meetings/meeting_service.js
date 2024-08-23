import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
export default class MeetingService {
    async getAdvisorList() {
        return await Stubegru.fetch.getJson("ts_modules/calendar/backend/meetings/get_advisors_self_service.php");
    }
    async get(meetingId) {
        let meetingList = await Stubegru.fetch.getJson("ts_modules/calendar/backend/meetings/get_meetings_self_service.php", { meetingId: meetingId });
        return meetingList[0];
    }
    async getAll() {
        return await Stubegru.fetch.getJson("ts_modules/calendar/backend/meetings/get_meetings_self_service.php");
    }
    async isBlock(meetingId) {
        // let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/meetings/is_meeting_block.php", { meetingId: meetingId }) as MeetingBlockResponse;
        // if (resp.status == "error") { throw new Error(resp.message) };
        // return resp;
        return { status: "success", blockId: "0" }; //TODO: block management
    }
    async setBlock(meetingId, blockMeeting) {
        // blockMeeting = blockMeeting ? 1 : 0;
        // let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/meetings/set_meeting_block.php", { meetingId: meetingId, blockMeeting: blockMeeting }) as StubegruHttpResponse;
        // if (resp.status == "error") { throw new Error(resp.message) };
        // return resp;
        return { status: "success" }; //TODO: block management
    }
}
