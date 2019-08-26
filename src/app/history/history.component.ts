import { Component, OnInit, Input, ApplicationRef } from '@angular/core';
import { Connection } from '../model/connection';
import { GroupedHistory } from '../model/grouped-history';
import { ViewModel } from '../model/viewmodel';
import { TimeSpan } from '../time-span';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {
  @Input() viewModel: ViewModel;
  @Input() connection: Connection;

  private historyConnection: Connection;
  private groupedHistory: GroupedHistory[];

  public getGroupedHistoryItems(): GroupedHistory[] {
    if (this.connection.historyChanged === true || this.historyConnection !== this.connection) {
      this.groupedHistory = GroupedHistory.create(this.connection.history);
      this.historyConnection = this.connection;
      this.connection.historyChanged = false;
    }

    const now = new Date();
    const today = now.toDateString();

    if (this.viewModel.timers.length > 0) { // only change value if a timer is ticking
      for (const group of this.groupedHistory) {
        if (group.date.toDateString() === today) {
          let totalSeconds = 0;

          for (const history of group.items) {
            totalSeconds +=
              Math.floor(
                (history.endedAt.getTime() - history.startedAt.getTime() - history.pausedDuration * 1000) / 1000);
          }

          for (const timer of this.viewModel.timers) {
            totalSeconds +=
              Math.floor(
                ((timer.pauseStartedAt || now).getTime() - timer.startedAt.getTime() - timer.pausedDuration * 1000) / 1000);
          }

          group.totalDuration = TimeSpan.fromTime(totalSeconds * 1000).toString();
          break;
        } else if (group.date < now) { // forward dating not supported but this will be 1 less thing to change if we do
          break;
        }
      }
    }

    return this.groupedHistory;
  }
}
