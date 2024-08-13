import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
export default class MeetingClientService {
    async deleteClient(meetingId) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/assignment/cancel_meeting_assignment.php", { meetingId: meetingId });
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async assignClient(clientData) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/assignment/create_meeting_assignment.php", clientData);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
}
