class Meeting {

    static meetingList = [];

    static async fetchMeetings() {
        Meeting.meetingList = [];

        let resp = await fetch(`${stubegru.constants.BASE_URL}/modules/calendar/dates/get_meetings.php`);
        let meetingList = await resp.json();
        for (const meetingData of meetingList) {
            meetingData.roomId = meetingData.room;
            meetingData.templateId = meetingData.template;
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
        this.channel = meetingData.channel;
    }


    applyProperties(data) {
        for (const propName in data) {
            this[propName] = data[propName];
        }
    }


    static getById(meetingId) {
        return Meeting.meetingList.find(e => e.id == meetingId);
    }

    /**
     * Updates an existing meeting on the server for storage in database
     */
    async updateOnServer() {
        let formData = this.toFormData();

        const url = `${stubegru.constants.BASE_URL}/modules/calendar/dates/update_calendar_date.php`;
        let meetingResp = await fetch(url, {
            method: 'POST',
            body: formData
        });
        meetingResp = await meetingResp.json();
        return meetingResp;
    }


    toFormData() {
        let formData = new FormData();

        formData.append("id", this.id);
        formData.append("date", this.date);
        formData.append("start", this.start);
        formData.append("end", this.end);
        formData.append("title", this.title);
        formData.append("ownerId", this.ownerId);
        formData.append("roomId", this.roomId);
        formData.append("templateId", this.templateId);
        formData.append("channel", this.channel);
        return formData;
    }

    /**
     * Updates an existing meeting on the server for storage in database
     */
    static async createOnServer(meetingData) {
        meetingData.id = "new";
        let m = new Meeting(meetingData);
        let formData = m.toFormData();
        
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
        client.append("channel", clientData.channel);

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