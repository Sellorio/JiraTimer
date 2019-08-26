import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ViewModel } from './model/viewmodel';
import { ModelConverterService } from './model-converter.service';
import { JiraService } from './jira.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Jira Timer';
  viewModel: ViewModel = null;
  totalTimeToday = '00:00:00';

  constructor(
      changeDetectorRef: ChangeDetectorRef,
      electronService: ElectronService,
      modelConverterService: ModelConverterService,
      private readonly jiraService: JiraService) {
    electronService.ipcRenderer.once('userData', (_, userData) => {
      this.viewModel = modelConverterService.toModel(userData);
      changeDetectorRef.detectChanges();
    });

    // request user data only after the handler is ready
    electronService.ipcRenderer.send('userDataRequest');
  }

  public refreshJirasAssignedToMe(): void {
    this.jiraService.setupIssuesAssignedToMe(this.viewModel.selectedConnection);
  }

  public refreshJirasRecentlyViewed(): void {
    this.jiraService.setupIssuesRecentlyViewed(this.viewModel.selectedConnection);
  }
}
