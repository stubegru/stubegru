import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
import { StubegruHttpResponse } from "../../../../../components/stubegru_core/logic/stubegru_fetch.js";

export default class MeetingClientService {

    async assignClient(meetingId: string, clientData: MeetingClient) {
        (clientData as MeetingClientAssignData).meetingId = meetingId;
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/assignment/create_meeting_assignment_self_service.php", clientData) as AssignClientResponse;
        //DONT throw error here, because the response status is handled by AssignFeedbackModal
        //if (resp.status == "error") { throw new Error(resp.message) }; 
        return resp;
    }

}

export interface AssignFeedback {
    status: string;
    message?: string;
    content?: string;
}

export interface AssignClientResponse extends StubegruHttpResponse {
    advisorMail: AssignFeedback;
    assign: AssignFeedback;
    clientData: AssignFeedback;
    clientMail: AssignFeedback;
    survey: AssignFeedback;
}

export interface MeetingClientAssignData extends MeetingClient {
    meetingId: string;
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