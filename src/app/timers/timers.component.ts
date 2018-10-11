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
  totalTimeToday : string = "00:00:00";
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

    timersComponent.totalTimeToday = this.getTodaysTotal(viewModel);
  }

  private static getTodaysTotal(viewModel : ViewModel) : string {
    let today = new Date().getDate().toString() + new Date().getMonth().toString();
    let now = new Date();
    let totalSeconds = 0;

    for (let connectionIndex = 0; connectionIndex < viewModel.connections.length; connectionIndex++) {
      const connection = viewModel.connections[connectionIndex];

      for (let historyIndex = 0; historyIndex < connection.history.length; historyIndex++) {
        const history = connection.history[historyIndex];

        if (history.startedAt.getDate().toString() + history.startedAt.getMonth().toString() == today) {
          totalSeconds += Math.floor((history.endedAt.getTime() - history.startedAt.getTime()) / 1000 - history.pausedDuration);
        }
        else { // histories are ordered from most recent to oldest
          break;
        }
      }
    }

    for (let timerIndex = 0; timerIndex < viewModel.timers.length; timerIndex++) {
      const timer = viewModel.timers[timerIndex];
      totalSeconds += Math.floor((now.getTime() - timer.startedAt.getTime()) / 1000 - timer.pausedDuration);
    }

    let hours : any = Math.floor(totalSeconds / 3600);
    totalSeconds -= hours * 3600;
    let minutes : any = Math.floor(totalSeconds / 60.0);
    let seconds : any = totalSeconds % 60;

    if (hours === 0) {
      hours = "00";
    }
    else if (hours > 9) {
      hours = hours.toString();
    }
    else {
      hours = "0" + hours.toString();
    }

    if (minutes > 9) {
      minutes = minutes.toString();
    }
    else {
      minutes = "0" + minutes.toString();
    }

    if (seconds > 9) {
      seconds = seconds.toString();
    }
    else {
      seconds = "0" + seconds.toString();
    }

    return hours + ":" + minutes + ":" + seconds;
  }
}
