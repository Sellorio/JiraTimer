import { Component, OnInit, Input, ApplicationRef } from '@angular/core';
import { ViewModel } from '../model/viewmodel';
import { ElectronService } from 'ngx-electron';
import { TimeSpan } from '../time-span';
import { TimerComponent } from '../timer/timer.component';
import { ModelConverterService } from '../model-converter.service';
import { JiraService } from '../jira.service';

@Component({
  selector: 'app-timers',
  templateUrl: './timers.component.html',
  styleUrls: ['./timers.component.scss']
})
export class TimersComponent implements OnInit {
  @Input() viewModel: ViewModel;

  constructor(
    private readonly electronService: ElectronService,
    private readonly modelConveterService: ModelConverterService,
    private readonly jiraService: JiraService,
    private readonly applicationRef: ApplicationRef) {}

  ngOnInit() {
    if (this.viewModel.settings.startTimerOnStartup && this.viewModel.selectedConnection !== null) {
      this.startTimer();
    }

    setInterval(() => {
      TimersComponent.updateTimers(this.viewModel);
      this.applicationRef.tick();
    }, 50);
  }

  public startTimer() {
    TimerComponent.startTimer(this.viewModel, this.electronService);
    this.applicationRef.tick();
  }

  public submitAllTimers(): void {
    if (this.viewModel.timers.length !== 0) {
      while (this.viewModel.timers.length !== 0) {
        TimerComponent.submitTimer(
          this.viewModel,
          this.viewModel.timers[0],
          this.electronService,
          this.modelConveterService,
          this.jiraService);
      }

      this.applicationRef.tick();
    }
  }

  private static updateTimers(viewModel: ViewModel): void {
    const now = new Date();

    for (const timer of viewModel.timers) {
      if (timer.pauseStartedAt === null) {
        const time = now.getTime() - timer.startedAt.getTime() - timer.pausedDuration * 1000;
        timer.currentDuration = TimeSpan.fromTime(time).toString();
      }
    }
  }
}
