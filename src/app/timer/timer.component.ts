import { Component, OnInit, Input } from '@angular/core';
import { Timer } from '../model/timer';
import { ViewModel } from '../model/viewmodel';
import { JiraService } from '../jira.service';
import { Jira } from '../model/jira';
import { WorklogHistory } from '../model/worklog-history';
import { ElectronService } from 'ngx-electron';

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

  constructor(private _jiraService : JiraService, private _electronService : ElectronService) { }

  ngOnInit() {
    this.randomisedDescriptionPlaceholder = RandomPlaceholders[Math.floor(Math.random() * RandomPlaceholders.length)];
    this.setFormattedStartTime();
  }

  public selectTimer() : void {
    this.viewModel.selectedTimer = this.timer;
  }

  public setFormattedStartTime() : void {
    let hours = this.timer.startedAt.getHours();
    let minutes = this.timer.startedAt.getMinutes();
    let seconds = this.timer.startedAt.getSeconds();

    this.formattedStartTime =
      (hours > 9 ? hours.toString() : "0" + hours.toString())
      + ":"
      + (minutes > 9 ? minutes.toString() : "0" + minutes.toString())
      + ":"
      + (seconds > 9 ? seconds.toString() : "0" + seconds.toString());
  }

  public startTimeChanged() : void {
    let match = /^([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})$/.exec(this.formattedStartTime);

    if (match === null) {
      alert("Invalid time format. Please pass in as hours:minutes:seconds.");
      return;
    }

    let hours = parseInt(match[1]);
    let minutes = parseInt(match[2]);
    let seconds = parseInt(match[3]);

    if (hours > 23) {
      alert("Invalid time. Hours cannot be greater than 23.");
      return;
    }
    
    if (minutes > 59) {
      alert("Invalid time. Minutes cannot be greater than 59.");
      return;
    }
    
    if (seconds > 59) {
      alert("Invalid time. Seconds cannot be greater than 59.");
      return;
    }

    let newTime = new Date(this.timer.startedAt.getTime());
    newTime.setHours(hours);
    newTime.setMinutes(minutes);
    newTime.setSeconds(seconds);

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
    }
  }

  public pauseTimer() : void {
    if (this.timer.pauseStartedAt === null) {
      this.timer.pauseStartedAt = new Date();
    }
  }

  public submitTimer() : void {
    this.resumeTimer();

    let now = new Date();
    let duration = (now.getTime() - this.timer.startedAt.getTime()) / 1000 - this.timer.pausedDuration;

    let history : WorklogHistory = {
      description: this.timer.description,
      endedAt: now,
      isInEditMode: false,
      pausedDuration: this.timer.pausedDuration,
      startedAt: this.timer.startedAt,
      worklogIds: null
    };

    this.timer.connection.history.unshift(history);
    this.stopTimer();

    this._jiraService.submitWorklog(this.timer.connection, this.timer.jiras, this.timer.startedAt, duration, this.timer.description, worklogIds => {
      history.worklogIds = worklogIds;
    });
  }

  public stopTimer() : void {
    let timerIndex = this.viewModel.timers.indexOf(this.timer);

    if (timerIndex !== -1) {
      this.viewModel.timers.splice(timerIndex, 1);

      if (this.viewModel.selectedTimer === this.timer) {
        this.viewModel.selectedTimer = this.viewModel.timers.length !== 0 ? this.viewModel.timers[0] : null;
      }
    }
  }

  public openJiraInBrowser(jira) : void {
    this._electronService.ipcRenderer.send("openUrl", "https://" + this.viewModel.selectedConnection.hostname + "/browse/" + jira.key)
  }
}
