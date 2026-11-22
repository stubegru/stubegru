import AbsenceController from "./absence_controller.js";
import AbsenceService from "./absence_service.js";
import AbsenceView from "./absence_view.js";

export default class AbsenceModule {

    static state = {};

    static service: AbsenceService;
    static controller: AbsenceController;
    static view: AbsenceView;

    static async init() {
        AbsenceModule.service = new AbsenceService();
        AbsenceModule.controller = new AbsenceController();
        AbsenceModule.view = new AbsenceView();

        await AbsenceModule.controller.init();
    }
}

await AbsenceModule.init();



export interface AbsenceObject {
    id: string;
    name: string;
    description: string;
    start: string;
    end: string;
    recurring: AbsenceRecurringString;
    wholeDay: boolean;
}

export interface AbsenceObjectWithNtf extends AbsenceObject {
    sendNotification: boolean;
}

export interface AbsenceObjectWithDisplayStrings extends AbsenceObject {
    startString: string;
    endString: string;
    recurringLabelText: string;
    tableId: AbsenceTableId;
    epoch: AbsenceEpochString;
}

export type AbsenceRecurringString = "" | "daily" | "weekly";
export type AbsenceEpochString = "past" | "present" | "future";
export type AbsenceTableId =  "present" | "future";