import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import { StubegruHttpResponse } from "../../../../../components/stubegru_core/logic/stubegru_fetch.js";
import { MeetingClient } from "../meeting_clients/meeting_client_service.js";

export default class MeetingService {

    async get(meetingId: string) {
        return await Stubegru.fetch.getJson("ts_modules/calendar/backend/meetings/get_meetings.php", { meetingId: meetingId }) as Meeting;
    }

    async getAll() {
        return await Stubegru.fetch.getJson("ts_modules/calendar/backend/meetings/get_meetings.php") as Meeting[];
    }

    async create(data: Meeting) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/meetings/create_meeting.php", data) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async update(meetingId: string, data: Meeting) {
        data.id = meetingId;
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/meetings/update_meeting.php", data) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async delete(meetingId: string) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/meetings/delete_meeting.php", { id: meetingId }) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async isBlock(meetingId: string) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/meetings/is_meeting_block.php", { meetingId: meetingId }) as MeetingBlockResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async setBlock(meetingId: string, blockMeeting: boolean | number) {
        blockMeeting = blockMeeting ? 1 : 0;
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/meetings/set_meeting_block.php", { meetingId: meetingId, blockMeeting: blockMeeting }) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
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
