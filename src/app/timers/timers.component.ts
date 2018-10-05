import { Component, OnInit, Input } from '@angular/core';
import { ViewModel } from '../model/viewmodel';
import { Timer } from '../model/timer';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-timers',
  templateUrl: './timers.component.html',
  styleUrls: ['./timers.component.css']
})
export class TimersComponent implements OnInit {
  @Input() viewModel : ViewModel;
  totalTimeToday : string = "00:00:00";
  timerUpdatedToSecond : number = 0;

  constructor() { }

  ngOnInit() {
    if (this.viewModel.settings.startTimerOnStartup && this.viewModel.selectedConnection !== null) {
      this.startTimer();
    }

    setInterval(() => TimersComponent.updateTimers(this.viewModel, this), 50);
  }

  public startTimer() {
    let timer : Timer = {
      connection: this.viewModel.selectedConnection,
      startedAt: new Date(),
      pausedDuration: 0,
      description: "",
      jiras: [],
      pauseStartedAt: null,
      currentDuration: "00:00"
    };

    this.viewModel.timers.push(timer);
    this.viewModel.selectedTimer = timer;
  }

  private static updateTimers(viewModel : ViewModel, timersComponent : TimersComponent) : void {
    let now = new Date();

    // only do the calculations once a second, but run timer more often to produce more accurate counter
    if (timersComponent.timerUpdatedToSecond === Math.floor(now.getTime() / 1000) || viewModel.timers.length === 0) {
      return;
    }

    for (let i = 0; i < viewModel.timers.length; i++) {
      const timer = viewModel.timers[i];
      
      if (timer.pauseStartedAt === null) {
        timer.currentDuration = this.timeDifferenceToDisplay(now.getTime() - timer.startedAt.getTime(), timer.pausedDuration);
      }
    }

    timersComponent.totalTimeToday = this.getTodaysTotal(viewModel);
  }

  private static timeDifferenceToDisplay(difference, pausedDuration) {
    let diff = difference - pausedDuration * 1000;

    let days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -=  days * (1000 * 60 * 60 * 24);

    let hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    let mins = Math.floor(diff / (1000 * 60));
    diff -= mins * (1000 * 60);

    let seconds = Math.floor(diff / (1000));
    diff -= seconds * (1000);

    let result = "";

    if (days !== 0) {
      result += days + ".";
    }

    if (hours === 0) {
      result = "00:";
    }
    else {
      result += (hours > 9 ? hours.toString() : "0" + hours.toString()) + ":";
    }

    result += (mins > 9 ? mins.toString() : "0" + mins.toString()) + ":";
    result += seconds > 9 ? seconds.toString() : "0" + seconds.toString();

    return result;
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
