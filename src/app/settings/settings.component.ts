import { Component, OnInit, Input } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ModelConverterService } from '../model-converter.service';
import { ViewModel } from '../model/viewmodel';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  @Input() viewModel : ViewModel;
  isVisible : boolean = false;

  constructor(private _electronService : ElectronService, private _modelConverterService : ModelConverterService) { }

  ngOnInit() {
  }

  public openSettings() : void {
    this.isVisible = true;
  }

  public settingsChanged() : void {
    this._electronService.ipcRenderer.send("userData", this._modelConverterService.toUserData(this.viewModel));
  }

  public closeSettings() : void {
    this.isVisible = false;
  }
}
