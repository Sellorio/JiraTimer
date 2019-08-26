import { Component, OnInit, Input, ApplicationRef } from '@angular/core';
import { Timer } from '../model/timer';
import { ViewModel } from '../model/viewmodel';
import { JiraService } from '../jira.service';
import { Jira } from '../model/jira';
import { WorklogHistory } from '../model/worklog-history';
import { ElectronService } from 'ngx-electron';
import { TimeSpan } from '../time-span';
import { ModelConverterService } from '../model-converter.service';

const RandomPlaceholders = [
  'Accidentally googled cat photos',
  'Waiting for Visual Studio to update',
  'Admiring my work',
  'Ranting about other people\'s code',
  'Quickly checking my reddit.....',
  'I didn\'t test this... I hope it works...',
  'Playing minecraft in a console window',
  'Waiting for Star Citizen to release',
  'Was \'the cake\' a lie? Discuss.',
  'Laughing way too loudly',
  'Half of all programmers are below average',
  'Letting the compiler find what\'s broken',
  'Thinking of a good worklog description',
  'Pretending to work (manager is near)',
  'Writing passive aggressive messages',
  'Lost in thought',
  'Waiting for a code review',
  'Looking forward to the weekend',
  'Avoiding that annoying task',
  'Sucking up to the boss'
];

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {
  @Input() viewModel: ViewModel;
  @Input() timer: Timer;

  manualJiraKey: string;
  formattedStartTime: string;
  randomisedDescriptionPlaceholder: string;

  constructor(
    private readonly jiraService: JiraService,
    private readonly electronService: ElectronService,
    private readonly modelConverterService: ModelConverterService,
    private readonly applicationRef: ApplicationRef) {}

  ngOnInit() {
    this.randomisedDescriptionPlaceholder = RandomPlaceholders[Math.floor(Math.random() * RandomPlaceholders.length)];
    this.formattedStartTime = TimeSpan.fromDate(this.timer.startedAt).toString();
  }

  public selectTimer(): void {
    this.viewModel.selectedTimer = this.timer;
    this.applicationRef.tick();
  }

  public startTimeChanged(): void {
    let timeSpan: TimeSpan;

    try {
      timeSpan = TimeSpan.parse(this.formattedStartTime);
    } catch (err) {
      alert(err);
      return;
    }

    const newTime = new Date(this.timer.startedAt.getTime());
    newTime.setHours(timeSpan.hours);
    newTime.setMinutes(timeSpan.minutes);
    newTime.setSeconds(timeSpan.seconds);
    newTime.setMilliseconds(0);

    const currentPausedDuration =
      this.timer.pauseStartedAt === null
        ? this.timer.pausedDuration
        : this.timer.pausedDuration + (Date.now() - this.timer.pauseStartedAt.getTime()) / 1000;

    if (Date.now() - newTime.getTime() - currentPausedDuration < 0) {
      alert('Invalid time. Setting this start time will result in a timer of negative duration.');
      return;
    }

    this.timer.startedAt = newTime;
    this.applicationRef.tick();
  }

  public addManualJiraToTimer(): void {
    if (this.manualJiraKey) {
      const jiraKey = this.manualJiraKey.toUpperCase().trim();

      if (/[A-Z0-9]+-[0-9]+/.test(jiraKey)) {
        this.jiraService.validateJiraKey(
          this.timer.connection,
          jiraKey,
          summary => {
            this.manualJiraKey = '';

            if (this.timer.connection.jirasAssignedToMe !== null) {
              for (const jira of this.timer.connection.jirasAssignedToMe) {
                if (jira.key === jiraKey) {
                  this.timer.jiras.push(jira);
                  this.applicationRef.tick();
                  return;
                }
              }
            }

            if (this.timer.connection.jirasRecentlyViewed !== null) {
              for (const jira of this.timer.connection.jirasRecentlyViewed) {
                if (jira.key === jiraKey) {
                  this.timer.jiras.push(jira);
                  this.applicationRef.tick();
                  return;
                }
              }
            }

            this.timer.jiras.push({
              key: jiraKey,
              summary
            });

            this.applicationRef.tick();
          },
          () => {
            alert('Jira not found.');
          });
      } else {
        alert('Invalid jira key format.');
      }
    }
  }

  public removeJira(jira: Jira): void {
    const indexOfJira = this.timer.jiras.indexOf(jira);

    if (indexOfJira !== -1) {
      this.timer.jiras.splice(indexOfJira, 1);
    }

    this.applicationRef.tick();
  }

  public resumeTimer(): void {
    TimerComponent.resumeTimer(this.timer, this.electronService);
    this.applicationRef.tick();
  }

  public pauseTimer(): void {
    if (this.timer.pauseStartedAt === null) {
      this.timer.pauseStartedAt = new Date();

      for (const timer of this.viewModel.timers) {
        if (timer.pauseStartedAt === null) {
          return;
        }
      }

      this.applicationRef.tick();
      // if all timers are paused then update state to paused
      this.electronService.ipcRenderer.send('timerState', 'paused');
    }
  }

  public submitTimer(): void {
    TimerComponent.submitTimer(this.viewModel, this.timer, this.electronService, this.modelConverterService, this.jiraService);
    this.applicationRef.tick();
  }

  public stopTimer(): void {
    TimerComponent.stopTimer(this.viewModel, this.timer, this.electronService);
    this.applicationRef.tick();
  }

  public openJiraInBrowser(jira): void {
    this.electronService.ipcRenderer.send('openUrl', `https://${this.viewModel.selectedConnection.hostname}/browse/${jira.key}`);
  }

  public static resumeTimer(timer: Timer, electronService: ElectronService) {
    if (timer.pauseStartedAt !== null) {
      timer.pausedDuration += (Date.now() - timer.pauseStartedAt.getTime()) / 1000;
      timer.pauseStartedAt = null;
      electronService.ipcRenderer.send('timerState', 'running');
    }
  }

  public static stopTimer(viewModel: ViewModel, timer: Timer, electronService: ElectronService) {
    const timerIndex = viewModel.timers.indexOf(timer);

    if (timerIndex !== -1) {
      viewModel.timers.splice(timerIndex, 1);

      let timerState = 'stopped';

      for (const otherTimer of viewModel.timers) {
        if (otherTimer.pauseStartedAt === null) {
          return; // timer state is still running
        } else {
          timerState = 'paused';
        }
      }

      timer.connection.historyChanged = true;
      electronService.ipcRenderer.send('timerState', timerState);

      if (viewModel.selectedTimer === timer) {
        viewModel.selectedTimer = viewModel.timers.length !== 0 ? viewModel.timers[0] : null;
      }
    }
  }

  public static submitTimer(
      viewModel: ViewModel,
      timer: Timer,
      electronService: ElectronService,
      modelConverterService: ModelConverterService,
      jiraSerivce: JiraService) {
    this.resumeTimer(timer, electronService);

    const now = new Date();
    const duration = Math.floor((now.getTime() - timer.startedAt.getTime()) / 1000 - timer.pausedDuration);

    const history: WorklogHistory = {
      description: timer.description,
      endedAt: now,
      isInEditMode: false,
      pausedDuration: timer.pausedDuration,
      startedAt: timer.startedAt,
      worklogIds: null,
      jiras: timer.jiras
    };

    timer.connection.history.push(history);
    timer.connection.history.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

    if (timer.connection.history.length > 200) {
      timer.connection.history.pop();
    }

    timer.connection.historyChanged = true;
    this.stopTimer(viewModel, timer, electronService);

    if (timer.jiras.length !== 0) {
      jiraSerivce.submitWorklog(timer.connection, timer.jiras, timer.startedAt, duration, timer.description, worklogIds => {
        history.worklogIds = worklogIds;
        electronService.ipcRenderer.send('userData', modelConverterService.toUserData(viewModel));
      });
    } else {
      history.worklogIds = [];
      electronService.ipcRenderer.send('userData', modelConverterService.toUserData(viewModel));
    }

    if (viewModel.timers.length === 0 && viewModel.settings.keepTimerRunning) {
      TimerComponent.startTimer(viewModel, electronService);
    }
  }

  public static startTimer(viewModel: ViewModel, electronService: ElectronService) {
    const now = new Date();

    const timer: Timer = {
      connection: viewModel.selectedConnection,
      startedAt: now,
      pausedDuration: 0,
      description: '',
      jiras: [],
      pauseStartedAt: null,
      currentDuration: '00:00'
    };

    viewModel.timers.push(timer);
    viewModel.selectedTimer = timer;
    electronService.ipcRenderer.send('timerState', 'running');
  }
}
