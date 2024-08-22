import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import { StubegruHttpResponse } from "../../../../../components/stubegru_core/logic/stubegru_fetch.js";
import { MeetingClient } from "../meeting_clients/meeting_client_service.js";

export default class MeetingService {

    async get(meetingId: string) {
        let meetingList = await Stubegru.fetch.getJson("ts_modules/calendar/backend/meetings/get_meetings_self_service.php", { meetingId: meetingId }) as Meeting[];
        return meetingList[0];
    }

    async getAll() {
        return await Stubegru.fetch.getJson("ts_modules/calendar/backend/meetings/get_meetings_self_service.php") as Meeting[];
    }

    async isBlock(meetingId: string) {
        // let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/meetings/is_meeting_block.php", { meetingId: meetingId }) as MeetingBlockResponse;
        // if (resp.status == "error") { throw new Error(resp.message) };
        // return resp;
        return { status : "success", blockId : "0"} //TODO: block management
    }

    async setBlock(meetingId: string, blockMeeting: boolean | number) {
        // blockMeeting = blockMeeting ? 1 : 0;
        // let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/meetings/set_meeting_block.php", { meetingId: meetingId, blockMeeting: blockMeeting }) as StubegruHttpResponse;
        // if (resp.status == "error") { throw new Error(resp.message) };
        // return resp;
        return { status : "success"} //TODO: block management
    }
}

export interface MeetingBlockResponse extends StubegruHttpResponse {
    blockId: string;
    blockName: string;
}

export interface Meeting {
    id: string;
    date: string;
    owner: string;
    ownerId: string;
    free: string;
    room: string;
    erfassungsdatum: string;
    start: string;
    end: string;
    title: string;
    channel: string;
    template: string;
    blocked: string;
    teilnehmer?: MeetingClient;
}
