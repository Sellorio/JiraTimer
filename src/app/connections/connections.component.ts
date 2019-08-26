import { Component, OnInit, Input, ChangeDetectorRef, ApplicationRef, ChangeDetectionStrategy } from '@angular/core';
import { ViewModel } from '../model/viewmodel';
import { Connection } from '../model/connection';
import { ElectronService } from 'ngx-electron';
import { ModelConverterService } from '../model-converter.service';

@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ConnectionsComponent {
  @Input() viewModel: ViewModel;

  constructor(
    private readonly electronService: ElectronService,
    private readonly modelConverterService: ModelConverterService,
    private readonly applicationRef: ApplicationRef) {}

  public deleteConnection(connection: Connection): void {
    if (this.viewModel.selectedConnection === connection) {
      this.viewModel.selectedConnection = null;
    }

    this.viewModel.connections.splice(this.viewModel.connections.indexOf(connection), 1);
    this.electronService.ipcRenderer.send('userData', this.modelConverterService.toUserData(this.viewModel));
  }

  public goToNewConnectionTab(): void {
    this.viewModel.selectedConnection = null;
    this.applicationRef.tick();
    this.electronService.ipcRenderer.send('userData', this.modelConverterService.toUserData(this.viewModel));
  }

  public selectConnection(connection: Connection): void {
    this.viewModel.selectedConnection = connection;
    this.applicationRef.tick();
    this.electronService.ipcRenderer.send('userData', this.modelConverterService.toUserData(this.viewModel));
  }
}
