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
    async assignClient(meetingId, clientData) {
        clientData.meetingId = meetingId;
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/assignment/create_meeting_assignment.php", clientData);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async updateClientMail(meetingId, clientMail) {
        let resp = await Stubegru.fetch.postJson("ts_modules/calendar/backend/assignment/update_client_mail_address.php", {
            meetingId: meetingId,
            clientMail: clientMail
        });
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
}
