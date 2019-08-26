import { Component, OnInit, Input } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ModelConverterService } from '../model-converter.service';
import { ViewModel } from '../model/viewmodel';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  @Input() viewModel: ViewModel;
  isVisible = false;

  constructor(
    private readonly electronService: ElectronService,
    private readonly modelConverterService: ModelConverterService) {}

  public openSettings(): void {
    this.isVisible = true;
  }

  public settingsChanged(): void {
    this.electronService.ipcRenderer.send('userData', this.modelConverterService.toUserData(this.viewModel));
  }

  public closeSettings(): void {
    this.isVisible = false;
  }
}
