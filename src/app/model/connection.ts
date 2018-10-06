import { WorklogHistory } from "./worklog-history"
import { Jira } from "./jira"

export class Connection {
    hostname : string;
    icon : string; // e.g. image/png;base64,blahblahblah
    username : string;
    password : string;
    history : WorklogHistory[];
    jirasAssignedToMe : Jira[];
    jirasRecentlyViewed : Jira[];
    historyChanged : boolean;
}