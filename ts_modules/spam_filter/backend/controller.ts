import express, { NextFunction, Request as ExpressRequest, Response as ExpressResponse } from "express";
import * as spamfilterService from "./service";
import { SpamFilter } from "../../model/SpamFilter/model.js";

const router = express.Router();
//Register own routes
router.get("/", getSpamFilterList);
router.get("/:spamfilterId", getSpamFilter);
router.post("/", createSpamFilter);
router.put("/:spamfilterId", updateSpamFilter);
router.delete("/:spamfilterId", deleteSpamFilter);
export default router;

async function getSpamFilterList(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    try {
        let spamfilterList = await spamfilterService.getSpamFilterList();
        res.status(200).json(spamfilterList);
    }
    catch (e) { next(e); }
}

async function getSpamFilter(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    try {
        const spamfilterId = req.params.spamfilterId;
        let spamfilterData = await spamfilterService.getSpamFilter(spamfilterId);
        res.status(200).json(spamfilterData);
    }
    catch (e) { next(e); }
}

async function createSpamFilter(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    try {

        const spamfilterData: Omit<SpamFilter, "id"> = req.body;

        const spamfilterId = await spamfilterService.createSpamFilter(spamfilterData);
        res.status(200).json({ status: "success", message: "Created spamfilter successfully", spamfilterId: spamfilterId });
    }
    catch (e) { next(e); }
}

async function updateSpamFilter(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    try {
        const spamfilterData: SpamFilter = {
            id: req.params.spamfilterId,
            ...req.body
        }

        await spamfilterService.updateSpamFilter(spamfilterData);
        res.status(200).json({ status: "success", message: "Updated spamfilter successfully" });
    }
    catch (e) { next(e); }
}

async function deleteSpamFilter(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    try {
        const spamfilterId = req.params.spamfilterId;

        await spamfilterService.deleteSpamFilter(spamfilterId);
        res.status(200).json({ status: "success", message: "Deleted spamfilter successfully" });
    }
    catch (e) { next(e); }
}
