import { Component, NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ViewModel } from './model/viewmodel';
import { ModelConverterService } from './model-converter.service';
import { Timer } from './model/timer';
import { JiraService } from './jira.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Jira Timer';
  viewModel : ViewModel = null;
  currentTimer : Timer = null;

  constructor(zone : NgZone, electronService : ElectronService, modelConverterService : ModelConverterService, private _jiraService : JiraService) {
    electronService.ipcRenderer.once("userData", (_, userData) => {
      zone.run(() => {
        this.viewModel = modelConverterService.toModel(userData);
      });
    });

    // request user data only after the handler is ready
    electronService.ipcRenderer.send("userDataRequest");
  }

  public refreshJirasAssignedToMe() : void {
    this._jiraService.setupIssuesAssignedToMe(this.viewModel.selectedConnection);
  }

  public refreshJirasRecentlyViewed() : void {
    this._jiraService.setupIssuesRecentlyViewed(this.viewModel.selectedConnection);
  }
}
