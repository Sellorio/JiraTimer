import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Connection } from './model/connection';

@Injectable({
    providedIn: 'root'
})
export class JiraService {
    constructor(private http : HttpClient) {
    }

    public get(connection : Connection, apiAction : string, callback? : (response : any) => void, onFail? : (error : string) => void) : void {
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

    public post(connection : Connection, apiAction : string, input : any, callback? : (response : any) => void, onFail? : (error : string) => void) : void {
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
            promise.catch(x => onFail(x.message));
        }
    }

    private getHttpOptions(connection : Connection) : any {
        return {
            headers: { Authorization: "Basic " + btoa(connection.username + ":" + connection.password) }
        };
    }
}
