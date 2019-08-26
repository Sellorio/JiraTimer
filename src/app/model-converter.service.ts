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
  constructor(private readonly jiraService: JiraService) {}

  public toModel(userData: any): ViewModel {
    const connections = this.connectionsToModel(userData.connections);

    return {
      settings: this.settingsToModel(userData.settings),
      connections,
      selectedConnection: userData.selectedConnection === -1 ? null : connections[userData.selectedConnection],
      timers: [],
      selectedTimer: null
    };
  }

  public toUserData(model: ViewModel): any {
    return {
      settings: this.settingsToData(model.settings),
      connections: this.connectionsToData(model.connections),
      selectedConnection: model.connections.indexOf(model.selectedConnection)
    };
  }

  private settingsToModel(settings: any): Settings {
    return {
      keepOpenInTray: this.getSettingOrDefault(settings.keepOpenInTray, true),
      openInBackground: this.getSettingOrDefault(settings.openInBackground, false),
      startOnStartup: this.getSettingOrDefault(settings.startOnStartup, false),
      startTimerOnStartup: this.getSettingOrDefault(settings.startTimerOnStartup, false),
      keepTimerRunning: this.getSettingOrDefault(settings.keepTimerRunning, false),
      disableHistoryItemCollapse: this.getSettingOrDefault(settings.disableHistoryItemCollapse, false)
    };
  }

  private settingsToData(settings: Settings): any {
    return settings;
  }

  private connectionsToModel(connections: any[]): Connection[] {
    return connections.map(x => {
      const connection = {
        hostname: x.hostname,
        icon: x.icon,
        username: x.username,
        password: x.password,
        history: this.historyToModel(x.history),
        jirasAssignedToMe: null,
        jirasRecentlyViewed: null,
        historyChanged: true
      };

      this.jiraService.setupIssuesAssignedToMe(connection);
      this.jiraService.setupIssuesRecentlyViewed(connection);

      return connection;
    });
  }

  private connectionsToData(connections: Connection[]): any {
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

  private historyToModel(history: any[]): WorklogHistory[] {
    return history.map(x => {
      return {
        jiras: x.jiras,
        worklogIds: x.worklogIds,
        startedAt: new Date(x.startedAt),
        pausedDuration: x.pausedDuration,
        endedAt: new Date(x.endedAt),
        description: x.description,
        isInEditMode: false
      };
    });
  }

  private historyToData(history: WorklogHistory[]): any {
    return history.map(x => {
      return {
        jiras: x.jiras,
        worklogIds: x.worklogIds,
        startedAt: x.startedAt.toISOString(),
        pausedDuration: x.pausedDuration,
        endedAt: x.endedAt.toISOString(),
        description: x.description
      };
    });
  }

  private getSettingOrDefault(settingValue, defaultValue): any {
    return typeof settingValue === 'undefined' ? defaultValue : settingValue;
  }
}
