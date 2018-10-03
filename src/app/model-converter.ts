import { ViewModel } from "./model/viewmodel";
import { Settings } from "./model/settings";
import { Connection } from "./model/connection";
import { WorklogHistory } from "./model/worklog-history";

export class ModelConverter {
    public static toModel(userData : any) : ViewModel {
        let connections = this.connectionsToModel(userData.connections)

        return {
            settings: this.settingsToModel(userData.settings),
            connections: connections,
            selectedConnection: userData.selectedConnection === -1 ? null : connections[userData.selectedConnection]
        };
    }

    public static toUserData(model : ViewModel) : any {
        return {
            settings: this.settingsToData(model.settings),
            connections: this.connectionsToData(model.connections),
            selectedConnection: model.connections.indexOf(model.selectedConnection)
        }
    }

    private static settingsToModel(settings : any) : Settings {
        return settings;
    }

    private static settingsToData(settings : Settings) : any {
        return settings;
    }

    private static connectionsToModel(connections : any[]) : Connection[] {
        return connections.map(x => {
            return {
                hostname: x.hostname,
                icon: x.icon,
                username: x.username,
                password: x.password,
                history: this.historyToModel(x.history),
                jirasAssignedToMe: null,
                jirasRecentlyViewed: null
            };
        });
    }

    private static connectionsToData(connections : Connection[]) : any {
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

    private static historyToModel(history : any[]) : WorklogHistory[] {
        return history.map(x => {
            return {
                worklogId: x.worklogId,
                startedAt: x.startedAt,
                pausedDuration: x.pausedDuration,
                endedAt: x.endedAt,
                description: x.description,
                isInEditMode: false
            };
        });
    }

    private static historyToData(history : WorklogHistory[]) : any {
        return history.map(x => {
            return {
                worklogId: x.worklogId,
                startedAt: x.startedAt,
                pausedDuration: x.pausedDuration,
                endedAt: x.endedAt,
                description: x.description
            };
        });
    }
}