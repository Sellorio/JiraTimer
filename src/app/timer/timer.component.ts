import { Component, OnInit, Input } from '@angular/core';
import { Timer } from '../model/timer';
import { ViewModel } from '../model/viewmodel';
import { JiraService } from '../jira.service';
import { Jira } from '../model/jira';
import { WorklogHistory } from '../model/worklog-history';
import { ElectronService } from 'ngx-electron';
import { TimeSpan } from '../time-span';
import { ModelConverterService } from '../model-converter.service';

const RandomPlaceholders = [
  "Accidentally googled cat photos",
  "Waiting for Visual Studio to update",
  "Admiring my work",
  "Ranting about other people's code",
  "Quickly checking my reddit.....",
  "I didn't test this... I hope it works...",
  "Playing minecraft in a console window",
  "Waiting for Star Citizen to release",
  "Was 'the cake' a lie? Discuss.",
  "Laughing way too loudly",
  "Half of all programmers are below average",
  "Letting the compiler find what's broken",
  "Thinking of a good worklog description",
  "Pretending to work (manager is near)",
  "Writing passive aggressive messages",
  "Lost in thought",
  "Waiting for a code review",
  "Looking forward to the weekend",
  "Avoiding that annoying task",
  "Sucking up to the boss"
];

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent implements OnInit {
  @Input() viewModel : ViewModel;
  @Input() timer : Timer;
  manualJiraKey : string;
  formattedStartTime : string;
  randomisedDescriptionPlaceholder : string;

  constructor(private _jiraService : JiraService, private _electronService : ElectronService, private _modelConverterService : ModelConverterService) { }

  ngOnInit() {
    this.randomisedDescriptionPlaceholder = RandomPlaceholders[Math.floor(Math.random() * RandomPlaceholders.length)];
    this.formattedStartTime = TimeSpan.fromDate(this.timer.startedAt).toString();
  }

  public selectTimer() : void {
    this.viewModel.selectedTimer = this.timer;
  }

  public startTimeChanged() : void {
    let timeSpan : TimeSpan;

    try
    {
      timeSpan = TimeSpan.parse(this.formattedStartTime);
    }
    catch (err) {
      alert(err);
      return;
    }

    let newTime = new Date(this.timer.startedAt.getTime());
    newTime.setHours(timeSpan.hours);
    newTime.setMinutes(timeSpan.minutes);
    newTime.setSeconds(timeSpan.seconds);
    newTime.setMilliseconds(0);

    let currentPausedDuration =
      this.timer.pauseStartedAt === null
        ? this.timer.pausedDuration
        : this.timer.pausedDuration + (Date.now() - this.timer.pauseStartedAt.getTime()) / 1000;

    if (Date.now() - newTime.getTime() - currentPausedDuration < 0) {
      alert("Invalid time. Setting this start time will result in a timer of negative duration.");
      return;
    }

    this.timer.startedAt = newTime;
  }

  public addManualJiraToTimer() : void {
    if (this.manualJiraKey){
      let jiraKey = this.manualJiraKey.toUpperCase().trim();
  
      if (/[A-Z0-9]+-[0-9]+/.test(jiraKey)) {
        this._jiraService.validateJiraKey(
          this.timer.connection,
          jiraKey,
          summary => {
            this.manualJiraKey = "";
            
            if (this.timer.connection.jirasAssignedToMe !== null) {
              for (let i = 0; i < this.timer.connection.jirasAssignedToMe.length; i++) {
                if (this.timer.connection.jirasAssignedToMe[i].key === jiraKey) {
                  this.timer.jiras.push(this.timer.connection.jirasAssignedToMe[i]);
                  return;
                }
              }
            }
            
            if (this.timer.connection.jirasRecentlyViewed !== null) {
              for (let i = 0; i < this.timer.connection.jirasRecentlyViewed.length; i++) {
                if (this.timer.connection.jirasRecentlyViewed[i].key === jiraKey) {
                  this.timer.jiras.push(this.timer.connection.jirasRecentlyViewed[i]);
                  return;
                }
              }
            }

            this.timer.jiras.push({
              key: jiraKey,
              summary: summary
            });
          },
          () => {
            alert("Jira not found.");
          });
      }
      else {
        alert("Invalid jira key format.");
      }
    }
  }

  public removeJira(jira : Jira) : void {
    let indexOfJira = this.timer.jiras.indexOf(jira);

    if (indexOfJira !== -1) {
      this.timer.jiras.splice(indexOfJira, 1);
    }
  }

  public resumeTimer() : void {
    TimerComponent.resumeTimer(this.timer, this._electronService);
  }

  public pauseTimer() : void {
    if (this.timer.pauseStartedAt === null) {
      this.timer.pauseStartedAt = new Date();

      for (let i = 0; i < this.viewModel.timers.length; i++) {
        if (this.viewModel.timers[i].pauseStartedAt === null) {
          return;
        }
      }
      
      // if all timers are paused then update state to paused
      this._electronService.ipcRenderer.send("timerState", "paused");
    }
  }

  public submitTimer() : void {
    TimerComponent.submitTimer(this.viewModel, this.timer, this._electronService, this._modelConverterService, this._jiraService);
  }

  public stopTimer() : void {
    TimerComponent.stopTimer(this.viewModel, this.timer, this._electronService);
  }

  public static resumeTimer(timer : Timer, electronService : ElectronService) {
    if (timer.pauseStartedAt !== null) {
      timer.pausedDuration += (Date.now() - timer.pauseStartedAt.getTime()) / 1000;
      timer.pauseStartedAt = null;
      electronService.ipcRenderer.send("timerState", "running");
    }
  }

  public static stopTimer(viewModel : ViewModel, timer : Timer, electronService : ElectronService) {
    let timerIndex = viewModel.timers.indexOf(timer);

    if (timerIndex !== -1) {
      viewModel.timers.splice(timerIndex, 1);

      let timerState = "stopped";

      for (let i = 0; i < viewModel.timers.length; i++) {
        if (viewModel.timers[i].pauseStartedAt === null) {
          return; // timer state is still running
        }
        else {
          timerState = "paused";
        }
      }

      timer.connection.historyChanged = true;
      electronService.ipcRenderer.send("timerState", timerState);

      if (viewModel.selectedTimer === timer) {
        viewModel.selectedTimer = viewModel.timers.length !== 0 ? viewModel.timers[0] : null;
      }
    }
  }

  public static submitTimer(
      viewModel : ViewModel,
      timer : Timer,
      electronService : ElectronService,
      modelConverterService : ModelConverterService,
      jiraSerivce : JiraService) {
    this.resumeTimer(timer, electronService);

    const now = new Date();
    const duration = Math.floor((now.getTime() - timer.startedAt.getTime()) / 1000 - timer.pausedDuration);

    const history : WorklogHistory = {
      description: timer.description,
      endedAt: now,
      isInEditMode: false,
      pausedDuration: timer.pausedDuration,
      startedAt: timer.startedAt,
      worklogIds: null,
      jiras: timer.jiras
    };

    timer.connection.history.push(history);
    timer.connection.history.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());

    if (timer.connection.history.length > 200) {
      timer.connection.history.pop();
    }

    timer.connection.historyChanged = true;
    this.stopTimer(viewModel, timer, electronService);

    if (timer.jiras.length !== 0) {
      jiraSerivce.submitWorklog(timer.connection, timer.jiras, timer.startedAt, duration, timer.description, worklogIds => {
        history.worklogIds = worklogIds;
        electronService.ipcRenderer.send("userData", modelConverterService.toUserData(viewModel));
      });
    }
    else {
      history.worklogIds = [];
      electronService.ipcRenderer.send("userData", modelConverterService.toUserData(viewModel));
    }

    if (viewModel.timers.length === 0 && viewModel.settings.keepTimerRunning) {
      TimerComponent.startTimer(viewModel, electronService);
    }
  }

  public static startTimer(viewModel : ViewModel, electronService : ElectronService) {
    const now = new Date();

    const timer : Timer = {
      connection: viewModel.selectedConnection,
      startedAt: now,
      pausedDuration: 0,
      description: "",
      jiras: [],
      pauseStartedAt: null,
      currentDuration: "00:00"
    };

    viewModel.timers.push(timer);
    viewModel.selectedTimer = timer;
    electronService.ipcRenderer.send("timerState", "running");
  }

  public openJiraInBrowser(jira) : void {
    this._electronService.ipcRenderer.send("openUrl", "https://" + this.viewModel.selectedConnection.hostname + "/browse/" + jira.key)
  }
}
