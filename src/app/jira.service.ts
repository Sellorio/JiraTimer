import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Connection } from './model/connection';
import { Jira } from './model/jira';

@Injectable({
    providedIn: 'root'
})
export class JiraService {
    constructor(private http : HttpClient) {
    }

    public setupIssuesAssignedToMe(connection : Connection) {
        connection.jirasAssignedToMe = null;

        this.get(
            connection,
            "search?jql=assignee%3DcurrentUser()%20and%20resolution%3Dnull&fields=summary",
            data => {
                connection.jirasAssignedToMe =
                    data.issues.map(x => {
                        return { key: x.key, summary: x.fields.summary };
                    });
            },
            error => {
                alert("Failed to load jira list: " + error);
            });
    }

    public setupIssuesRecentlyViewed(connection : Connection) {
        connection.jirasRecentlyViewed = null;

        this.get(
            connection,
            "search?jql=resolution%3Dnull%20and%20assignee!%3DcurrentUser()%20and%20lastViewed!%3Dnull%20order%20by%20lastViewed%20DESC&fields=summary",
            data => {
                connection.jirasRecentlyViewed =
                    data.issues.map(x => {
                        return { key: x.key, summary: x.fields.summary };
                    });
            },
            error => {
                alert("Failed to load jira list: " + error);
            });
    }

    public validateConnection(connection : Connection, onPass : () => void, onFail : (error : string) => void) : void {
        this.get(connection, "myself", onPass, onFail);
    }

    public validateJiraKey(connection : Connection, jiraKey : string, onPass : (summary : string) => void, onFail : () => void) : void {
        this.get(connection, "issue/" + jiraKey + "?fields=summary", jira => onPass(jira.fields.summary), onFail);
    }

    public submitWorklog(connection : Connection, jiras : Jira[], startedAt : Date, duration : number, comment : string, onComplete : (worklogIds : number[]) => void) : void {
        let worklogIds = [];

        for (let i = 0; i < jiras.length; i++) {
            let jiraKey = jiras[i].key;

            this.post(
                connection,
                "issue/" + jiraKey + "/worklog",
                {
                    comment: comment,
                    started: startedAt.toISOString().replace("Z", "+0000"),
                    timeSpent: Math.ceil(duration / jiras.length / 60.0).toString() + "m"
                },
                worklog => {
                    worklogIds.push(parseInt(worklog.id));

                    if (worklogIds.length == jiras.length) {
                        onComplete(worklogIds);
                    }
                },
                error => {
                    alert("Failed to submit worklog for " + jiraKey + ": " + error);
                    worklogIds.push(0);

                    if (worklogIds.length === jiras.length) {
                        onComplete(worklogIds);
                    }
                });
        }
    }

    private get(connection : Connection, apiAction : string, callback? : (response : any) => void, onFail? : (error : string) => void) : void {
        let promise =
            this.http.get(
                "https://" + connection.hostname + "/rest/api/2/" + apiAction,
                this.getHttpOptions(connection))
                    .toPromise();

        if (callback) {
            promise.then(callback);
        }

        if (onFail) {
            promise.catch(x => onFail(x.message));
        }
    }

    private post(connection : Connection, apiAction : string, input : any, callback? : (response : any) => void, onFail? : (error : string) => void) : void {
        let promise =
            this.http.post(
                "https://" + connection.hostname + "/rest/api/2/" + apiAction,
                input,
                this.getHttpOptions(connection))
                    .toPromise();

        if (callback) {
            promise.then(callback);
        }

        if (onFail) {
            promise.catch(x => onFail(x.error.message));
        }
    }

    private getHttpOptions(connection : Connection) : any {
        return {
            headers: {
                Authorization: "Basic " + btoa(connection.username + ":" + connection.password),
            }
        };
    }
}
