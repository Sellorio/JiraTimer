import { Component, OnInit, Input } from '@angular/core';
import { Connection } from '../model/connection';
import { GroupedHistory } from '../model/grouped-history';
import { ViewModel } from '../model/viewmodel';
import { TimeSpan } from '../time-span';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
    @Input() viewModel : ViewModel;
    @Input() connection : Connection;
    private _historyConnection : Connection;
    private _groupedHistory : GroupedHistory[]

    constructor() { }

    ngOnInit() {
    }

    public getGroupedHistoryItems() : GroupedHistory[] {
        if (this.connection.historyChanged === true || this._historyConnection !== this.connection) {
            this._groupedHistory = GroupedHistory.create(this.connection.history);
            this._historyConnection = this.connection;
            this.connection.historyChanged = false;
        }

        const now = new Date();
        const today = now.toDateString();

        if (this.viewModel.timers.length > 0) { // only change value if a timer is ticking
            for (let groupIndex = 0; groupIndex < this._groupedHistory.length; groupIndex++) {
                const group = this._groupedHistory[groupIndex];

                if (group.date.toDateString() === today) {
                    let totalTime = 0;

                    for (let historyIndex = 0; historyIndex < group.items.length; historyIndex++) {
                        const history = group.items[historyIndex];
                        totalTime += history.endedAt.getTime() - history.startedAt.getTime() - history.pausedDuration * 1000;
                    }

                    for (let timerIndex = 0; timerIndex < this.viewModel.timers.length; timerIndex++) {
                        const timer = this.viewModel.timers[timerIndex];
                        totalTime += (timer.pauseStartedAt || now).getTime() - timer.startedAt.getTime() - timer.pausedDuration * 1000;
                    }

                    group.totalDuration = TimeSpan.fromTime(totalTime).toString();
                    break;
                }
                else if (group.date < now) { // forward dating not supported but this will be 1 less thing to change if we do
                    break;
                }
            }
        }
        
        return this._groupedHistory;
    }
}
