class EventInstanceService {
    static async getAll() {
        let resp = await fetch(`${EventInstanceController.stubegru.constants.BASE_URL}/modules/event_management/event_instances/backend/get_all_event_instances.php`);
        let eventInstanceList = await resp.json();
        return eventInstanceList;
    }
    static async get(eventInstanceId) {
        let resp = await fetch(`${EventInstanceController.stubegru.constants.BASE_URL}/modules/event_management/event_instances/backend/get_event_instance.php?eventInstanceId=${eventInstanceId}`);
        let eventInstance = await resp.json();
        return eventInstance;
    }
    static async delete(eventInstanceId) {
        let formData = new FormData();
        formData.append("eventInstanceId", eventInstanceId);
        let resp = await fetch(`${EventInstanceController.stubegru.constants.BASE_URL}/modules/event_management/event_instances/backend/delete_event_instance.php`, {
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
        formData.append("eventInstanceData", attributesJson);
        let resp = await fetch(`${EventInstanceController.stubegru.constants.BASE_URL}/modules/event_management/event_instances/backend/create_event_instance.php`, {
            method: 'POST',
            body: formData
        });
        let parsedResp = await resp.json();
        if (!parsedResp.status || parsedResp.status == "error") {
            throw new Error(parsedResp.message);
        }
        return parsedResp;
    }
    static async update(eventInstanceId, attributesJson) {
        let formData = new FormData();
        formData.append("eventInstanceId", eventInstanceId);
        formData.append("eventInstanceData", attributesJson);
        let resp = await fetch(`${EventInstanceController.stubegru.constants.BASE_URL}/modules/event_management/event_instances/backend/update_event_instance.php`, {
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
