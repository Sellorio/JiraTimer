import { Component, OnInit, Input, ApplicationRef } from '@angular/core';
import { Timer } from '../model/timer';
import { Jira } from '../model/jira';
import { ElectronService } from 'ngx-electron';
import { Connection } from '../model/connection';

@Component({
  selector: 'app-jira-list',
  templateUrl: './jira-list.component.html',
  styleUrls: ['./jira-list.component.scss']
})
export class JiraListComponent {
  @Input() selectedTimer: Timer;
  @Input() list: Jira[];
  @Input() selectedConnection: Connection;

  constructor(
    private readonly electronService: ElectronService,
    private readonly applicationRef: ApplicationRef) {}

  public getIsActive(jira: Jira): boolean {
    return this.selectedTimer
      && this.selectedTimer.connection === this.selectedConnection
      && this.selectedTimer.jiras.some(x => x.key === jira.key);
  }

  public toggleJiraInTimer(jira: Jira): void {
    if (this.selectedTimer) {
      if (this.selectedTimer.connection === this.selectedConnection) {
        const indexOfJira = this.selectedTimer.jiras.indexOf(jira);

        if (indexOfJira === -1) {
          this.selectedTimer.jiras.push(jira);
        } else {
          this.selectedTimer.jiras.splice(indexOfJira, 1);
        }

        this.applicationRef.tick();
      } else {
        alert('This timer is for another connection.');
      }
    }
  }

  public openJiraInBrowser(jira: Jira): void {
    this.electronService.ipcRenderer.send('openUrl', `https://${this.selectedConnection.hostname}/browse/${jira.key}`);
  }
}
