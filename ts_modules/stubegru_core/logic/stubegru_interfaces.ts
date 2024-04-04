export interface StringIndexedList<ListItem> {
    [index: string]: ListItem;
}

export interface StubegruConstants {
    BASE_URL: string;
    BASE_PATH: string;
    APPLICATION_ID: string;
    APPLICATION_VERSION: string;
    CUSTOM_CONFIG: StubegruCustomConfig;
    all: string;
    currentUser: string;
    read: string;
    unread: string;
    all_read: string;
    error: string;
    success: string;
    reminder: string;
    report: string;
    article: string;
    news: string;
    absence: string;
    new: string;
    update: string;
    delete: string;
    info: string;
    notification_mail: number;
    notification_online: number;
    notification_both: number;
    notification_none: number;
    nobody: number;
  }

  export interface StubegruCustomConfig {
    cronjob?: (string)[] | null;
    roomTemplateAssignment: RoomTemplateAssignment;
    applicationName: string;
    institutionMailAddress: string;
    institutionName: string;
    adminMail: string;
    evaluationSurveyId: string;
    favicon: string;
    censorMeetingClientData: boolean;
    mailLogKeepDays: number;
  }
  
  export interface RoomTemplateAssignment {
    personally: number;
    phone: number;
    webmeeting: number;
  }
  
