import Stubegru from "../../../../../components/stubegru_core/logic/stubegru.js";
export default class MeetingClientService {
    async assignClient(meetingId, clientData) {
        clientData.meetingId = meetingId;
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/assignment/create_meeting_assignment_self_service.php", clientData);
        //DONT throw error here, because the response status is handled by AssignFeedbackModal
        //if (resp.status == "error") { throw new Error(resp.message) }; 
        return resp;
    }
}
