import { Component, OnInit, Input } from '@angular/core';
import { ViewModel } from '../model/viewmodel';
import { Connection } from '../model/connection';
import { ElectronService } from 'ngx-electron';
import { ModelConverterService } from '../model-converter.service';

@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.css']
})
export class ConnectionsComponent implements OnInit {
  @Input() viewModel : ViewModel;

  constructor(private _electronService : ElectronService, private _modelConverterService : ModelConverterService) {
  }

  ngOnInit() {
  }

  public deleteConnection(connection : Connection) : void {
    if (this.viewModel.selectedConnection === connection) {
      this.viewModel.selectedConnection = null;
    }

    this.viewModel.connections.splice(this.viewModel.connections.indexOf(connection), 1);
    this._electronService.ipcRenderer.send("userData", this._modelConverterService.toUserData(this.viewModel));
  }

  public goToNewConnectionTab() : void {
    this.viewModel.selectedConnection = null;
    console.log("Going to new tab and saving.");
    this._electronService.ipcRenderer.send("userData", this._modelConverterService.toUserData(this.viewModel));
  }

  public selectConnection(connection : Connection) : void {
    this.viewModel.selectedConnection = connection;
    console.log("Going to existing connection and saving.");
    this._electronService.ipcRenderer.send("userData", this._modelConverterService.toUserData(this.viewModel));
  }
}
