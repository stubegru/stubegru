class Meeting {

    static meetingList = [];

    static async fetchMeetings() {
        Meeting.meetingList = [];

        let resp = await fetch(`${stubegru.constants.BASE_URL}/modules/calendar/dates/get_meetings.php`);
        let meetingList = await resp.json();
        for (const meetingData of meetingList) {
            let m = new Meeting(meetingData);
            Meeting.meetingList.push(m);
        }
    }

    constructor(meetingData) {
        this.id = meetingData.id;
        this.date = meetingData.date;
        this.start = meetingData.start;
        this.end = meetingData.end;
        this.title = meetingData.title;
        this.ownerId = meetingData.ownerId;
        this.roomId = meetingData.roomId;
        this.templateId = meetingData.templateId;
        this.teilnehmer = meetingData.teilnehmer;
    }


    getMeetingById(meetingId) {
        return Meeting.meetingList.find(e => e.id == meetingId);
    }

    /**
     * Updates an existing meeting on the server for storage in database
     */
    async updateOnServer() {
        let formData = new FormData();

        formData.append("id", this.id);
        formData.append("date", this.date);
        formData.append("start", this.start);
        formData.append("end", this.end);
        formData.append("title", this.title);
        formData.append("ownerId", this.ownerId);
        formData.append("roomId", this.roomId);
        formData.append("templateId", this.templateId);

        const url = `${stubegru.constants.BASE_URL}/modules/calendar/dates/update_calendar_date.php`;
        let meetingResp = await fetch(url, {
            method: 'POST',
            body: formData
        });
        meetingResp = await meetingResp.json();
        return meetingResp;
    }


    /**
     * Updates an existing meeting on the server for storage in database
     */
    static async createOnServer(meetingData) {
        let formData = new FormData();

        formData.append("date", meetingData.date);
        formData.append("start", meetingData.start);
        formData.append("end", meetingData.end);
        formData.append("title", meetingData.title);
        formData.append("ownerId", meetingData.ownerId);
        formData.append("roomId", meetingData.roomId);
        formData.append("templateId", meetingData.templateId);

        const url = `${stubegru.constants.BASE_URL}/modules/calendar/dates/create_calendar_date.php`;
        let meetingResp = await fetch(url, {
            method: 'POST',
            body: formData
        });
        meetingResp = await meetingResp.json();
        return meetingResp;
    }

    async deleteOnServer() {
        let resp = await fetch(`${stubegru.constants.BASE_URL}/modules/calendar/dates/delete_date.php`, {
            method: "POST",
            body: { id: this.id }
        });
        let jsonResp = await resp.json();
        return jsonResp;
    }

    async assignClient(clientData) {
        let client = new FormData();
        client.append("dateId", this.id);
        client.append("name", clientData.name);
        client.append("mail", clientData.mail);
        client.append("phone", clientData.phone);
        client.append("survey", clientData.survey);
        client.append("issue", clientData.issue);

        let clientResp = await fetch(`${stubegru.constants.BASE_URL}/modules/calendar/dates/assign_date.php`, {
            method: 'POST',
            body: client
        });
        clientResp = await clientResp.json();
        return clientResp;
    }

    async deleteClient() {
        let formData = new FormData();
        formData.append("dateId", this.id);

        let resp = await fetch(`${stubegru.constants.BASE_URL}/modules/calendar/dates/remove_assignment.php`, {
            method: 'POST',
            body: formData
        });
        resp = await resp.json();
        return resp;
    }

}