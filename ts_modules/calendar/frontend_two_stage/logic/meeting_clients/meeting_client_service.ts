import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import { StubegruHttpResponse } from "../../../../../components/stubegru_core/logic/stubegru_fetch.js";

export default class MeetingClientService {
    async deleteClient(meetingId: string) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/assignment/cancel_meeting_assignment.php", { meetingId: meetingId }) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async assignClient(clientData: MeetingClient) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/assignment/create_meeting_assignment.php", clientData) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

}



export interface MeetingClient {
    id: string;
    name: string;
    gender: string | null;
    mail: string;
    phone: string;
    channel: string;
    formular: string;
    description: string;
    dateId: string;
}