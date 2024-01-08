class EventTypeService {
    static async getAll() {
        let resp = await fetch(`${EventTypeController.stubegru.constants.BASE_URL}/modules/event_management/event_types/backend/get_all_event_types.php`);
        let eventTypeList = await resp.json();
        return eventTypeList;
    }
    static async get(eventTypeId) {
        let resp = await fetch(`${EventTypeController.stubegru.constants.BASE_URL}/modules/event_management/event_types/backend/get_event_type.php?eventTypeId=${eventTypeId}`);
        let eventType = await resp.json();
        return eventType;
    }
    static async delete(eventTypeId) {
        let formData = new FormData();
        formData.append("eventTypeId", eventTypeId);
        let resp = await fetch(`${EventTypeController.stubegru.constants.BASE_URL}/modules/event_management/event_types/backend/delete_event_type.php`, {
            method: 'POST',
            body: formData
        });
        let parsedResp = await resp.json();
        if (!parsedResp.status || parsedResp.status == "error") {
            throw new Error(parsedResp.message);
        }
        return parsedResp;
    }
    static async create(attributesJson) {
        let formData = new FormData();
        formData.append("eventTypeData", attributesJson);
        let resp = await fetch(`${EventTypeController.stubegru.constants.BASE_URL}/modules/event_management/event_types/backend/create_event_type.php`, {
            method: 'POST',
            body: formData
        });
        let parsedResp = await resp.json();
        if (!parsedResp.status || parsedResp.status == "error") {
            throw new Error(parsedResp.message);
        }
        return parsedResp;
    }
    static async update(eventTypeId, attributesJson) {
        let formData = new FormData();
        formData.append("eventTypeId", eventTypeId);
        formData.append("eventTypeData", attributesJson);
        let resp = await fetch(`${EventTypeController.stubegru.constants.BASE_URL}/modules/event_management/event_types/backend/update_event_type.php`, {
            method: 'POST',
            body: formData
        });
        let parsedResp = await resp.json();
        if (!parsedResp.status || parsedResp.status == "error") {
            throw new Error(parsedResp.message);
        }
        return parsedResp;
    }
}
