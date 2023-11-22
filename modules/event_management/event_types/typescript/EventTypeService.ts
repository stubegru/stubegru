class EventTypeService {

    static async getAll(): Promise<EventTypeIndexedList> {
        let resp = await fetch(`${EventTypeController.stubegru.constants.BASE_URL}/modules/event_management/event_types/backend/get_all_event_types.php`);
        let eventTypeList: EventTypeIndexedList = await resp.json();
        return eventTypeList;
    }

    static async get(eventTypeId: string): Promise<EventType> {
        let resp = await fetch(`${EventTypeController.stubegru.constants.BASE_URL}/modules/event_management/event_types/backend/get_event_type.php?eventTypeId=${eventTypeId}`);
        let eventType: EventType = await resp.json();
        return eventType;
    }

    static async delete(eventTypeId: string): Promise<StubegruHttpResponse> {
        let formData = new FormData();
        formData.append("eventTypeId", eventTypeId);

        let resp = await fetch(`${EventTypeController.stubegru.constants.BASE_URL}/modules/event_management/event_types/backend/delete_event_type.php`, {
            method: 'POST',
            body: formData
        });

        let parsedResp: StubegruHttpResponse = await resp.json();
        if (!parsedResp.status || parsedResp.status == "error") { throw new Error(parsedResp.message); }
        return parsedResp;
    }

    static async create(attributesJson: string): Promise<StubegruHttpResponse> {
        let formData = new FormData();
        formData.append("eventTypeData", attributesJson);

        let resp = await fetch(`${EventTypeController.stubegru.constants.BASE_URL}/modules/event_management/event_types/backend/create_event_type.php`, {
            method: 'POST',
            body: formData
        });

        let parsedResp: StubegruHttpResponse = await resp.json();
        if (!parsedResp.status || parsedResp.status == "error") { throw new Error(parsedResp.message); }
        return parsedResp;
    }

    static async update(eventTypeId: string, attributesJson: string): Promise<StubegruHttpResponse> {
        let formData = new FormData();
        formData.append("eventTypeId", eventTypeId);
        formData.append("eventTypeData", attributesJson);

        let resp = await fetch(`${EventTypeController.stubegru.constants.BASE_URL}/modules/event_management/event_types/backend/update_event_type.php`, {
            method: 'POST',
            body: formData
        });

        let parsedResp: StubegruHttpResponse = await resp.json();
        if (!parsedResp.status || parsedResp.status == "error") { throw new Error(parsedResp.message); }
        return parsedResp;
    }
}

