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
    if (this.timer.pauseStartedAt !== null) {
      this.timer.pausedDuration += (Date.now() - this.timer.pauseStartedAt.getTime()) / 1000;
      this.timer.pauseStartedAt = null;
      this._electronService.ipcRenderer.send("timerState", "running");
    }
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
    this.resumeTimer();

    let now = new Date();
    now.setMilliseconds(0);
    let duration = (now.getTime() - this.timer.startedAt.getTime()) / 1000 - this.timer.pausedDuration;

    let history : WorklogHistory = {
      description: this.timer.description,
      endedAt: now,
      isInEditMode: false,
      pausedDuration: this.timer.pausedDuration,
      startedAt: this.timer.startedAt,
      worklogIds: null,
      jiras: this.timer.jiras
    };

    this.timer.connection.history.unshift(history);
    this.timer.connection.history.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
    this.timer.connection.historyChanged = true;
    this.stopTimer();

    if (this.timer.jiras.length !== 0) {
      this._jiraService.submitWorklog(this.timer.connection, this.timer.jiras, this.timer.startedAt, duration, this.timer.description, worklogIds => {
        history.worklogIds = worklogIds;
        this._electronService.ipcRenderer.send("userData", this._modelConverterService.toUserData(this.viewModel));
      });
    }
    else {
      history.worklogIds = [];
      this._electronService.ipcRenderer.send("userData", this._modelConverterService.toUserData(this.viewModel));
    }
  }

  public stopTimer() : void {
    let timerIndex = this.viewModel.timers.indexOf(this.timer);

    if (timerIndex !== -1) {
      this.viewModel.timers.splice(timerIndex, 1);

      let timerState = "stopped";

      for (let i = 0; i < this.viewModel.timers.length; i++) {
        if (this.viewModel.timers[i].pauseStartedAt === null) {
          return; // timer state is still running
        }
        else {
          timerState = "paused";
        }
      }

      this._electronService.ipcRenderer.send("timerState", timerState);

      if (this.viewModel.selectedTimer === this.timer) {
        this.viewModel.selectedTimer = this.viewModel.timers.length !== 0 ? this.viewModel.timers[0] : null;
      }
    }
  }

  public openJiraInBrowser(jira) : void {
    this._electronService.ipcRenderer.send("openUrl", "https://" + this.viewModel.selectedConnection.hostname + "/browse/" + jira.key)
  }
}
