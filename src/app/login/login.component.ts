import { Component, OnInit, Input, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { ViewModel } from '../model/viewmodel';
import { JiraService } from '../jira.service';
import { Connection } from '../model/connection';
import { ElectronService } from 'ngx-electron';
import { ModelConverterService } from '../model-converter.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @Input() viewModel: ViewModel;

  isLoggingIn: boolean;
  hostname: string;
  username: string;
  password: string;

  constructor(
    private readonly jiraService: JiraService,
    private readonly electron: ElectronService,
    private readonly modelConverterService: ModelConverterService,
    private readonly applicationRef: ApplicationRef) {}

  public login(): void {
    this.isLoggingIn = true;

    const connection: Connection = {
      hostname: this.hostname.toLowerCase(),
      username: this.username.toLowerCase(),
      password: this.password,
      icon: null,
      history: [],
      jirasAssignedToMe: null,
      jirasRecentlyViewed: null,
      historyChanged: true
    };

    this.jiraService.validateConnection(
      connection,
      () => {
        this.isLoggingIn = false;
        this.viewModel.connections.push(connection);
        this.viewModel.selectedConnection = connection;
        this.electron.ipcRenderer.send('userData', this.modelConverterService.toUserData(this.viewModel));
        this.jiraService.setupIssuesAssignedToMe(connection);
        this.jiraService.setupIssuesRecentlyViewed(connection);
        this.applicationRef.tick();
      },
      error => {
        this.isLoggingIn = false;
        alert(error);
      });
  }
}
