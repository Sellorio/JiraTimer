import { Component, OnInit, Input } from '@angular/core';
import { Timer } from '../model/timer';
import { Jira } from '../model/jira';
import { ElectronService } from 'ngx-electron';
import { Connection } from '../model/connection';

@Component({
  selector: 'app-jira-list',
  templateUrl: './jira-list.component.html',
  styleUrls: ['./jira-list.component.css']
})
export class JiraListComponent implements OnInit {
  @Input() selectedTimer : Timer;
  @Input() list : Jira[];
  @Input() selectedConnection : Connection;

  constructor(private _electronService : ElectronService) { }

  ngOnInit() {
  }

  public getIsActive(jira) : boolean {
    return this.selectedTimer && this.selectedTimer.connection === this.selectedConnection && this.selectedTimer.jiras.some(x => x.key === jira.key);
  }

  public toggleJiraInTimer(jira) : void {
    if (this.selectedTimer) {
      if (this.selectedTimer.connection === this.selectedConnection) {
        let indexOfJira = this.selectedTimer.jiras.indexOf(jira);

        if (indexOfJira === -1) {
          this.selectedTimer.jiras.push(jira);
        }
        else {
          this.selectedTimer.jiras.splice(indexOfJira, 1);
        }
      }
      else {
        alert("This timer is for another connection.");
      }
    }
  }

  public openJiraInBrowser(jira) : void {
    this._electronService.ipcRenderer.send("openUrl", "https://" + this.selectedConnection.hostname + "/browse/" + jira.key)
  }
}
