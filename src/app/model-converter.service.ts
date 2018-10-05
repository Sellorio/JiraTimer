import { Injectable } from '@angular/core';
import { WorklogHistory } from './model/worklog-history';
import { Connection } from './model/connection';
import { ViewModel } from './model/viewmodel';
import { Settings } from './model/settings';
import { JiraService } from './jira.service';

@Injectable({
    providedIn: 'root'
})
export class ModelConverterService {
    constructor(private _jiraService : JiraService) {
    }

    public toModel(userData : any) : ViewModel {
        let connections = this.connectionsToModel(userData.connections)

        return {
            settings: this.settingsToModel(userData.settings),
            connections: connections,
            selectedConnection: userData.selectedConnection === -1 ? null : connections[userData.selectedConnection],
            timers: [],
            selectedTimer: null
        };
    }

    public toUserData(model : ViewModel) : any {
        return {
            settings: this.settingsToData(model.settings),
            connections: this.connectionsToData(model.connections),
            selectedConnection: model.connections.indexOf(model.selectedConnection)
        }
    }

    private settingsToModel(settings : any) : Settings {
        return settings;
    }

    private settingsToData(settings : Settings) : any {
        return settings;
    }

    private connectionsToModel(connections : any[]) : Connection[] {
        return connections.map(x => {
            let connection = {
                hostname: x.hostname,
                icon: x.icon,
                username: x.username,
                password: x.password,
                history: this.historyToModel(x.history),
                jirasAssignedToMe: null,
                jirasRecentlyViewed: null
            };

            this._jiraService.setupIssuesAssignedToMe(connection);
            this._jiraService.setupIssuesRecentlyViewed(connection);

            return connection;
        });
    }

    private connectionsToData(connections : Connection[]) : any {
        return connections.map(x => {
            return {
                hostname: x.hostname,
                icon: x.icon,
                username: x.username,
                password: x.password,
                history: this.historyToData(x.history)
            };
        });
    }

    private historyToModel(history : any[]) : WorklogHistory[] {
        return history.map(x => {
            return {
                worklogIds: x.worklogIds,
                startedAt: x.startedAt,
                pausedDuration: x.pausedDuration,
                endedAt: x.endedAt,
                description: x.description,
                isInEditMode: false
            };
        });
    }

    private historyToData(history : WorklogHistory[]) : any {
        return history.map(x => {
            return {
                worklogIds: x.worklogIds,
                startedAt: x.startedAt,
                pausedDuration: x.pausedDuration,
                endedAt: x.endedAt,
                description: x.description
            };
        });
    }
}
