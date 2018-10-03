import { Component, NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ViewModel } from './model/viewmodel';
import { ModelConverter } from './model-converter';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Jira Timer';
  viewModel : ViewModel = null;

  constructor(private zone : NgZone, electronService : ElectronService) {
    electronService.ipcRenderer.once("userData", (_, userData) => {
      zone.run(() => {
        this.viewModel = ModelConverter.toModel(userData);
      });
    });

    // request user data only after the handler is ready
    electronService.ipcRenderer.send("userDataRequest");
  }
}
