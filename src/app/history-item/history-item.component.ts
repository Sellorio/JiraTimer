import { Component, OnInit, Input } from '@angular/core';
import { Connection } from '../model/connection';
import { WorklogHistory } from '../model/worklog-history';
import { TimeSpan } from '../time-span';
import { JiraService } from '../jira.service';
import { ElectronService } from 'ngx-electron';
import { ModelConverterService } from '../model-converter.service';
import { ViewModel } from '../model/viewmodel';

@Component({
    selector: 'app-history-item',
    templateUrl: './history-item.component.html',
    styleUrls: ['./history-item.component.css']
})
export class HistoryItemComponent implements OnInit {
    @Input() viewModel : ViewModel;
    @Input() connection : Connection;
    @Input() item : WorklogHistory;

    description : string;
    startedAt : string;
    simpleStartedAt : string;
    endedAt : string;
    duration : string;
    simpleDuration: string;
    pausedDuration : string;

    constructor(private _jiraService : JiraService, private _electronService : ElectronService, private _modelConverterService : ModelConverterService) { }

    ngOnInit() {
        this.description = this.item.description;
        this.startedAt = TimeSpan.fromDate(this.item.startedAt).toString();
        this.endedAt = TimeSpan.fromDate(this.item.endedAt).toString();
        this.duration = TimeSpan.fromTime(this.item.endedAt.getTime() - this.item.startedAt.getTime() - this.item.pausedDuration * 1000).toString();
        this.pausedDuration = TimeSpan.fromTime(this.item.pausedDuration * 1000).toString();

        this.simpleStartedAt = this.startedAt.substr(0, this.startedAt.length - 3);
        this.simpleDuration = this.duration.substr(0, this.duration.length - 3);
    }

    public deleteItem() {
        this._jiraService.deleteWorklog(this.connection, this.item.jiras, this.item.worklogIds);
        let indexOfItem = this.connection.history.indexOf(this.item);
        this.connection.history.splice(indexOfItem, 1);
        this.connection.historyChanged = true;
        this._electronService.ipcRenderer.send("userData", this._modelConverterService.toUserData(this.viewModel));
    }

    public itemEdited() {
        let originalDuration = TimeSpan.fromTime(this.item.endedAt.getTime() - this.item.startedAt.getTime() - this.item.pausedDuration * 1000);

        try {
            let newStartedAt = TimeSpan.parse(this.startedAt).toDate(this.item.startedAt);
            let newEndedAt = TimeSpan.parse(this.endedAt).toDate(this.item.endedAt);
            let newDuration = TimeSpan.parse(this.duration);
            let newPausedDuration = TimeSpan.parse(this.pausedDuration);

            if (newDuration.toTime() !== originalDuration.toTime()) {
                newEndedAt = TimeSpan.fromTime(newDuration.toTime() - originalDuration.toTime()).addTo(newEndedAt);
            }

            if (newStartedAt.getTime() !== this.item.startedAt.getTime()
                    || newEndedAt.getTime() !== this.item.endedAt.getTime()
                    || this.description !== this.item.description
                    || newPausedDuration.toTime() !== this.item.pausedDuration * 1000) {
                let calculatedDurationAsTime = newEndedAt.getTime() - newStartedAt.getTime() - newPausedDuration.toTime();

                if (calculatedDurationAsTime < 0) {
                    alert("Cannot update timer to a less than zero-length duration.");
                    return;
                }

                this.item.description = this.description;
                this.item.startedAt = newStartedAt;
                this.item.endedAt = newEndedAt;
                this.item.pausedDuration = Math.floor(newPausedDuration.toTime() / 1000);
                this.endedAt = TimeSpan.fromDate(newEndedAt).toString();
                this.duration = TimeSpan.fromTime(calculatedDurationAsTime).toString();

                this.simpleStartedAt = this.startedAt.substr(0, this.startedAt.length - 3);
                this.simpleDuration = this.duration.substr(0, this.duration.length - 3);

                this._jiraService.updateWorklog(
                    this.connection,
                    this.item.jiras,
                    this.item.worklogIds,
                    this.item.startedAt,
                    Math.floor(calculatedDurationAsTime / 1000),
                    this.item.description);

                this.connection.history.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
                this.connection.historyChanged = true;
                this._electronService.ipcRenderer.send("userData", this._modelConverterService.toUserData(this.viewModel));
            }
        }
        catch (err) {
            alert(err);
            return;
        }
    }

    public openJiraInBrowser(jira) : void {
        this._electronService.ipcRenderer.send("openUrl", "https://" + this.connection.hostname + "/browse/" + jira.key)
    }
}
