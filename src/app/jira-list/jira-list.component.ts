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
  @Input() currentTimer : Timer;
  @Input() list : Jira[];
  @Input() selectedConnection : Connection;

  constructor(private _electronService : ElectronService) { }

  ngOnInit() {
  }

  public getIsActive(jira) : boolean {
    return this.currentTimer && this.currentTimer.jiras.some(x => x.key === jira.key);
  }

  public toggleJiraInTimer(jira) : void {
    throw new Error("not implemented");
  }

  public openJiraInBrowser(jira) : void {
    this._electronService.ipcRenderer.send("openUrl", "https://" + this.selectedConnection.hostname + "/browse/" + jira.key)
  }
}
