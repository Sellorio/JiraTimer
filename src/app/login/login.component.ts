import { Component, OnInit, Input } from '@angular/core';
import { ViewModel } from '../model/viewmodel';
import { JiraService } from '../jira.service';
import { Connection } from '../model/connection';
import { ElectronService } from 'ngx-electron';
import { ModelConverter } from '../model-converter';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Input() viewModel : ViewModel;
  isLoggingIn : boolean;
  hostname : string;
  username : string;
  password : string;

  constructor(private _jiraService : JiraService, private _electron : ElectronService) {
  }

  ngOnInit() {
  }

  public login() : void {
    this.isLoggingIn = true;
    
    let connection : Connection = {
      hostname: this.hostname.toLowerCase(),
      username: this.username.toLowerCase(),
      password: this.password,
      icon: null,
      history: [],
      jirasAssignedToMe: null,
      jirasRecentlyViewed: null
    };

    this._jiraService.get(
      connection,
      "myself",
      _ => {
        this.isLoggingIn = false;
        this.viewModel.connections.push(connection);
        this.viewModel.selectedConnection = connection;
        this._electron.ipcRenderer.send("userData", ModelConverter.toUserData(this.viewModel));
        //todo: initialise jira lists
      },
      error => {
        this.isLoggingIn = false;
        alert(error);
      });
  }
}
