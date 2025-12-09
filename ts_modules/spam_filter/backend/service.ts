import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import * as dbService from './../database/service';
import { SpamFilter } from '../../model/SpamFilter/model'


export async function getSpamFilter(spamfilterId: string) {
    const queryCmd = `SELECT * FROM SpamFilter WHERE id = ?`;
    const [rows] = await dbService.query<RowDataPacket[]>(queryCmd, [spamfilterId]);
    return rows[0] as SpamFilter;
}

export async function getSpamFilterList() {
    const queryCmd = `SELECT * FROM SpamFilter`;
    const [rows] = await dbService.query<RowDataPacket[]>(queryCmd);
    return rows as SpamFilter[];
}

export async function createSpamFilter(xxxentityDataxxx: Omit<SpamFilter, "id">) {
    const { name, mail, timestamp, reason, type } = xxxentityDataxxx;
    const queryCmd = `INSERT INTO SpamFilter (name, mail, timestamp, reason, type) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await dbService.query<ResultSetHeader>(queryCmd, [name, mail, timestamp, reason, type]);
    return result.insertId;
}

export async function updateSpamFilter(xxxentityDataxxx: SpamFilter) {
    const { id, name, mail, timestamp, reason, type } = xxxentityDataxxx;
    const queryCmd = `UPDATE SpamFilter SET name = ?, mail = ?, timestamp = ?, reason = ?, type = ? WHERE id = ?`;
    await dbService.query<ResultSetHeader>(queryCmd, [name, mail, timestamp, reason, type , id]);
}

export async function deleteSpamFilter(spamfilterId: string) {
    const queryCmd = `DELETE FROM SpamFilter WHERE id = ?`;
    await dbService.query<ResultSetHeader>(queryCmd, [spamfilterId]);
}
