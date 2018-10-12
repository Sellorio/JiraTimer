import { Component, OnInit, Input } from '@angular/core';
import { ViewModel } from '../model/viewmodel';
import { Timer } from '../model/timer';
import { ElectronService } from 'ngx-electron';
import { TimeSpan } from '../time-span';
import { TimerComponent } from '../timer/timer.component';
import { ModelConverterService } from '../model-converter.service';
import { JiraService } from '../jira.service';

@Component({
  selector: 'app-timers',
  templateUrl: './timers.component.html',
  styleUrls: ['./timers.component.css']
})
export class TimersComponent implements OnInit {
  @Input() viewModel : ViewModel;
  timerUpdatedToSecond : number = 0;

  constructor(private _electronService : ElectronService, private _modelConveterService : ModelConverterService, private _jiraService : JiraService) { }

  ngOnInit() {
    if (this.viewModel.settings.startTimerOnStartup && this.viewModel.selectedConnection !== null) {
      this.startTimer();
    }

    setInterval(() => TimersComponent.updateTimers(this.viewModel, this), 50);
  }

  public startTimer() {
    TimerComponent.startTimer(this.viewModel, this._electronService);
  }

  public submitAllTimers() : void {
    while (this.viewModel.timers.length !== 0) {
      TimerComponent.submitTimer(this.viewModel, this.viewModel.timers[0], this._electronService, this._modelConveterService, this._jiraService);
    }
  }

  private static updateTimers(viewModel : ViewModel, timersComponent : TimersComponent) : void {
    let now = new Date();

    // only do the calculations once a second, but run timer more often to produce more accurate counter
    if (timersComponent.timerUpdatedToSecond === Math.floor(now.getTime() / 1000)) {
      return;
    }

    for (let i = 0; i < viewModel.timers.length; i++) {
      const timer = viewModel.timers[i];
      
      if (timer.pauseStartedAt === null) {
        timer.currentDuration = TimeSpan.fromTime(now.getTime() - timer.startedAt.getTime() - timer.pausedDuration * 1000).toString();
      }
    }
  }
}
