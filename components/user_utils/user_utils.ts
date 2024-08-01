export default class UserUtils {
    static currentUser: StubegruUser;
}

export interface StubegruUser {
    id: string;
    name: string;
    mail: string;
    account: string;
    role: string;
    erfassungsdatum: string;
    erfasser: string;
}